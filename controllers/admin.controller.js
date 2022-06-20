const db = require('../config/dbconnection');
const { validationResult } = require('express-validator');
const moment = require('moment');
const encrypt_decrypt = require("../encrypt_decrypt")


module.exports.adminLogin = async (req) => {
    let validation = await validateAddRequest(req, "adminLogin");
    if (!validation.status) return validation

    let query = `SELECT * FROM mst_admin where admin_username = ? and isActive = ?`;
    let values = [req.admin_username, 1]
    let data = await db.executevaluesquery(query, values);
    if (data.length > 0) {
        let password = await encrypt_decrypt.decrypt(data[0].admin_password)
        if (password == req.admin_password) {
            return({ status: true, data: data });
        } else {
            return({ status: false, err: 'Password does not match.' });
        }
    } else {
        return({ status: false, err: 'Username does not match.' });
    }

}


async function validateAddRequest(req, apiName = false) {
    if (apiName !== "adminLogin") {
        if (!req.admin_name) {
            return { status: false, msg: "required field Admin Name missing" }
        }
        if (!req.admin_email) {
            return { status: false, msg: "required field Admin Email missing" }
        }
    }
    if (!req.admin_username) {
        return { status: false, msg: "required field Admin Username missing" }
    }
    if (!req.admin_password) {
        return { status: false, msg: "required field Admin Password missing" }
    }
    if (req.admin_password.trim().length < 8) {
        return { status: false, msg: "Password Must be Atleast 8 characters long" }
    }
    return { status: true }
}


module.exports.addAdmin = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation
    req.admin_password= await encrypt_decrypt.encrypt(req.admin_password)
    let query = 'INSERT INTO mst_admin(admin_name, admin_username, admin_email, admin_password, isActive) VALUES (?,?,?,?,?)'
    let values = [req.admin_name, req.admin_username, req.admin_email,req.admin_password, 1];
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.updateAdmin = async (req, res) => {
    try {
        if (!req.admin_id) {
            return { status: false, msg: "Please Enter Admin Id" }
        } else if (req.admin_password && req.admin_password.length < 8) {
            return { status: false, msg: "Password Must be Atleast 8 characters long" }
        }
        let cols = ""
        let values = []
        if (req.admin_name) {
            cols += ` admin_name=?,`
            values.push(req.admin_name)
        }
        if (req.admin_username) {
            cols += ` admin_username=?,`
            values.push(req.admin_username)
        }
        if (req.admin_email) {
            cols += ` admin_email=?,`
            values.push(req.admin_email)
        }
        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=?,`
            values.push(req.isActive)
        }
        if (req.admin_password) {
            req.admin_password = await encrypt_decrypt.encrypt(req.admin_password)
            cols += ` admin_password= ?,`
            values.push(req.admin_password)
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);
        values.push(req.admin_id)
        let query = "UPDATE mst_admin SET " + cols + " where admin_id = " + req.admin_id;
        let data = await db.executevaluesquery(query)
        // console.log(data);
        if (data.affectedRows) {
            return { status: true, msg: 'Data Updated successfully!' };
        } else {
            return { status: false, err: 'DB issue!' };
        }
    } catch (error) {
        console.log("err", error)
        return { status: false, err: "Oop's Something Went Wrong" }

    }
}

exports.deleteAdmin = async (req) => {
    try {
        // console.log("deleteAdmin",req);
        if (!req.admin_id) {
            return { status: false, msg: "Please Enter Admin Id" }
        }
        let query = `UPDATE mst_admin SET isActive = 2 WHERE admin_id = ${req.admin_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Admin Removed Successfully' };
        } else {
            return { status: false, err: 'DB issue.' };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.adminList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY admin_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY admin_id DESC' : '';
            }
        }
        let query = `SELECT *,ROW_NUMBER() OVER (ORDER BY admin_id DESC) AS id FROM mst_admin where isActive=1 ${sort} ${limit}`;
        let data = await db.executequery(query);
        if (data.length > 0) {
            return({ status: true, data: data });
        } else {
            return({ status: false, err: 'DB issue!' });
        }
    } catch (err) {
        console.log(err);
        return({ status: false, err: err });
    }
}







