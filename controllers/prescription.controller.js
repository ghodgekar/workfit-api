const db = require('../config/dbconnection');
require('dotenv').config();
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment')
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');
const nodemailer = require('nodemailer');
const config_url = require('../config/config.json');
const adjunctController = require("./adjunct.controller");
const videoController = require("./video.controller")
const instructionController = require("./instruction.controller")
const htmlPDF = require('html-pdf');


async function validateAddRequest(req) {
    if (!req.patient_name) {
        return { status: false, msg: "Please Enter Patient Name" }
    }
    if (!req.patient_email) {
        return { status: false, msg: "Please Enter Patient Email" }
    }
    if (!req.patient_age) {
        return { status: false, msg: "Please Enter Patient Age" }
    }
    if (!req.patient_gender) {
        return { status: false, msg: "Please Enter Patient Gender" }
    }
    if (!req.date_of_evaluation) {
        return { status: false, msg: "Please Enter Date Of Evaluation" }
    }

    return { status: true }
}

module.exports.addPrescription = async (req) => {
    console.log("Prescription Request", req)
    let email_sent = 0, prescription_id
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let patientObj = await processPatient(req)
    if (req.exercise_arr && req.exercise_arr.length > 0) {
        if (req.exercise_arr && req.exercise_arr.length > 0) {
            for (let i = 0; i < req.exercise_arr.length; i++) {
                req.exercise_arr[i].start_date = moment().format("yyyy-MM-DD")
                req.exercise_arr[i].end_date = moment().add(Number(req.exercise_arr[i].exercise_days), 'D').format('YYYY-MM-DD')
                let email = req.patient_email.replace(/\./g, "_")
                let fileName = email + "_" + req.exercise_arr[i].exercise_name + "_" + moment().format('MMMM_DD_YYYY') + '_audio.mp3';
                await generateAudio(req.exercise_arr[i], fileName)
                req.exercise_arr[i].audioFilePath = "/uploads/audios/" + fileName
                let videoObj = await getVideoObj(req.exercise_arr[i].exercise_video_id);
                req.exercise_arr[i].videoObj = videoObj;
                let instructionObj = await getInstructionObj(req.exercise_arr[i].exercise_instruction_id)
                req.exercise_arr[i].instructionObj = instructionObj
                // return true
            }
        }
        // console.log("req.exercise_arr", req.exercise_arr);
        // let adjunctArr = await getAdjuncts(req.adjunct);
        // req.adjunct = adjunctArr

        prescription_id = await addPrescriptionToDb(req, patientObj)
        if (req.exercise_arr && req.exercise_arr.length > 0) {
            for (exercise of req.exercise_arr) {
                insertExerciseTrack(exercise, prescription_id)
            }
        }
    }

    if ((req.exercise_arr && req.exercise_arr.length > 0) || req.generate_bill) {
        sendMail(req, prescription_id) 
    }

    return ({ status: true, prescription_id: prescription_id, msg: "Prescription sent successfully" });
    // console.log("result", result);

}

async function sendMail(req, prescription_id) {
    let html = await generateEmailTemplate(req, prescription_id)
    let subject= `E-Prescription For- ${req.patient_name} `
    var mailOptions = {
        from: config_url.smtp.auth.user,
        to: req.patient_email,
        subject: subject,
        html: html
    };
    if (req.generate_bill) {
        let pdfBuffer = await generatePDF(req);
        if (pdfBuffer) {
            mailOptions.attachments = { filename: "Bill.pdf", content: pdfBuffer };
        }
    }

    var transporter = nodemailer.createTransport({
        host: config_url.smtp.host, // hostname
        secureConnection: true, // use SSL
        port: 465, // port for secure SMTP
        auth: {
            user: config_url.smtp.auth.user,
            pass: config_url.smtp.auth.pass
        }
    });

    transporter.sendMail(mailOptions, async function (error, info) {
        if (error) {
            console.log(error);
            return false
        } else {
            console.log('Email sent: ' + info.response);
            updateEmailSent(prescription_id)
            return true
        }
    });
}

async function getVideoObj(video_id) {
    console.log("video_id",video_id);
    let video = await videoController.videoList({ query: {video_id:video_id}})
    console.log("video",video);

    return video.data[0]
}

async function getInstructionObj(instruction_id) {
    let instruction = await instructionController.getInstruction({ query: { instruction_id: instruction_id } })

    return instruction.data[0]
}

