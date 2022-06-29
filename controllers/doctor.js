const db = require('../config/dbconnection');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const formidable = require('formidable');
const path = require('path');
const moment = require('moment');
const fs = require('fs');
const nodemailer = require('nodemailer');
const config = require('../config/config.json');
const gtts = require('gtts');

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
    } else {
        try {
            let bodyObj = {
                "username": req.body.doctor_username,
                "password": req.body.doctor_password
            };
            let query = `SELECT * FROM mst_doctors where doctor_username = '${bodyObj.username}' and isActive = 1`;
            let data = await db.executequery(query);
            if (data.length > 0) {
                bcrypt.compare(bodyObj.password, data[0].doctor_password).then(response => {
                    if (response) {
                        res.send({ status: true, data: data });
                    } else {
                        res.send({ status: false, err: 'Password does not match.' });
                    }
                }).catch(err => {
                    console.log(err);
                    res.send({ status: false, err: err });
                });
            } else {
                res.send({ status: false, err: 'Username not present in DB.' });
            }
        } catch (err) {
            console.log(err);
            res.send({ status: false, err: err });
        }
    }
}

exports.signup = async (req, res) => {
    let bodyObj = {
        "doctor_name": '',
        "doctor_username": '',
        "doctor_email": '',
        "doctor_mob": '',
        "doctor_password": '',
        "doctor_degree": '',
        "specialisation": '',
        "doctor_logo": '',
        "doctor_sign": '',
        "doctor_address": '',
        "registration_number": '',
        "subscription_type": '',
        "isActive": ''
    };
    var form = await new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', function (name, file) {
        if (file.originalFilename != '' && file.originalFilename != undefined && file.originalFilename != null) {
            if (file.mimetype && file.mimetype.includes('image')) {
                let ext = file.originalFilename.split('.')[1];
                let fName = Date.now() + '_' + file.newFilename + '.' + ext;
                file.filepath = path.join(__dirname, '../public/uploads/images/') + fName;
                bodyObj[name] = fName;
            }
        }
    });
    form.on('field', function (name, value) {
        bodyObj[name] = value;
    });
    form.on('error', (err) => {
        res.send({ status: false, err: err })
    });
    form.on('end', async function () {
        let isValid = await validate(bodyObj);
        if (isValid.length > 0) {
            if (!res.headersSent) {
                res.send({ status: false, err: isValid });
                if (bodyObj.doctor_logo) {
                    deleteFile(bodyObj.doctor_logo);
                }
                if (bodyObj.doctor_sign) {
                    deleteFile(bodyObj.doctor_sign);
                }
            }
        } else {
            if (!res.headersSent) {
                bcrypt.hash(bodyObj.doctor_password, 12).then(async hashedPw => {
                    bodyObj.subscription_start_date = moment().format('YYYY-MM-DD');
                    let splitSubType = bodyObj['subscription_type'].trim().split('-');
                    if (splitSubType[1] == 'month') {
                        bodyObj.subscription_end_date = moment().add(Number(splitSubType[0]), 'M').format('YYYY-MM-DD');
                    } else if (splitSubType[1] == 'year') {
                        bodyObj.subscription_end_date = moment().add(Number(splitSubType[0]), 'y').format('YYYY-MM-DD');
                    }
                    let query = 'INSERT INTO mst_doctors(doctor_name, doctor_username, doctor_email, doctor_mob, doctor_password, doctor_degree, specialisation, doctor_logo, doctor_sign, subscription_type, subscription_start_date, subscription_end_date, isActive, doctor_address, registration_number) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                    let values = [bodyObj.doctor_name, bodyObj.doctor_username, bodyObj.doctor_email, bodyObj.doctor_mob, hashedPw, bodyObj.doctor_degree, bodyObj.specialisation, bodyObj.doctor_logo, bodyObj.doctor_sign, bodyObj.subscription_type, bodyObj.subscription_start_date, bodyObj.subscription_end_date, bodyObj.isActive, bodyObj.doctor_address, bodyObj.registration_number];
                    let data = await db.executevaluesquery(query, values);
                    if (data.insertId) {
                        res.send({ status: true, id: data.insertId, msg: 'Registered successfully!' });
                    } else {
                        res.send({ status: false, err: 'DB issue!' });
                        if (bodyObj.doctor_logo) {
                            deleteFile(bodyObj.doctor_logo);
                        }
                        if (bodyObj.doctor_sign) {
                            deleteFile(bodyObj.doctor_sign);
                        }
                    }
                }).catch(err => {
                    console.log(err);
                    res.send({ status: false, err: err });
                    if (bodyObj.doctor_logo) {
                        deleteFile(bodyObj.doctor_logo);
                    }
                    if (bodyObj.doctor_sign) {
                        deleteFile(bodyObj.doctor_sign);
                    }
                });
            }
        }
    });
}

