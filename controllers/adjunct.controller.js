const db = require('../config/dbconnection');

async function validateAddRequest(req) {
    if (!(req.adjunct_name || req.adjunct_instruction_id)) {
        return false
    }
    return true
}

module.exports.addAdjunct = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation) return { status: false, msg: "required fields missing" }

    let query = "insert into mst_adjuncts (adjunct_name,adjunct_instruction_id,adjunct_time,isActive) values (?,?,?,?)"
    let values = [req.adjunct_name, req.adjunct_instruction_id, req.adjunct_time, 1];
    console.log("query", query);
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}


exports.ajunctList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        let condition = " (adj.isActive=? OR adj.isActive=?) and (inst.isActive=? OR inst.isActive=?) "
        let values = [1, 0, 1, 0]
        if (req.query.adjunct_id) {
            condition += " and adjunct_id=? "
            values.push(parseInt(req.query.adjunct_id))
        }
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY adj.adjunct_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY adj.adjunct_id DESC' : '';
            }
        }

        if(req.query.sortBy=="app"){
            sort = 'ORDER BY adj.adjunct_name ASC';
        }

        let query = `SELECT adj.*, ROW_NUMBER() OVER (ORDER BY adj.adjunct_id ASC) AS id, 
        inst.* FROM mst_adjuncts as adj 
        join mst_instructions as inst on adj.adjunct_instruction_id=inst.instruction_id  
        where  ${condition} ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executevaluesquery(query,values);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Adjuncts Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.deleteAdjunct = async (req, res) => {
    try {
        if (!req.adjunct_id) {
            return { status: false, msg: "Please Enter Adjunct Id" }
        }
        let query = `UPDATE mst_adjuncts SET isActive = 2 WHERE adjunct_id = ${req.adjunct_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Adjunct Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.updateAdjunct = async (req, res) => {
    try {
        if (!req.adjunct_id) {
            return { status: false, msg: "Please Enter Adjunct Id" }
        }
        let cols = ""
        if (req.adjunct_name) {
            cols += ` adjunct_name="${req.adjunct_name}" ,`
        }
        if (req.adjunct_instruction_id) {
            cols += ` adjunct_instruction_id= "${req.adjunct_instruction_id}",`
        }
        if (req.adjunct_time) {
            cols += ` adjunct_time="${req.adjunct_time}",`
        }
        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=${req.isActive},`
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_adjuncts SET " + cols + " where adjunct_id = " + req.adjunct_id;
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

