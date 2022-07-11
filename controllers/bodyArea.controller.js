const db = require('../config/dbconnection');
const bodyPartController = require("./bodyPart.controller")
const common= require("../common")
async function validateAddRequest(req) {
    if (!req.body_area_name) {
        return { status: false, msg: "required field body_area_name missing" }
    }
    if (!req.body_part_id_arr) {
        return { status: false, msg: "required field body_part_id_arr missing" }
    }
    if (!req.body_area_used_for) {
        return { status: false, msg: "required field body_area_used_for missing" }
    }
    return { status: true }
}

module.exports.addBodyArea = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_body_areas(body_area_name, body_part_id_arr, body_area_used_for, isActive) VALUES (?,?,?,?)'
    let values = [req.body_area_name, req.body_part_id_arr, req.body_area_used_for, 1];
    let result = await db.executevaluesquery(query, values);
    // console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}
// getBodyPartArr("{\"0\":1,\"1\":2,\"2\":2}")
async function getBodyPartArr1(bodyPartArr) {
    // console.log({ bodyPartArr });
    bodyPartArr = JSON.parse(bodyPartArr)
    // console.log({ bodyPartArr });
    for (const key in bodyPartArr) {
        // console.log("bodyPartArr[key]", bodyPartArr[key]);
        let bodyPart = await bodyPartController.getBodyPartById({ "body_part_id": bodyPartArr[key] })
        // console.log("bodyPart", bodyPart);
        bodyPartArr[key] = bodyPart?.data[0]?.body_part_name;
        // console.log("bodyPart",bodyPart);
    }

    // console.log(JSON.stringify(bodyPartArr));
    return JSON.stringify(bodyPartArr)

}

async function getBodyPartArr(bodyPartIdArr, bodyPartArr) {
    bodyPartIdArr = JSON.parse(bodyPartIdArr)
    // console.log({ bodyPartArr });
    for (const key in bodyPartIdArr) {
        // console.log("bodyPartArr[key]", bodyPartIdArr[key]);
        // console.log(bodyPartArr);
        let bodyPart = bodyPartArr.find(part => { return part.body_part_id == bodyPartIdArr[key] })
        // console.log("bodyPart", bodyPart.body_part_name);
        bodyPartIdArr[key] = bodyPart?.body_part_name;
        // console.log("bodyPart",bodyPart);
    }
    return JSON.stringify(bodyPartIdArr)
}

exports.bodyAreaList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY body_area_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY body_area_id DESC' : '';
            }
        }
        let query = `SELECT *,ROW_NUMBER() OVER (ORDER BY body_area_id DESC) AS id FROM mst_body_areas  where (isActive=1 OR isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);

        // console.log("data", result);
        let bodyPartRes = await bodyPartController.bodyPartList({query:{}})
        let bodyPartArr = bodyPartRes.data
        if (result.length > 0) {
            for (let i = 0; i < result.length; i++) {
                result[i].body_part_name_arr = await getBodyPartArr(result[i].body_part_id_arr, bodyPartArr)
            }
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No body_areas Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.deleteBodyArea = async (req, res) => {
    try {
        if (!req.body_area_id) {
            return { status: false, msg: "Please Enter body_area_id" }
        }
        let query = `UPDATE mst_body_areas SET isActive = 2 WHERE body_area_id = ${req.body_area_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Body Area Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.updateBodyArea = async (req, res) => {
    try {
        if (!req.body_area_id) {
            return { status: false, msg: "Please Enter body_area_id" }
        }
        let values = []
        let cols = ""
        if (req.body_area_name) {
            cols += ` body_area_name=?,`
            values.push(req.body_area_name)
        }

        if (req.body_part_id_arr) {
            cols += `body_part_id_arr=?,`
            values.push(req.body_part_id_arr)

        }

        if (req.body_area_used_for) {
            cols += ` body_area_used_for=? ,`
            values.push(req.body_area_used_for)
        }

        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=?,`
            values.push(req.isActive)
        }
        values.push(req.body_area_id)

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_body_areas SET " + cols + " where body_area_id = ?";
        let data = await db.executevaluesquery(query, values)
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


exports.bodyAreaByUsedFor = async (req, res) => {
    try {
        if (!(req.query.body_area_used_for)  ) {
            return { status: false, msg: "Please Enter body_area_used_for" }
        }else if(!req.query.body_area_id && !req.query.body_area_name){
            return { status: false, msg: "Please Enter body_area_name or body_area_id" }
        }

        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY body_area_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY body_area_id DESC' : '';
            }
        }

        let condition = `(isActive=1 OR isActive=0) `
        if (req.query.body_area_used_for) {
            condition += `and body_area_used_for="${req.query.body_area_used_for}" `
        }
        if (req.query.body_area_id) {
            condition += `and body_area_id=${req.query.body_area_id} `
        }
        if (req.query.body_area_name) {
            condition += `and body_area_name='${req.query.body_area_name}' `
        }
        let query = `SELECT * FROM mst_body_areas where ${condition} ${limit} ${sort}`;
        // console.log("body Area query",query);
        let result = await db.executequery(query);

        // console.log("data", result);
        
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, data: [], msg: "Oop's No Body Area Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

