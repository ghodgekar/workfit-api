const db = require('../config/dbconnection');
const { validationResult } = require('express-validator');

exports.addQuestion = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "desc": req.body.question_desc,
                "doctor_id": req.body.doctor_id,
                "isActive": req.body.isActive ? req.body.isActive : ''
            };
            let query = 'INSERT INTO mst_forum_questions(question_desc, doctor_id, isActive) VALUES (?,?,?)';
            let values = [bodyObj.desc,bodyObj.doctor_id,bodyObj.isActive];
            let data = await db.executevaluesquery(query,values);
            if(data.insertId){
                res.send({status:true, id:data.insertId});
            } else {
                res.send({status:false, err:'DB issue!'});
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.updateQuestion = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "desc": req.body.question_desc ? req.body.question_desc : '',
                "question_id": req.body.question_id,
                "isActive": req.body.isActive ? req.body.isActive : ''
            };
            let isValid = await db.executequery(`SELECT * FROM mst_forum_questions where question_id = ${bodyObj.question_id}`);
            if(isValid.length == 0){
                res.send({status:false,err:"Id not present."});
            } else {
                let query = `UPDATE mst_forum_questions SET question_desc = '${bodyObj.desc}', isActive = '${bodyObj.isActive}' WHERE question_id = ${bodyObj.question_id}`;
                let data = await db.executequery(query);
                if(data.affectedRows){
                    res.send({status:true,msg:'Updated.'});
                } else {
                    res.send({status:false, err:'DB issue!'});
                }
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.deleteQuestion = async (req,res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_forum_questions SET isActive = 2 WHERE question_id = ${id}`;
        let data = await db.executequery(query); 
        if(data.affectedRows){
            res.send({status:true,msg:'Deleted.'});
        } else {
            res.send({status:false,err:'DB issue.'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.addAnswer = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "desc": req.body.answer_desc,
                "doctor_id": req.body.doctor_id,
                "question_id": req.body.question_id,
                "isActive": req.body.isActive ? req.body.isActive : ''
            };
            let query = 'INSERT INTO mst_forum_answer(answer_desc, doctor_id, question_id, isActive) VALUES (?,?,?,?)';
            let values = [bodyObj.desc,bodyObj.doctor_id,bodyObj.question_id,bodyObj.isActive];
            let data = await db.executevaluesquery(query,values);
            if(data.insertId){
                res.send({status:true, id:data.insertId});
            } else {
                res.send({status:false, err:'DB issue!'});
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.updateAnswer = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "desc": req.body.answer_desc ? req.body.answer_desc : '',
                "answer_id": req.body.answer_id,
                "isActive": req.body.isActive ? req.body.isActive : ''
            };
            let isValid = await db.executequery(`SELECT * FROM mst_forum_answer where answer_id = ${bodyObj.answer_id}`);
            if(isValid.length == 0){
                res.send({status:false,err:"Id not present."});
            } else {
                let query = `UPDATE mst_forum_answer SET answer_desc = '${bodyObj.desc}', isActive = '${bodyObj.isActive}' WHERE answer_id = ${bodyObj.answer_id}`;
                let data = await db.executequery(query);
                if(data.affectedRows){
                    res.send({status:true,msg:'Updated.'});
                } else {
                    res.send({status:false, err:'DB issue!'});
                }
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.deleteAnswer = async (req,res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_forum_answer SET isActive = 2 WHERE answer_id = ${id}`;
        let data = await db.executequery(query); 
        if(data.affectedRows){
            res.send({status:true,msg:'Deleted.'});
        } else {
            res.send({status:false,err:'DB issue.'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.getAllQuestions = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY MFQ.question_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY MFQ.question_id DESC' : ''; 
            }
        }
        let query = `SELECT MFQ.question_id,MFQ.question_desc,MFQ.isActive AS question_active,MD.doctor_Id,MD.doctor_name,MD.doctor_username,MD.doctor_email,MD.doctor_degree,MD.specialisation,MD.doctor_logo,MD.doctor_sign,MD.subscription_type,MD.subscription_start_date,MD.subscription_end_date,MD.isActive AS doctor_active FROM mst_forum_questions AS MFQ JOIN mst_doctors AS MD ON MD.doctor_Id = MFQ.doctor_id ${sort} ${limit}`;
        let data = await db.executequery(query);
        if(data.length > 0){
            res.send({status:true, data:data});
        } else {
            res.send({status:false, err:'DB issue!'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.getAllAnswers = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY MFA.answer_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY MFA.answer_id DESC' : ''; 
            }
        }
        let query = `SELECT MFA.answer_id,MFA.answer_desc,MFA.isActive AS answer_active,MFQ.question_id,MFQ.question_desc,MFQ.isActive AS question_active,MD.doctor_Id,MD.doctor_name,MD.doctor_username,MD.doctor_email,MD.doctor_degree,MD.specialisation,MD.doctor_logo,MD.doctor_sign,MD.subscription_type,MD.subscription_start_date,MD.subscription_end_date,MD.isActive AS doctor_active FROM mst_forum_answer AS MFA JOIN mst_forum_questions AS MFQ ON MFA.question_id = MFQ.question_id JOIN mst_doctors AS MD ON MFA.doctor_id = MD.doctor_Id ${sort} ${limit}`;
        let data = await db.executequery(query);
        if(data.length > 0){
            res.send({status:true, data:data});
        } else {
            res.send({status:false, err:'DB issue!'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.questionWithAnswers = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY MFQ.question_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY MFQ.question_id DESC' : ''; 
            }
        }
        let queryQuestion = `SELECT MFQ.question_id,MFQ.question_desc,MFQ.created_at AS question_created,MD.doctor_Id,MD.doctor_name FROM mst_forum_questions AS MFQ JOIN mst_doctors AS MD ON MD.doctor_Id = MFQ.doctor_id where MFQ.isActive = 1 ${sort} ${limit}`;
        let dataQuestion = await db.executequery(queryQuestion);
        if(dataQuestion.length > 0){
            let queryAnswer = 'SELECT MFA.answer_id,MFA.answer_desc,MFA.question_id,MFA.created_at AS answer_created,MD.doctor_Id,MD.doctor_name FROM mst_forum_answer AS MFA JOIN mst_doctors AS MD ON MFA.doctor_id = MD.doctor_Id WHERE MFA.isActive = 1';
            let dataAnswer = await db.executequery(queryAnswer);
            if(dataAnswer.length > 0){
                dataQuestion.forEach((dq,idx) => {
                    let answersArr = dataAnswer.filter(da => dq.question_id == da.question_id);
                    dataQuestion[idx].answers = answersArr;
                });
                res.send({status:true, data:dataQuestion});
            } else {
                res.send({status:false, err:'DB issue!'});
            }
        } else {
            res.send({status:false, err:'DB issue!'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}