exports.addEmailTemp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
    } else {
        try {
            let bodyObj = {
                "template_code": req.body.template_code,
                "template_name": req.body.template_name,
                "template_content": req.body.template_content,
                "isActive": req.body.isActive
            };
            let query = 'INSERT INTO mst_email_templates(template_code, template_name, template_content, isActive) VALUES (?,?,?,?)';
            let values = [bodyObj.template_code, bodyObj.template_name, bodyObj.template_content, bodyObj.isActive];
            let data = await db.executevaluesquery(query, values);
            if (data.insertId) {
                res.send({ status: true, id: data.insertId });
            } else {
                res.send({ status: false, err: 'DB issue!' });
            }
        } catch (err) {
            console.log(err);
            res.send({ status: false, err: err });
        }
    }
}

exports.updateEmailTemp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
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
            if (isValid.length == 0) {
                res.send({ status: false, err: "Id not present." });
            } else {
                let isExist = false;
                if (isValid[0].template_code != bodyObj.template_code) {
                    isExist = await checkInTable(bodyObj.template_code, 'mst_email_templates', 'template_code');
                    if (isExist) {
                        res.send({ status: false, err: "Code already present!" });
                    }
                }
                if (!isExist) {
                    let query = `UPDATE mst_email_templates SET template_code = '${bodyObj.template_code}', template_name = '${bodyObj.template_name}', template_content = '${bodyObj.template_content}', isActive = '${bodyObj.isActive}' WHERE template_id = ${bodyObj.template_id}`;
                    let data = await db.executequery(query);
                    if (data.affectedRows) {
                        res.send({ status: true, msg: 'Updated.' });
                    } else {
                        res.send({ status: false, err: 'DB issue!' });
                    }
                }
            }
        } catch (err) {
            console.log(err);
            res.send({ status: false, err: err });
        }
    }
}

exports.deleteEmailTemp = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_email_templates SET isActive = 2 WHERE template_id = ${id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            res.send({ status: true, msg: 'Deleted.' });
        } else {
            res.send({ status: false, err: 'DB issue.' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

exports.emailTempList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY template_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY template_id DESC' : '';
            }
        }
        let query = `SELECT * FROM mst_email_templates ${sort} ${limit}`;
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

exports.getEmailTempByCode = async (req, res) => {
    try {
        let code = req.params.code;
        if (code) {
            let query = `SELECT template_code,template_name,template_content FROM mst_email_templates WHERE isActive = 1 AND template_code = '${code}'`;
            let data = await db.executequery(query);
            if (data.length > 0) {
                let tempData = {
                    code: data[0].template_code,
                    name: data[0].template_name,
                    content: data[0].template_content
                };
                res.send({ status: true, data: tempData });
            } else {
                res.send({ status: false, err: 'Code not found.' });
            }
        } else {
            res.send({ status: false, err: 'Code required!' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

exports.getEmailTempById = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `SELECT * FROM mst_email_templates WHERE template_id = ${id}`;
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

exports.getExerciseArr = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.send({ status: false, err: errors.array() })
    } else {
        let name = req.body.body_part_name;
        let query = `SELECT * FROM mst_body_part WHERE isActive = 1 AND body_part_name = '${name}'`;
        let data = await db.executequery(query);
        if (data.length > 0) {
            let arr = JSON.parse(data[0].video_arr);
            let exerciseArr = [];
            if (arr.length > 0) {
                let videoQuery = `SELECT * FROM mst_videos WHERE video_id IN (${arr.join()}) AND isActive = 1`;
                let videoData = await db.executequery(videoQuery);
                if (videoData.length > 0) {
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
                    res.send({ status: true, data: exerciseArr });
                } else {
                    res.send({ status: true, data: exerciseArr });
                }
            } else {
                res.send({ status: true, data: exerciseArr });
            }
        } else {
            res.send({ status: false, err: 'Name not found.' });
        }
    }
}

async function checkInTable(value, table, key) {
    let query = `SELECT ${key} from ${table} where ${key} = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0) {
        return true;
    } else {
        return false;
    }
}