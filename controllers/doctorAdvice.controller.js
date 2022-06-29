const db = require('../config/dbconnection');
const bodyAreaController = require("./bodyArea.controller")

async function validateAddRequest(req) {
    if (!req.advice_name) {
        return { status: false, msg: "required field advice name missing" }
    }

    if (!req.advice_type) {
        return { status: false, msg: "required field advice type missing" }
    }

    if (req.advice_type == "imaging" && !req.advice_body_part_id) {
        return { status: false, msg: "required field body part id missing" }
    }
    return { status: true }
}

module.exports.addDoctorAdvice = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_doctor_advice(advice_name, advice_body_part_id, advice_type, isActive) VALUES (?,?,?,?)'
    let values = [req.advice_name, req.advice_body_part_id, req.advice_type, 1];
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.doctorAdviceList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY advice_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY advice_id DESC' : '';
            }
        }

        let query = `SELECT adv.*,ROW_NUMBER() OVER (ORDER BY advice_id DESC) AS id, bod.body_part_name FROM mst_doctor_advice as adv left join mst_body_part as bod on adv.advice_body_part_id=bod.body_part_id where (adv.isActive=1 OR adv.isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Videos Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.doctorAdviceByType = async (req, res) => {
    try {
        if (!req.query.advice_type) {
            return { status: false, msg: "Please Enter Advice Type" }
        }
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY advice_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY advice_id DESC' : '';
            }
        }
        let query = `SELECT adv.* FROM mst_doctor_advice as adv where (adv.isActive=1 OR adv.isActive=0) and adv.advice_type="${req.query.advice_type}" ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        // console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Videos Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.deleteDoctorAdvice = async (req, res) => {
    try {
        if (!req.advice_id) {
            return { status: false, msg: "Please Enter Advice Id" }
        }
        let query = `UPDATE mst_doctor_advice SET isActive = 2 WHERE advice_id = ${req.advice_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Advice Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.updateDoctorAdvice = async (req, res) => {
    try {
        if (!req.advice_id) {
            return { status: false, msg: "Please Enter Advice Id" }
        }

        let cols = ""
        if (req.advice_name) {
            cols += ` advice_name="${req.advice_name}" ,`
        }
        if (req.advice_type) {
            cols += ` advice_type= "${req.advice_type}",`
        }
        if (req.advice_body_part_id) {
            cols += ` advice_body_part_id= ${req.advice_body_part_id},`
        }
        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=${req.isActive},`
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_doctor_advice SET " + cols + " where advice_id = " + req.advice_id;
        let data = await db.executequery(query)
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

exports.doctorAdviceByBodyArea = async (req, res) => {
    try {
        console.log("doctorAdviceByBodyArea request",req);
        if (!req.body_area_id && !req.body_area_name) {
            return { status: false, msg: "Please Enter body_area_id or body_area_name" }
        }
        let condition = " (adv.isActive=? OR adv.isActive=?) "
        let values = [1, 0]
        if (req.advice_type) {
            condition += " and adv.advice_type=?"
            values.push(req.advice_type)
        }
        let bodyAreaReq = {
            query: {
                body_area_used_for: "advice"
            }
        }
        if (req.body_area_name) {
            bodyAreaReq.body_area_name = req.body_area_name
        }

        if (req.body_area_id) {
            bodyAreaReq.body_area_id = req.body_area_id
        }

        let bodyAreaByUsedForRes = await bodyAreaController.bodyAreaByUsedFor(bodyAreaReq)
        // console.log("body_area_id_arr",body_area_id_arr);
        let body_area_id_arr = []
        if (bodyAreaByUsedForRes.data && bodyAreaByUsedForRes.data.length) {
            body_area_id_arr = bodyAreaByUsedForRes.data[0].body_part_id_arr
            body_area_id_arr = JSON.parse(body_area_id_arr)
            body_area_id_arr = Object.values(body_area_id_arr)
            // console.log("body_area_id_arr",body_area_id_arr);
        }

        let limit = req.limit ? 'LIMIT ' + req.limit : '';
        let orderBy = body_area_id_arr?.length ? "ORDER BY " : ""
        for (i = 0; i < body_area_id_arr?.length; i++) {
            orderBy += `advice_body_part_id=${body_area_id_arr[i]}, `
        }
        orderBy = orderBy.substring(0, orderBy.lastIndexOf(",")) + " " + orderBy.substring(orderBy.lastIndexOf(",") + 1);

        let query = "SELECT adv.*, bod.body_part_name FROM mst_doctor_advice as adv "
            + "join mst_body_part as bod on adv.advice_body_part_id=bod.body_part_id "
            + "where "
            + condition + orderBy + limit;
        // console.log("query", query);
        let result = await db.executevaluesquery(query, values)
        console.log(result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No exercises Found" };
        }

    } catch (error) {
        console.log("err", error)
        return { status: false, err: "Oop's Something Went Wrong" }
    }
}