exports.update = async (req, res) => {
    let fileChanged = false;
    let bodyObj = {
        "doctor_id": '',
        "doctor_name": '',
        "doctor_username": '',
        "doctor_email": '',
        "doctor_mob": '',
        "doctor_degree": '',
        "specialisation": '',
        "doctor_logo": '',
        "doctor_sign": '',
        "doctor_address": '',
        "registration_number": '',
        "subscription_type": '',
        "subscription_start_date": '',
        "subscription_end_date": '',
        "isActive": ''
    };
    var form = await new formidable.IncomingForm();
    form.parse(req);
    form.on('fileBegin', function (name, file) {
        if (file.originalFilename != '' && file.originalFilename != undefined && file.originalFilename != null) {
            if (file.mimetype && file.mimetype.includes('image')) {
                let ext = file.originalFilename.split('.')[1];
                let fName = Date.now() + '_' + file.newFilename + '.' + ext;
                file.filepath = path.join(__dirname, '../public/uploads/images/') + fName;
                bodyObj[name] = fName;
                fileChanged = true;
            }
        }
    });
    form.on('field', function (name, value) {
        bodyObj[name] = value;
    });
    form.on('error', (err) => {
        res.send({ status: false, err: err })
    });
    form.on('end', async function () {
        let isValid = await db.executequery(`SELECT * FROM mst_doctors where doctor_Id = ${bodyObj.doctor_id}`);
        if (isValid.length == 0) {
            if (!res.headersSent) {
                res.send({ status: false, err: "Id not present." });
            }
        } else {
            try {
                let isExist = false;
                if (isValid[0].doctor_username != bodyObj.doctor_username) {
                    isExist = await checkUsername(bodyObj.doctor_username);
                    if (isExist) {
                        if (!res.headersSent) {
                            res.send({ status: false, err: "Username already present!" });
                        }
                    }
                }
                if (!isExist) {
                    let query = `UPDATE mst_doctors SET doctor_name = '${bodyObj.doctor_name}', doctor_username = '${bodyObj.doctor_username}', doctor_email = '${bodyObj.doctor_email}', doctor_mob = '${bodyObj.doctor_mob}', doctor_degree = '${bodyObj.doctor_degree}', specialisation = '${bodyObj.specialisation}', doctor_logo = '${bodyObj.doctor_logo}', doctor_sign = '${bodyObj.doctor_sign}', subscription_type = '${bodyObj.subscription_type}', subscription_start_date = '${bodyObj.subscription_start_date}', subscription_end_date = '${bodyObj.subscription_end_date}', isActive = '${bodyObj.isActive}', doctor_address = '${bodyObj.doctor_address}', registration_number = '${bodyObj.registration_number}' WHERE doctor_Id = ${bodyObj.doctor_id}`;
                    let data = await db.executequery(query);
                    if (data.affectedRows) {
                        if (!res.headersSent) {
                            res.send({ status: true, msg: 'Updated.' });
                        }
                        if (fileChanged) {
                            deleteFile(isValid[0].doctor_logo);
                            deleteFile(isValid[0].doctor_sign);
                        }
                    } else {
                        if (!res.headersSent) {
                            res.send({ status: false, err: 'DB issue.' });
                        }
                        deleteFile(bodyObj.doctor_logo);
                        deleteFile(bodyObj.doctor_sign);
                    }
                }
            } catch (error) {
                if (!res.headersSent) {
                    res.send({ status: false, err: error });
                }
            }
        }
    });
}