async function getAdjuncts(adjunctArr) {
    let arr = []
    for (let i = 0; i < adjunctArr.length; i++) {
        console.log(adjunctArr[i]);
        let adjunct = await adjunctController.ajunctList({ query: { adjunct_id: parseInt(adjunctArr[i]) } })
        console.log("adjunct---------------------", adjunct);
        arr.push(adjunct.data[0])
    }
    return arr
}

async function updateEmailSent(prescription_id) {
    let query = "UPDATE mst_prescription SET email_sent = ? WHERE prescription_id = ?"
    let values = [1, prescription_id]
    await db.executevaluesquery(query, values)
}


async function generateEmailTemplate(req, prescription_id) {
    let selectedTemplate = await getTemplate(config_url.template.prescription_email)

    let html = selectedTemplate.template_content;
    let prescription_link = ""
    if (req.exercise_arr && req.exercise_arr.length > 0) {
        prescription_link += "<p>Please click on the link below to find your prescription.</p>";
        prescription_link += config_url.adminurl + "Prescription?prescription_id=" + prescription_id;
    }
    html = html.replace("{{prescription_link}}", prescription_link)

    return html
}

async function getTemplate(code) {
    let query = `select template_content from mst_email_templates where isActive=? AND template_code=?`
    let values = [1, code]
    let templateData = await db.executevaluesquery(query, values)
    if (templateData && templateData.length) return templateData[0]
    return false
}

async function getDoctorData(doctorId) {
    let query = `SELECT * FROM mst_doctors where doctor_Id = ?`;
    let values = [doctorId];
    let doctorData = await db.executevaluesquery(query, values)
    if (doctorData && doctorData.length) return doctorData[0]

    return false
}

async function addPrescriptionToDb(req, patient_obj) {
    let query = `INSERT INTO mst_prescription
      (doctor_id, patient_id, prescription_c_o, date_of_evaluation, doctor_advice, instruction_note, exercise_arr, doctor_note, adjunct, patient_obj, scales_obj)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`;
    let values = [
        req.doctor_id,
        patient_obj.patient_id,
        req.prescription_c_o,
        req.date_of_evaluation,
        req.doctor_advice && req.doctor_advice.length ? JSON.stringify(Object.assign({}, req.doctor_advice)) : null,
        req.instruction_note,
        req.exercise_arr && req.exercise_arr.length ? JSON.stringify(Object.assign({}, req.exercise_arr)) : null,
        req.doctor_note,
        req.adjunct && req.adjunct.length ? JSON.stringify(Object.assign({}, req.adjunct)) : null,
        JSON.stringify(patient_obj),
        JSON.stringify(req.scales_obj)
    ];
    let addPrescription = await db.executevaluesquery(query, values);
    return addPrescription.insertId ? addPrescription.insertId : false
}


async function insertExerciseTrack(exercise, prescription_id) {
    // console.log("i am heree", JSON.stringify(exercise));
    for (let i = 0; i < parseInt(exercise.exercise_days); i++) {
        let date = moment(new Date()).add(i, 'days').format('YYYY-MM-DD')
        let exercise_track_query = `INSERT INTO mst_exercise_track (prescription_id,exercise_date,isCompleted,exercise_name) VALUES (?,?,?,?)`
        let values = [prescription_id, date, 0, exercise.exercise_name]
        await db.executevaluesquery(exercise_track_query, values)
    }
}

async function processPatient(req) {
    let query = `SELECT * FROM mst_patient WHERE patient_email = ? AND patient_name = ?`
    let values = [req.patient_email, req.patient_name]
    let Value1 = [req.patient_name, req.patient_age, req.patient_gender, req.patient_email, req.doctor_id,]
    let checkPatient = await db.executevaluesquery(query, values);
    let patient
    if (checkPatient.length > 0) {
        patient = checkPatient[0]
        let updateQuery = `UPDATE mst_patient SET patient_name=?,patient_age = ?,patient_gender = ?,patient_email=?,doctor_id = ? WHERE patient_id = ?`;
        Value1.push(checkPatient[0].patient_id)

        let updatePatientData = await db.executevaluesquery(updateQuery, Value1);
        return patient;
    } else {
        let insertPatient = 'INSERT INTO mst_patient (patient_name, patient_age, patient_gender, patient_email, doctor_id, isActive) VALUES (?,?,?,?,?,?)';
        Value1.push(1)
        let insertPatientData = await db.executevaluesquery(insertPatient, Value1);
        patient = {
            patient_name: req.patient_name,
            patient_age: req.patient_age,
            patient_gender: req.patient_gender,
            patient_email: req.patient_email,
            patient_id: insertPatientData.insertId
        }

        return patient;
    }

}

