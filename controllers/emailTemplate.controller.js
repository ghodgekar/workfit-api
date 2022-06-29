const db = require('../config/dbconnection');

async function validateAddRequest(req) {
    if (!req.template_code) {
        return { status: false, msg: "Please Enter Template Code" }
    }
    if (!req.template_name) {
        return { status: false, msg: "Template Name Required" }
    }
    if (!req.template_content) {
        return { status: false, msg: "Please Enter Template Content" }
    }
    return { status: true }
}

module.exports.addEmailTemplate = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_email_templates(template_code, template_name, template_content, isActive) VALUES (?,?,?,?)';
    let values = [req.template_code, req.template_name, req.template_content, 1];

    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}


exports.emailTemplateList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        let cols = "*,ROW_NUMBER() OVER (ORDER BY template_id DESC) AS id"
        if (req.query.callFor == "dropdown") {
            cols = "template_id as value, template_name as label"
        }
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY template_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY template_id DESC' : '';
            }
        }
        let values = []
        let condition = "(isActive=? OR isActive=?)"
        values.push(1)
        values.push(0)
        if (req.query.template_id) {
            condition = " and template_id=? "
            values.push(req.query.template_id)
        }
        if (req.query.template_code) {
            condition = " and template_code=? "
            values.push(req.query.template_code)
        }
        if (req.query.template_name) {
            condition = " and template_name=? "
            values.push(req.query.template_name)
        }


        let query = `SELECT ${cols} FROM mst_email_templates where  ${condition} ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executevaluesquery(query, values);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Email Template Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}




exports.deleteEmailTemplate = async (req, res) => {
    try {
        if (!req.template_id) {
            return { status: false, msg: "Please Enter Template Id" }
        }
        let query = `UPDATE mst_email_templates SET isActive = 2 WHERE template_id = ${req.template_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Email Template Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.updateEmailTemplate = async (req, res) => {
    try {
        if (!req.template_id) {
            return { status: false, msg: "Please Enter Template Id" }
        }
        let cols = ""
        let values = []
        if (req.template_code) {
            cols += ` template_code=? ,`
            values.push(req.template_code)
        }
        if (req.template_name) {
            cols += ` template_name=? ,`
            values.push(req.template_name)
        }
        if (req.template_content) {
            cols += ` template_content=? ,`
            values.push(req.template_content)
        }

        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=?,`
            values.push(req.isActive)
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);
        values.push(req.template_id)

        let query = "UPDATE mst_email_templates SET " + cols + " where template_id = ?" ;
        let data = await db.executevaluesquery(query,values)
        console.log(data);
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