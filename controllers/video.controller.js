const db = require('../config/dbconnection');
async function validateAddRequest(req) {
    if (!req.video_youtube_id) {
        return { status: false, msg: "required field video_youtube_id missing" }
    }
    if (!req.video_name) {
        return { status: false, msg: "required field video_name missing" }
    }
    if (!req.video_type) {
        return { status: false, msg: "required field video_type missing" }
    }
    return { status: true }
}

module.exports.addVideo = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_videos(video_youtube_id, video_name, video_type, isActive) VALUES (?,?,?,?)'
    let values = [req.video_youtube_id, req.video_name, req.video_type, 1];
    let result = await db.executevaluesquery(query, values);
    console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.videoList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        let cols = "*,ROW_NUMBER() OVER (ORDER BY video_id DESC) AS id"
        let condition = " (isActive=? OR isActive=?) "
        let values = [1, 0]
        if (req.query.callFor == "dropdown") {
            cols = "video_id as value, video_name as label"
        }

        if (req.query.video_id) {
            condition+= " and video_id=? "
            values.push(req.query.video_id)
        }

        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY video_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY video_id DESC' : '';
            }
        }

        let query = `SELECT ${cols} FROM mst_videos where ${condition} ${sort} ${limit} `;
        console.log(" video by id query>>>>>>>>>>>>>>>>>>",query);
        let result = await db.executevaluesquery(query,values);
        console.log(" video by id data", result);
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


exports.videoByType = async (req, res) => {
    try {
        if (!req.query.video_type) {
            return { status: false, msg: "Please Enter Video Type" }
        }
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY video_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY video_id DESC' : '';
            }
        }
        let query = `SELECT * FROM mst_videos where (isActive=1 OR isActive=0) and video_type="${req.query.video_type}" ${sort} ${limit}`;
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

exports.deleteVideo = async (req, res) => {
    try {
        if (!req.video_id) {
            return { status: false, msg: "Please Enter video Id" }
        }
        let query = `UPDATE mst_videos SET isActive = 2 WHERE video_id = ${req.video_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Video Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.updateVideo = async (req, res) => {
    try {
        if (!req.video_id) {
            return { status: false, msg: "Please Enter Video Id" }
        }
        let values = []

        let cols = ""
        if (req.video_name) {
            cols += ` video_name=? ,`
            values.push(req.video_name)
        }
        if (req.video_type) {
            cols += ` video_type= ?,`
            values.push(req.video_type)
        }
        if (req.video_youtube_id) {
            cols += ` video_youtube_id= ?,`
            values.push(req.video_youtube_id)
        }
        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=?,`
            values.push(req.isActive)
        }
        values.push(req.video_id)

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_videos SET " + cols + " where video_id = ?";
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