async function generateAudio(exercise, fileName) {

    let text = `<speak>`
    if (exercise.isTimeControlled) {
        for (let i = 1; i <= parseInt(exercise.exercise_reps); i++) {
            text += `Take your position <break time="5s"/> your time starts in 3. 2. 1. and go.<break time="1s"/>`
            for (let j = 1; j <= parseInt(exercise.exercise_time); j++) {
                text += `${j}.<break time="0.7s"/>`
            }
            if (parseInt(exercise.exercise_rests) > 0) {
                text += `and relax take rest for ${exercise.exercise_rests} counts. <break time="1s"/>`
            }
            for (let l = 1; l <= parseInt(exercise.exercise_rests); l++) {
                text += `${l}.<break time="1s"/>`
            }
            if (i < parseInt(exercise.exercise_reps)) {
                text += `.time for next round<break time="0.5s"/>`
            }
        }
    } else {
        for (let i = 1; i <= parseInt(exercise.exercise_sets); i++) {
            text += `Take your position <break time="5s"/> and start in 3. 2. 1.<break time="1s"/>`

            for (let j = 1; j <= parseInt(exercise.exercise_reps); j++) {
                if (parseInt(exercise.exercise_holds)) {
                    text += `${j}. hold <break time="1s"/>`
                    for (let k = 1; k <= parseInt(exercise.exercise_holds); k++) {
                        text += `${k}. <break time="0.5s"/> `
                    }
                    text += ` relax<break time="1s"/>`
                } else {
                    text += `${j}. <break time="0.5s"/>`
                    
                }
                
            }
            if (parseInt(exercise.exercise_rests) > 0) {
                text += `rest for ${exercise.exercise_rests} counts <break time="1s"/>`
            }
            for (let l = 1; l <= parseInt(exercise.exercise_rests); l++) {
                text += `${l}<break time="1s"/>`
            }
        }
    }
    text += `play the next exercise </speak>`
    // console.log("text", text);
    let filepath = path.join(__dirname, '../public/uploads/audios/') + fileName;

    // console.log("filepath", filepath);
    ssmlToAudio(text, filepath);

}

async function ssmlToAudio(ssmlText, outFile) {
    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();

    // Constructs the request
    const request = {
        // Select the text to synthesize
        input: { ssml: ssmlText },
        // Select the language and SSML Voice Gender (optional)
        voice: { languageCode: 'en-US', ssmlGender: 'MALE' },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.8 },

    };

    // Performs the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outFile, response.audioContent, 'binary');
    // console.log('Audio content written to file ' + outFile);
}

async function padBillNo(billNo) {
    var s = billNo.toString();
    let pads = "0000000000"
    return pads.substring(0, pads.length - s.length) + s;
};

async function getBillNumber(doctor_id) {
    let query = "select count(prescription_id) as bill_no from mst_prescription where doctor_id=?"
    let values = [doctor_id]
    let result = await db.executevaluesquery(query, values)
    let billNo = await padBillNo(result[0].bill_no)
    return billNo
}