exports.delete = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_doctors SET isActive = 2 WHERE doctor_Id = ${id}`;
        let data = await db.executequery(query); 
        if(data.affectedRows){
            res.send({status:true,msg:'Doctor Data Deleted Successfully.'});
        } else {
            res.send({status:false,err:'There was some DB issue.'});
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

exports.list = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY doctor_Id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY doctor_Id DESC' : '';
            }
        }
        let query = `SELECT * FROM mst_doctors where isActive=1 ${sort} ${limit}`;
        let data = await db.executequery(query);
        if (data.length > 0) {
            res.send({ status: true, data: data });
        } else {
            res.send({ status: false, err: 'DB issue!' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

exports.prescription = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
    } else {
        try {
            let bodyObj = {
                "prescription_name": req.body.prescription_name ? req.body.prescription_name : "",
                "prescription_c_o": req.body.prescription_c_o ? req.body.prescription_c_o : "",
                "findings": req.body.findings ? req.body.findings : "",
                "doctor_advice": req.body.doctor_advice ? req.body.doctor_advice : "",
                "instruction_notes": req.body.instruction_notes ? req.body.instruction_notes : "",
                "doctor_id": req.body.doctor_id,
                "date_of_evaluation": req.body.date_of_evaluation,
                "patient_age": req.body.patient_age ? req.body.patient_age : "",
                "patient_gender": req.body.patient_gender ? req.body.patient_gender : "",
                "patient_email": req.body.patient_email,
                "patient_name": req.body.patient_name,
                "exercise_Arr": req.body.exercise_Arr ? req.body.exercise_Arr : []
            };

            let selectPatient = `SELECT * FROM mst_patient WHERE patient_email = '${bodyObj.patient_email}' AND patient_name = '${bodyObj.patient_name}'`
            let checkPatient = await db.executequery(selectPatient);
            let patient_id = '';
            if (checkPatient.length > 0) {
                let updatePatient = `UPDATE mst_patient SET patient_age = '${bodyObj.patient_age ? bodyObj.patient_age : checkPatient[0].patient_age}',patient_gender = '${bodyObj.patient_gender ? bodyObj.patient_gender : checkPatient[0].patient_gender}',doctor_id = '${bodyObj.doctor_id}' WHERE patient_id = ${checkPatient[0].patient_id}`;
                let updatePatientData = await db.executequery(updatePatient);
                patient_id = checkPatient[0].patient_id;
            } else {
                let insertPatient = 'INSERT INTO mst_patient (patient_name,patient_email,patient_age,patient_gender,doctor_id,isActive) VALUES (?,?,?,?,?,?)';
                let insertPatientData = await db.executevaluesquery(insertPatient, [bodyObj.patient_name, bodyObj.patient_email, bodyObj.patient_age, bodyObj.patient_gender, bodyObj.doctor_id, 1]);
                patient_id = insertPatientData.insertId;
            }

            if (bodyObj.exercise_Arr.length > 0) {
                for (let i = 0; i < bodyObj.exercise_Arr.length; i++) {
                    let element = bodyObj.exercise_Arr[i];
                    // let text = `Exercise name ${element.exercise_name}, ${element.reps} reps, ${element.sets} sets and hold for ${element.hold}`;
                    // let text = `gasfd jshdc  hdhdb jhbx jshss cxcbhdbds v vfvjsfv fnv vn s fnsvhsbvn vwj vwvwj vwjvbwj vsd vnsdvbwr vsd v wbvnd v`;
                    let text = ``
                    for (let i = 1; i <= parseInt(element.sets); i++) {
                        text += `Take your position and start in 3 2 1!.`
                        for (let j = 1; j <= parseInt(element.hold); j++) {
                            text += `${j} hold `
                            for (let k = 1; k <= parseInt(element.reps); k++) {
                                text += `${k}!. `
                            }
                            text += `relax!.`
                        }
                        if (parseInt(element.rest) > 0) {
                            text += `rest for ${element.rest} counts `
                        }
                        for (let l = 1; l <= parseInt(element.rest); l++) {
                            text += `${l}!`
                        }
                    }
                    text += `play the next exercise`
                    console.log("text", text);

                    let fName = Date.now() + '_audio.mp3';
                    bodyObj.exercise_Arr[i].audio = fName;
                    let filepath = path.join(__dirname, '../public/uploads/audios/') + fName;
                    let audio = new gtts(text, 'en-us');
                    audio.save(filepath, function (err, result) {
                        if (err) { throw new Error(err) }
                        console.log('Audio generated.');
                    });
                }
            }

            let email_sent = 0;
            let query = 'INSERT INTO mst_prescription(doctor_id,prescription_name,patient_id,prescription_c_o,date_of_evaluation,findings,doctor_advice,instruction_notes,exercise_arr,email_sent) VALUES (?,?,?,?,?,?,?,?,?,?)';
            let values = [bodyObj.doctor_id, bodyObj.prescription_name, patient_id, bodyObj.prescription_c_o, bodyObj.date_of_evaluation, bodyObj.findings, bodyObj.doctor_advice, bodyObj.instruction_notes, JSON.stringify(bodyObj.exercise_Arr), email_sent];
            let data = await db.executevaluesquery(query, values);

            if (data.insertId) {
                if (bodyObj.exercise_Arr.length > 0) {
                    for (let i = 0; i < bodyObj.exercise_Arr.length; i++) {
                        const element = bodyObj.exercise_Arr[i];
                        let startDate = moment(element.start_date);
                        let endDate = moment(element.end_date);
                        for (let m = moment(startDate); m.isSameOrBefore(endDate); m.add(1, 'days')) {
                            let etData = await db.executequery(`INSERT INTO mst_exercise_track (prescription_id,exercise_date,isCompleted,exercise_index) VALUES (${data.insertId},'${m.format('YYYY-MM-DD')}',${0},${i})`);
                        }
                    }
                }

                let selectDoctor = `SELECT * FROM mst_doctors where doctor_Id = '${bodyObj.doctor_id}'`;
                let doctorData = await db.executequery(selectDoctor);
                let selectTemp = `SELECT * FROM mst_email_templates where template_code = '${config.template.prescription_email}' AND isActive = 1`;
                let tempData = await db.executequery(selectTemp);
                if (doctorData.length > 0 && tempData.length > 0) {
                    let html = tempData[0].template_content;
                    html = html.replace("{{doctor_logo}}", config.apiurl + 'uploads/images/' + doctorData[0].doctor_logo);
                    html = html.replace(/{{doctor_name}}/g, doctorData[0].doctor_name);
                    html = html.replace("{{doctor_address}}", doctorData[0].doctor_address);
                    html = html.replace("{{patient_name}}", bodyObj.patient_name);
                    html = html.replace("{{patient_age}}", bodyObj.patient_age);
                    html = html.replace("{{patient_gender}}", bodyObj.patient_gender);
                    html = html.replace("{{prescription_c/o}}", bodyObj.prescription_c_o);
                    html = html.replace("{{doctor_advice}}", bodyObj.doctor_advice);
                    html = html.replace("{{instruction_notes}}", bodyObj.instruction_notes);
                    html = html.replace("{{doctor_sign}}", doctorData[0].doctor_sign);
                    let excTemp = '';
                    if (bodyObj.exercise_Arr.length > 0) {
                        excTemp += '<table style="width: 100%; padding: 20px 50px;"><tbody>';
                        for (let i = 0; i < bodyObj.exercise_Arr.length; i++) {
                            let element = bodyObj.exercise_Arr[i];
                            excTemp += `<tr><td>${i + 1}${')'}</td><td>${element.exercise_name}</td><td><a href="${element.video_link}">Link</a></td><td>${element.reps} reps X ${element.sets} sets</td></tr>`;
                        }
                        excTemp += '</tbody></table>';
                    }
                    html = html.replace("{{exercise_Arr}}", excTemp);

                    var transporter = nodemailer.createTransport({
                        service: config.smtp.service,
                        auth: {
                            user: config.smtp.auth.user,
                            pass: config.smtp.auth.pass
                        }
                    });
                    var mailOptions = {
                        from: config.smtp.auth.user,
                        to: bodyObj.patient_email,
                        subject: 'Prescription',
                        html: html
                    };
                    transporter.sendMail(mailOptions, async function (error, info) {
                        if (error) {
                            console.log(error);
                            res.send({ status: true, id: data.insertId, email_sent: email_sent });
                        } else {
                            console.log('Email sent: ' + info.response);
                            email_sent = 1;
                            let updateEmailStatus = await db.executequery(`UPDATE mst_prescription SET email_sent = ${email_sent} WHERE prescription_id = ${data.insertId}`);
                            res.send({ status: true, id: data.insertId, email_sent: email_sent });
                        }
                    });
                } else {
                    res.send({ status: true, id: data.insertId, email_sent: email_sent });
                }
            } else {
                res.send({ status: false, err: 'DB issue!' });
            }
        } catch (err) {
            console.log(err);
            res.send({ status: false, err: err });
        }
    }
}

exports.updateExTrack = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
    } else {
        try {
            let bodyObj = {
                "prescription_id": req.body.prescription_id,
                "exercise_date": req.body.exercise_date,
                "exercise_index": req.body.exercise_index
            };
            let query = `UPDATE mst_exercise_track SET isCompleted = 1 WHERE prescription_id = ${bodyObj.prescription_id} AND exercise_date = '${bodyObj.exercise_date}' AND exercise_index = ${bodyObj.exercise_index}`;
            let data = await db.executequery(query);
            if (data.affectedRows) {
                res.send({ status: true, msg: 'Updated.' });
            } else {
                res.send({ status: false, err: 'DB issue.' });
            }
        } catch (err) {
            console.log(err);
            res.send({ status: false, err: err });
        }
    }
}

exports.getPrescriptionById = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `SELECT MP.*, MD.doctor_name, MD.doctor_username, MD.doctor_email, MD.doctor_mob, MPT.patient_name, MPT.patient_email FROM mst_prescription as MP JOIN mst_doctors as MD on MP.doctor_id = MD.doctor_Id JOIN mst_patient as MPT on MP.patient_id = MPT.patient_id WHERE MP.prescription_id = ${id}`;
        let data = await db.executequery(query);
        if (data.length > 0) {
            res.send({ status: true, data: data });
        } else {
            res.send({ status: false, err: 'DB issue.' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

exports.getDoctorById = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `SELECT * FROM mst_doctors WHERE doctor_Id = ${id}`;
        let data = await db.executequery(query);
        if (data.length > 0) {
            res.send({ status: true, data: data });
        } else {
            res.send({ status: false, err: 'DB issue.' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

async function validate(Obj) {
    let validArr = [];
    if (Obj['doctor_username']) {
        let isExist = await checkUsername(Obj['doctor_username']);
        if (isExist) {
            validArr.push({ name: 'doctor_username', msg: 'Username already present!' });
        }
    } else {
        validArr.push({ name: 'doctor_username', msg: 'Username required!' });
    }
    if (Obj['doctor_password']) {
        if (Obj['doctor_password'].trim().length < 4) {
            validArr.push({ name: 'doctor_password', msg: 'Password < 4' });
        }
    } else {
        validArr.push({ name: 'doctor_password', msg: 'Password required!' });
    }
    if (Obj['doctor_email']) {
        let regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!Obj['doctor_email'].trim().match(regexp)) {
            validArr.push({ name: 'doctor_email', msg: 'Invalid email!' });
        }
    } else {
        validArr.push({ name: 'doctor_email', msg: 'Email required!' });
    }
    if (!Obj['doctor_name']) {
        validArr.push({ name: 'doctor_name', msg: 'Name required!' });
    }
    if (!Obj['doctor_mob']) {
        validArr.push({ name: 'doctor_mob', msg: 'Mobile no. required!' });
    }
    if (!Obj['subscription_type']) {
        validArr.push({ name: 'subscription_type', msg: 'Subscription type required!' });
    } else {
        let splitSubType = Obj['subscription_type'].trim().split('-');
        if (!isNaN(splitSubType[0]) && (splitSubType[1] != 'month' && splitSubType[1] != 'year')) {
            validArr.push({ name: 'subscription_type', msg: 'Subscription invalid!' });
        }
    }
    if (!Obj['doctor_logo']) {
        validArr.push({ name: 'doctor_logo', msg: 'Logo required!' });
    }
    if (!Obj['doctor_sign']) {
        validArr.push({ name: 'doctor_sign', msg: 'Sign required!' });
    }
    if (Obj['isActive']) {
        if (Obj['isActive'] != 1 && Obj['isActive'] != 0) {
            validArr.push({ name: 'isActive', msg: 'Status invalid!' });
        }
    } else {
        validArr.push({ name: 'isActive', msg: 'Status required!' });
    }
    return validArr;
}

async function checkUsername(value) {
    let query = `SELECT doctor_username from mst_doctors where doctor_username = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0) {
        return true;
    } else {
        return false;
    }
}

function deleteFile(fName) {
    let filePath = path.join(__dirname, '../public/uploads/images/') + fName;
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('deleted');
        });
    }
}