const db = require('../config/dbconnection');
const bodyAreaController = require("./bodyArea.controller")

async function validateAddRequest(req) {
    if (!req.exercise_name) {
        return { status: false, msg: "required field exercise_name missing" }
    }
    if ((!req.exercise_reps && req.exercise_reps != 0) || typeof req.exercise_reps !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_reps" }
    }
    if ((!req.exercise_sets && req.exercise_sets != 0) || typeof req.exercise_sets !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_sets" }
    }
    if ((!req.exercise_holds && req.exercise_holds != 0) || typeof req.exercise_holds !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_holds" }
    }
    if ((!req.exercise_rests && req.exercise_rests != 0) || typeof req.exercise_rests !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_rests" }
    }
    if ((!req.exercise_body_part_id && req.exercise_body_part_id != 0) || typeof req.exercise_body_part_id !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_body_part_id" }
    }
    if ((!req.exercise_video_id && req.exercise_video_id != 0) || typeof req.exercise_video_id !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_video_id" }
    }
    if ((!req.exercise_instruction_id && req.exercise_instruction_id != 0) || typeof req.exercise_instruction_id !== "number") {
        return { status: false, msg: "Please Enter Valid Value For exercise_body_part_id" }
    }
    return { status: true }
}

module.exports.addExercise = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = "INSERT INTO mst_exercises"
        + "(exercise_name, exercise_reps, exercise_holds, exercise_sets, exercise_rests, exercise_body_part_id, exercise_video_id, exercise_instruction_id, isActive)"
        + " VALUES "
        + "(?,?,?,?,?,?,?,?,?)"
    let values = [req.exercise_name, req.exercise_reps, req.exercise_holds, req.exercise_sets, req.exercise_rests, req.exercise_body_part_id, req.exercise_video_id, req.exercise_instruction_id, 1];
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.exerciseList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY exercise_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY exercise_id DESC' : '';
            }
        }
        let query = `SELECT exe.*, ROW_NUMBER() OVER (ORDER BY exe.exercise_id DESC) AS id, inst.instruction_name, bod.body_part_name, vid.video_name 
                        FROM workfitt.mst_exercises as exe 
                        join workfitt.mst_instructions as inst on exe.exercise_instruction_id=inst.instruction_id
                        join workfitt.mst_videos as vid on exe.exercise_video_id=vid.video_id
                        join workfitt.mst_body_part as bod on exe.exercise_body_part_id=bod.body_part_id
                    where (exe.isActive=1 OR exe.isActive=0) ${sort} ${limit}`;
        // console.log("query",query);
        let result = await db.executequery(query);
        console.log("data", result);
        if (result.length > 0) {
            return { status: true, data: result };
        } else {
            return { status: true, msg: "Oop's No exercises Found" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.deleteExercise = async (req, res) => {
    try {
        if (!req.exercise_id) {
            return { status: false, msg: "Please Enter Exercise Id" }
        }
        let query = `UPDATE mst_exercises SET isActive = 2 WHERE exercise_id = ${req.exercise_id}`;
        let data = await db.executequery(query);
        console.log("data", data);
        if (data.affectedRows) {
            return { status: true, msg: 'exercise Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}


exports.updateExercise = async (req, res) => {
    try {
        if (!req.exercise_id) {
            return { status: false, msg: "Please Enter exercise Id" }
        }
        let cols = ""
        if (req.exercise_name) {
            cols += ` exercise_name="${req.exercise_name}" ,`
        }

        if (req.exercise_reps) {
            cols += ` exercise_reps="${req.exercise_reps}" ,`
        }

        if (req.exercise_sets) {
            cols += ` exercise_sets="${req.exercise_sets}" ,`
        }

        if (req.exercise_holds) {
            cols += ` exercise_holds="${req.exercise_holds}" ,`
        }

        if (req.exercise_rests) {
            cols += ` exercise_rests="${req.exercise_rests}" ,`
        }

        if (req.exercise_body_part_id) {
            cols += ` exercise_body_part_id="${req.exercise_body_part_id}" ,`
        }

        if (req.exercise_video_id) {
            cols += ` exercise_video_id="${req.exercise_video_id}" ,`
        }

        if (req.exercise_instruction_id) {
            cols += ` exercise_instruction_id="${req.exercise_instruction_id}" ,`
        }

        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=${req.isActive},`
        }

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_exercises SET " + cols + " where exercise_id = " + req.exercise_id;
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

exports.exerciseByBodyAreaId = async (req, res) => {
    try {
        if (!req.body_area_id) {
            return { status: false, msg: "Please Enter body_area_id" }
        }
        let bodyAreaByUsedForRes = await bodyAreaController.bodyAreaByUsedFor({ query: { body_area_id: req.body_area_id, body_area_used_for: "exercise" } })
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
            orderBy += `exercise_body_part_id=${body_area_id_arr[i]}, `
        }
        orderBy = orderBy.substring(0, orderBy.lastIndexOf(",")) + " " + orderBy.substring(orderBy.lastIndexOf(",") + 1);

        let query = `SELECT exe.*, inst.instruction_name,bod.body_part_name,vid.video_name 
                        FROM workfitt.mst_exercises as exe 
                        join workfitt.mst_instructions as inst on exe.exercise_instruction_id=inst.instruction_id
                        join workfitt.mst_videos as vid on exe.exercise_video_id=vid.video_id
                        join workfitt.mst_body_part as bod on exe.exercise_body_part_id=bod.body_part_id
                    where (exe.isActive=1 OR exe.isActive=0) ${orderBy} ${limit}`;
        let result = await db.executequery(query)
        // console.log(result);
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