async function generatePDF(req) {
    try {
        let selectedTemplate = await getTemplate(config_url.template.invoice);
        if (!selectedTemplate) throw `${config_url.template.invoice} template issue`;
        let doctorData = await getDoctorData(req.doctor_id);
        if (!doctorData) throw `${req.doctor_id} doesnt exist`;

        let html = selectedTemplate.template_content;

        html = html.replace("{{doctor_logo}}", doctorData.doctor_logo ? config_url.apiurl + doctorData.doctor_logo : '');
        html = html.replace("{{bill_invoice_to}}", req.bill.bill_invoice_to ?
            `<div class="flexClass">
                <div></div>
                <div>
                    <h3 class="compHead bodyFont">Invoice to -</h3>
                    <p class="compName bodyFont">${req.bill.bill_invoice_to}</p>
                </div>
             </div>`
            : '');
        html = html.replace("{{bill_patient_name}}", req.bill.bill_patient_name ? req.bill.bill_patient_name : '');
        html = html.replace("{{bill_patient_age}}", req.bill.bill_patient_age ? req.bill.bill_patient_age : '');
        html = html.replace("{{bill_patient_gender}}", req.bill.bill_patient_gender ? req.bill.bill_patient_gender : '');
        html = html.replace("{{bill_patient_address}}", req.bill.bill_patient_address ? `<p> <span class="bodyFont">Address - ${req.bill.bill_patient_address}</span></p>` : '');
        html = html.replace("{{bill_date_of_evaluation}}", req.bill.bill_date_of_evaluation ? moment(req.bill.bill_date_of_evaluation).format('DD/MM/YYYY') : '');
        html = html.replace("{{bill_time_evaluation}}", req.bill.bill_time_evaluation ? req.bill.bill_time_evaluation : '');

        let billNumber = await getBillNumber(req.doctor_id)
        html = html.replace("{{bill_no}}", billNumber);

        let consultation_charges = req.bill.is_consultation_charge ? doctorData.consultation_charge ? doctorData.consultation_charge : '0' : '0';
        html = html.replace("{{consultation_charge}}", consultation_charges);

        let treatment_charges = '0';
        if (req.bill.bill_treatment_type == 1) {
            treatment_charges = doctorData.treatment1_charge ? doctorData.treatment1_charge : '0';
        } else if (req.bill.bill_treatment_type == 2) {
            treatment_charges = doctorData.treatment2_charge ? doctorData.treatment2_charge : '0';
        } else if (req.bill.bill_treatment_type == 3) {
            treatment_charges = doctorData.treatment3_charge ? doctorData.treatment3_charge : '0';
        }
        let treatment_charge_copy = treatment_charges
        if (req.bill.bill_days > 1) {
            treatment_charges += " X " + req.bill.bill_days
        }
        html = html.replace("{{treatment_charge}}", treatment_charges);

        let bill_modality_charges = req.bill.bill_modality_charges ? req.bill.bill_modality_charges : '0';
        let bill_modality_charges_copy = bill_modality_charges
        if (req.bill.bill_days > 1) {
            bill_modality_charges += " X " + req.bill.bill_days
        }
        html = html.replace("{{bill_modality_charge}}", bill_modality_charges);

        let total = parseInt(consultation_charges) + (parseInt(treatment_charge_copy) * parseInt(req.bill.bill_days)) + (parseInt(bill_modality_charges_copy) * parseInt(req.bill.bill_days))
        html = html.replace("{{total}}", total);


        html = html.replace("{{bill_discount}}",
            req.bill.bill_discount ?
                `<tr>
                    <td class="columnleft discCol" colspan="2"> <b>Discount</b> </td>
                    <td class="columnRight"> ${req.bill.bill_discount} % </td>
                </tr>`
                :
                ""
        );
        let total_amount = 0;
        if (!req.bill.bill_discount || req.bill.bill_discount != '0') {
            let percent = parseInt(total) * (parseInt(req.bill.bill_discount) / 100);
            total_amount = parseInt(total) - percent;
        } else {
            total_amount = parseInt(total)
        }
        html = html.replace("{{total_amount}}", total_amount.toFixed(2));
        html = html.replace("{{doctor_sign}}", doctorData.doctor_sign ? config_url.apiurl + doctorData.doctor_sign : '');
        html = html.replace("{{doctor_name}}", doctorData.doctor_name ? doctorData.doctor_name : '');
        html = html.replace("{{doctor_name}}", doctorData.doctor_name ? doctorData.doctor_name : '');

        html = html.replace("{{doctor_registration_number}}",
            doctorData.registration_number ?
                `<p id="doctorName">
            <span>Registration No. -</span><br />
            <span>${doctorData.registration_number}</span>
        </p>` : '');


        let options = {
            "height": "10in",
            "width": "8in",
        }

        return new Promise((resolve, reject) => {
            htmlPDF.create(html, options).toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });
    } catch (error) {
        console.log(error);
        return false;
    }
};

exports.getPrescriptionById = async (req, res) => {
    try {
        if (!req.query.prescription_id) {
            return { status: false, msg: "please enter prescription id" }
        }
        let values = [parseInt(req.query.prescription_id)]
        let query = `SELECT MP.*, MD.doctor_name, MD.doctor_username, MD.doctor_email, MD.doctor_mobile, MPT.patient_name, MPT.patient_email FROM mst_prescription as MP JOIN mst_doctors as MD on MP.doctor_id = MD.doctor_Id JOIN mst_patient as MPT on MP.patient_id = MPT.patient_id WHERE MP.prescription_id = ?`;
        let data = await db.executevaluesquery(query, values);
        if (data.length > 0) {
            return { status: true, data: data };
        } else {
            return { status: false, msg: 'Prescription Not Found' };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}