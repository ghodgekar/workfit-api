const db = require('../config/dbconnection');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const moment = require('moment');

exports.login = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "username": req.body.admin_username,
                "password": req.body.admin_password
            };
            let query = `SELECT * FROM mst_admin where admin_username = '${bodyObj.username}' and isActive = 1`;
            let data = await db.executequery(query);
            if (data.length > 0){
                bcrypt.compare(bodyObj.password,data[0].admin_password).then(response => {
                    if(response){
                        res.send({status:true,data:data});
                    } else {
                        res.send({status:false,err:'Password does not match.'});
                    }
                }).catch(err => {
                    console.log(err);
                    res.send({status:false,err:err});
                });
            } else {
                res.send({status:false,err:'Username not present in DB.'});
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.signup = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        let bodyObj = {
            "name": req.body.admin_name,
            "username": req.body.admin_username,
            "email": req.body.admin_email,
            "password": req.body.admin_password,
            "isActive": req.body.isActive
        };
        bcrypt.hash(bodyObj.password,12).then(async hashedPw => {
            let query = 'INSERT INTO mst_admin(admin_name, admin_username, admin_email, admin_password, isActive) VALUES (?,?,?,?,?)';
            let values = [bodyObj.name,bodyObj.username,bodyObj.email,hashedPw,bodyObj.isActive];
            let data = await db.executevaluesquery(query,values);
            if(data.insertId){
                res.send({status:true, id:data.insertId, msg:'Registered successfully!'});
            } else {
                res.send({status:false, err:'DB issue!'});
            }
        }).catch(err => {
            console.log(err);
            res.send({status:false,err:err});
        });

    }
}

exports.addVideo = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "video_link": req.body.video_link,
                "video_name": req.body.video_name,
                "isActive": req.body.isActive
            };
            let query = 'INSERT INTO mst_videos(video_link, video_name, isActive) VALUES (?,?,?)';
            let values = [bodyObj.video_link,bodyObj.video_name,bodyObj.isActive];
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

exports.addBodyPart = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "body_part_name": req.body.body_part_name,
                "video_arr": req.body.video_arr ? req.body.video_arr : [],
                "isActive": req.body.isActive
            };
            let query = 'INSERT INTO mst_body_part(body_part_name, video_arr, isActive) VALUES (?,?,?)';
            let values = [bodyObj.body_part_name,JSON.stringify(bodyObj.video_arr),bodyObj.isActive];
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

exports.addEmailTemp = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "template_code": req.body.template_code,
                "template_name": req.body.template_name,
                "template_content": req.body.template_content,
                "isActive": req.body.isActive
            };
            let query = 'INSERT INTO mst_email_templates(template_code, template_name, template_content, isActive) VALUES (?,?,?,?)';
            let values = [bodyObj.template_code,bodyObj.template_name,bodyObj.template_content,bodyObj.isActive];
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

exports.updateEmailTemp = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        try {
            let bodyObj = {
                "template_id": req.body.template_id,
                "template_code": req.body.template_code ? req.body.template_code : '',
                "template_name": req.body.template_name ? req.body.template_name : '',
                "template_content": req.body.template_content ? req.body.template_content : '',
                "isActive": req.body.isActive
            };
            let isValid = await db.executequery(`SELECT * FROM mst_email_templates where template_id = ${bodyObj.template_id}`);
            if(isValid.length == 0){
                res.send({status:false,err:"Id not present."});
            } else {
                let isExist = false;
                if(isValid[0].template_code != bodyObj.template_code){
                    isExist = await checkInTable(bodyObj.template_code,'mst_email_templates','template_code');
                    if(isExist){
                        res.send({status:false,err:"Code already present!"});
                    }
                }
                if(!isExist){
                    let query = `UPDATE mst_email_templates SET template_code = '${bodyObj.template_code}', template_name = '${bodyObj.template_name}', template_content = '${bodyObj.template_content}', isActive = '${bodyObj.isActive}' WHERE template_id = ${bodyObj.template_id}`;
                    let data = await db.executequery(query);
                    if(data.affectedRows){
                        res.send({status:true,msg:'Updated.'});
                    } else {
                        res.send({status:false, err:'DB issue!'});
                    }
                }
            }
        } catch (err) {
            console.log(err);
            res.send({status:false,err:err});
        }
    }
}

