const db = require('../config/dbconnection');
require('dotenv').config();
const path = require('path');
const _ = require('lodash');
const fs = require('fs');
const moment = require('moment')
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');


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
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    processPatient(req)
    req.exercise_arr.forEach((exercise) => { generateAudio(exercise, req.patient_email) })
    
    // console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

async function processPatient(req) {
    let query = `SELECT * FROM mst_patient WHERE patient_email = ? AND patient_name = ?`
    let values = [req.patient_email, req.patient_name]
    let Value1 = [req.patient_name, req.patient_age, req.patient_gender, req.patient_email, req.doctor_id,]
    let checkPatient = await db.executevaluesquery(query, values);
    if (checkPatient.length > 0) {
        let updateQuery = `UPDATE mst_patient SET patient_name=?,patient_age = ?,patient_gender = ?,patient_email=?,doctor_id = ? WHERE patient_id = ?`;
        Value1.push(checkPatient[0].patient_id)

        let updatePatientData = await db.executevaluesquery(updateQuery, Value1);
        // patient_id = checkPatient[0].patient_id;
    } else {
        let insertPatient = 'INSERT INTO mst_patient (patient_name, patient_age, patient_gender, patient_email, doctor_id, isActive) VALUES (?,?,?,?,?,?)';
        Value1.push(1)
        let insertPatientData = await db.executevaluesquery(insertPatient,);
        // patient_id = insertPatientData.insertId;
    }
    return true

}

async function generateAudio(exercise, email) {
    // let text = `Exercise name ${exercise.exercise_name}, ${exercise.reps} reps, ${exercise.sets} sets and hold for ${exercise.hold}`;
    // let text = `gasfd jshdc  hdhdb jhbx jshss cxcbhdbds v vfvjsfv fnv vn s fnsvhsbvn vwj vwvwj vwjvbwj vsd vnsdvbwr vsd v wbvnd v`;
    let text = `<speak>`
    for (let i = 1; i <= parseInt(exercise.sets); i++) {
        text += `Take your position <break time="3s"/> and start in 3. 2. 1.<break time="1s"/>`
        for (let j = 1; j <= parseInt(exercise.holds); j++) {
            text += `${j}. hold <break time="1s"/>`
            for (let k = 1; k <= parseInt(exercise.reps); k++) {
                text += `${k}. <break time="0.5s"/> `
            }
            text += ` relax<break time="1s"/>`
        }
        if (parseInt(exercise.rests) > 0) {
            text += `rest for ${exercise.rests} counts <break time="1s"/>`
        }
        for (let l = 1; l <= parseInt(exercise.rests); l++) {
            text += `${l}<break time="1s"/>`
        }
    }
    text += `play the next exercise </speak>`
    console.log("text", text);
    email = email.replace(/\./g, "_")

    let fileName = email + "_" + exercise.exercise_name + "_" + moment().format('MMMM_DD_YYYY') + '_audio.mp3';
    let filepath = path.join(__dirname, '../public/uploads/audios/') + fileName;

    console.log("filepath", filepath);
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
    console.log('Audio content written to file ' + outFile);
}

// let body = {
//     "patient_name": "Akshay Narkar",
//     "patient_email": "akshaynarkar31@gmail.com",
//     "patient_age": 24,
//     "patient_gender": "M",
//     "patient_c_o": "don't drink cold water",
//     "date_of_evaluation": "2022-06-20",
//     "doctor_note": "test",
//     "doctor_advice": 1,
//     "instruction_note": "test",
//     "adjunct": 1,
//     "exercise_Arr": [{
//         "exercise_name": "push-ups",
//         "days": 2,
//         "multi-directional": true,
//         "video_link": "https://www.youtube.com/watch?v=6RrEQJNZwPQ",
//         "reps": "10",
//         "sets": "2",
//         "hold": "5",
//         "rests": "2"
//     },
//     {
//         "exercise_name": "pull-ups",
//         "days": 2,
//         "multi-directional": false,
//         "video_link": "https://www.youtube.com/watch?v=6RrEQJNZwPQ",
//         "reps": "10",
//         "sets": "2",
//         "hold": "5",
//         "rests": "2"
//     }
//     ]
// }