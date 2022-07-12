const db = require('../config/dbconnection');


async function validateAddRequest(req) {
    if (!req.scale_name  ) {
        return {status:false,msg:"Please Enter Scale Name"}
    }
    if (!req.scale_link  ) {
        return {status:false,msg:"Please Enter Scale Link"}
    }
    return {status:true}
}


module.exports.addScale = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_scales(scale_name,scale_link, isActive) VALUES (?,?,?)';
    let values = [req.scale_name,req.scale_link, 1];

    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: " Scale Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.scaleList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        let condition="*,ROW_NUMBER() OVER (ORDER BY scale_id DESC) AS id"
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY scale_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY scale_id DESC' : '';
            }
        }

        if(req.query.sortBy=="app"){
            sort = ' ORDER BY scale_name ASC ';
        }

        if(req.query.callFor=="dropdown"){
            condition="scale_id as value, scale_name as label"
        }
        let query = `SELECT ${condition} FROM mst_scales where  (isActive=1 OR isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Scale Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.deleteScale = async (req, res) => {
    try {
        if (!req.scale_id) {
            return { status: false, msg: "Please Enter Scale Id" }
        }
        let query = `UPDATE mst_scales SET isActive = 2 WHERE scale_id = ${req.scale_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Scale Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}




exports.updateScale = async (req, res) => {
    try {
        if (!req.scale_id) {
            return { status: false, msg: "Please Enter Scale Id" }
        }
        let cols = ""
        if (req.scale_name) {
            cols += ` scale_name="${req.scale_name}" ,`
        }
        
        if (req.isActive||req.isActive==0) {
            cols += ` isActive=${req.isActive},`
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_scales SET " + cols + " where scale_id = " + req.scale_id;
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