exports.deleteEmailTemp = async (req,res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_email_templates SET isActive = 2 WHERE template_id = ${id}`;
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

exports.adminList = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY admin_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY admin_id DESC' : ''; 
            }
        }
        let query = `SELECT * FROM mst_admin where isActive=1 ${sort} ${limit}`;
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

exports.videoList = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY video_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY video_id DESC' : ''; 
            }
        }
        let query = `SELECT * FROM mst_videos ${sort} ${limit}`;
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

exports.bodyPartList = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY body_part_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY body_part_id DESC' : ''; 
            }
        }
        let query = `SELECT * FROM mst_body_part ${sort} ${limit}`;
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

exports.emailTempList = async (req,res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if(req.query.sort){
            if(req.query.sort == 'asc' || req.query.sort == 'ASC'){
                sort = req.query.sort ? 'ORDER BY template_id ASC' : ''; 
            } else if(req.query.sort == 'desc' || req.query.sort == 'DESC'){
                sort = req.query.sort ? 'ORDER BY template_id DESC' : ''; 
            }
        }
        let query = `SELECT * FROM mst_email_templates ${sort} ${limit}`;
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

exports.getEmailTempByCode = async (req,res) => {
    try {
        let code = req.params.code;
        if(code){
            let query = `SELECT template_code,template_name,template_content FROM mst_email_templates WHERE isActive = 1 AND template_code = '${code}'`;
            let data = await db.executequery(query);
            if(data.length > 0){
                let tempData = {
                    code: data[0].template_code,
                    name: data[0].template_name,
                    content: data[0].template_content
                };
                res.send({status:true, data:tempData});
            } else {
                res.send({status:false, err:'Code not found.'});
            }
        } else {
            res.send({status:false, err:'Code required!'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.getEmailTempById = async (req,res) => {
    try {
        let id = req.params.id;
        let query = `SELECT * FROM mst_email_templates WHERE template_id = ${id}`;
        let data = await db.executequery(query); 
        if(data.length > 0){
            res.send({status:true,data:data});
        } else {
            res.send({status:false,err:'DB issue.'});
        }
    } catch (err) {
        console.log(err);
        res.send({status:false,err:err});
    }
}

exports.getExerciseArr = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.send({status:false,err:errors.array()})
    } else {
        let name = req.body.body_part_name;
        let query = `SELECT * FROM mst_body_part WHERE isActive = 1 AND body_part_name = '${name}'`;
        let data = await db.executequery(query);
        if(data.length > 0){
            let arr = JSON.parse(data[0].video_arr);
            let exerciseArr = [];
            if(arr.length > 0){
                let videoQuery = `SELECT * FROM mst_videos WHERE video_id IN (${arr.join()}) AND isActive = 1`;
                let videoData = await db.executequery(videoQuery);
                if(videoData.length > 0){
                    for (let i = 0; i < videoData.length; i++) {
                        const element = videoData[i];
                        let obj = {
                            "exercise_name": element.video_name,
                            "start_date": moment().format('YYYY-MM-DD'),
                            "end_date": moment().format('YYYY-MM-DD'),
                            "video_link": element.video_link,
                            "reps": 1,
                            "sets": 1,
                            "hold": 1
                        };
                        exerciseArr.push(obj);
                    }
                    res.send({status:true,data:exerciseArr});
                } else {
                    res.send({status:true,data:exerciseArr});
                }
            } else {
                res.send({status:true,data:exerciseArr});
            }
        } else {
            res.send({status:false, err:'Name not found.'});
        }
    }
}

async function checkInTable(value,table,key) {
    let query = `SELECT ${key} from ${table} where ${key} = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0){
        return true;
    } else {
        return false;
    }
}