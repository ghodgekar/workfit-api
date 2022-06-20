const db = require('../config/dbconnection');

async function validateAddRequest(req) {
    if (!req.body_part_name ) {
        return {status:false,msg:"Please Enter Body Part Name"}
    }
    return {status:true}
}

module.exports.addBodyPart = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_body_part(body_part_name, isActive) VALUES (?,?)';
    let values = [req.body_part_name, 1];

    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}


exports.bodyPartList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        let condition="*,ROW_NUMBER() OVER (ORDER BY body_part_id DESC) AS id"
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY body_part_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY body_part_id DESC' : '';
            }
        }

        if(req.query.callFor=="dropdown"){
            condition="body_part_id as value, body_part_name as label"
        }
        let query = `SELECT ${condition} FROM mst_body_part where  (isActive=1 OR isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Body Parts Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.getBodyPartById=async(req)=>{
    try {
        let query = `SELECT * FROM mst_body_part where body_part_id = ${req.body_part_id} `;
        // console.log("query",query);
        let result = await db.executequery(query);
        // console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Body Parts Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.deleteBodyPart = async (req, res) => {
    try {
        if (!req.body_part_id) {
            return { status: false, msg: "Please Enter Body Part Id" }
        }
        let query = `UPDATE mst_body_part SET isActive = 2 WHERE body_part_id = ${req.body_part_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Body Part Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.updateBodyPart = async (req, res) => {
    try {
        if (!req.body_part_id) {
            return { status: false, msg: "Please Enter Body Part Id" }
        }
        let cols = ""
        if (req.body_part_name) {
            cols += ` body_part_name="${req.body_part_name}" ,`
        }
        
        if (req.isActive||req.isActive==0) {
            cols += ` isActive=${req.isActive},`
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_body_part SET " + cols + " where body_part_id = " + req.body_part_id;
        let data = await db.executequery(query)
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