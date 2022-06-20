const db = require('../config/dbconnection');

async function validateAddRequest(req) {
    if (!(req.instruction_name || req.instruction_type)) {
        return false
    }
    return true
}

module.exports.addInstruction = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation) return { status: false, msg: "required fields missing" }

    let query = "insert into mst_instructions (instruction_name,instruction_type,instruction_description_hindi,instruction_description_marathi,instruction_description_english,isActive) values (?,?,?,?,?,?)"
    let values = [req.instruction_name, req.instruction_type, req.description_hindi, req.description_marathi, req.description_english, 1];
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.instructionList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY instruction_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY instruction_id DESC' : '';
            }
        }
        let query = `SELECT *, ROW_NUMBER() OVER (ORDER BY instruction_id ASC) AS id FROM mst_instructions where (isActive=1 OR isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Instructions Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.instructionByType = async (req, res) => {
    try {
        if (!req.query.instruction_type) {
            return { status: false, msg: "Please Enter Instruction Type" }
        }
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY instruction_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY instruction_id DESC' : '';
            }
        }
        let query = `SELECT instruction_id as value, instruction_name as label FROM mst_instructions where (isActive=1 OR isActive=0) and instruction_type="${req.query.instruction_type}" ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        // console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No Instructions Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.deleteInstruction = async (req, res) => {
    try {
        if (!req.instruction_id) {
            return { status: false, msg: "Please Enter Instruction Id" }
        }
        let query = `UPDATE mst_instructions SET isActive = 2 WHERE instruction_id = ${req.instruction_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Instruction Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.updateInstruction = async (req, res) => {
    try {
        if (!req.instruction_id) {
            return { status: false, msg: "Please Enter Instruction Id" }
        }
        console.log(req);
        let cols = ""
        let values=[]
        if (req.instruction_name) {
            cols += ` instruction_name=? ,`
            values.push(req.instruction_name)
        }
        if (req.instruction_type) {
            cols += ` instruction_type= ?,`
            values.push(req.instruction_type)
        }
        if (req.description_hindi) {
            cols += ` instruction_description_hindi=?,`
            values.push(req.description_hindi)
        }
        if (req.description_marathi) {
            cols += ` instruction_description_marathi=?,`
            values.push(req.description_marathi)
        }
        if (req.description_english) {
            cols += ` instruction_description_english=?,`
            values.push(req.description_english)
        }
        if (req.isActive||req.isActive==0) {
            console.log("heree");
            cols += ` isActive=?,`
            values.push(req.isActive)
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);
        values.push(req.instruction_id)

        let query = "UPDATE mst_instructions SET " + cols + " where instruction_id = ?";
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