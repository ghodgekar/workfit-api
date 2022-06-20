const db = require('../config/dbconnection');
async function validateAddRequest(req) {
    if (!req.subscription_name) {
        return { status: false, msg: "required field Subscription Name missing" }
    }
    if (!req.subscription_charges) {
        return { status: false, msg: "required field Subscription Charges missing" }
    }
    if (!req.subscription_period) {
        return { status: false, msg: "required field Subscription Period missing" }
    }
    if (!req.subscription_period_type) {
        return { status: false, msg: "required field Subscription Period Type missing" }
    }
    return { status: true }
}

module.exports.addSubscription = async (req) => {
    let validation = await validateAddRequest(req);
    if (!validation.status) return validation

    let query = 'INSERT INTO mst_subscription(subscription_name, subscription_charges, subscription_period, subscription_period_type, isActive) VALUES (?,?,?,?,?)'
    let values = [req.subscription_name, req.subscription_charges, req.subscription_period ,req.subscription_period_type , 1];
    let result = await db.executevaluesquery(query, values);
    // console.log("result", result);
    if (result.insertId) {
        return { status: true, msg: "Data inserted successfully" }
    } else {
        return { status: false, msg: "Oop's Database Issue Occured" }
    }
}

exports.subscriptionList = async (req, res) => {
    try {
        let limit = req.query.limit ? 'LIMIT ' + req.query.limit : '';
        let sort = '';
        if (req.query.sort) {
            if (req.query.sort == 'asc' || req.query.sort == 'ASC') {
                sort = req.query.sort ? 'ORDER BY subscription_id ASC' : '';
            } else if (req.query.sort == 'desc' || req.query.sort == 'DESC') {
                sort = req.query.sort ? 'ORDER BY subscription_id DESC' : '';
            }
        }
        let query = `SELECT *,ROW_NUMBER() OVER (ORDER BY subscription_id DESC) AS id FROM mst_subscription where (isActive=1 OR isActive=0) ${sort} ${limit}`;
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


exports.deleteSubscription = async (req, res) => {
    try {
        if (!req.subscription_id) {
            return { status: false, msg: "Please Enter subcription Id" }
        }
        let query = `UPDATE mst_subscription SET isActive = 2 WHERE subscription_id = ${req.subscription_id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return { status: true, msg: 'Subscription Removed Successfully' };
        } else {
            return { status: false, msg: "Oop's Database Issue Occured" };
        }
    } catch (err) {
        console.log(err);
        return { status: false, err: err };
    }
}

exports.updateSubscription = async (req, res) => {
    try {
        if (!req.subscription_id) {
            return { status: false, msg: "Please Enter Video Id" }
        }
        let values = []

        let cols = ""
        if (req.subscription_name) {
            cols += ` subscription_name=? ,`
            values.push(req.subscription_name)
        }
        if (req.subscription_charges) {
            cols += ` subscription_charges= ?,`
            values.push(req.subscription_charges)
        }
        if (req.subscription_period) {
            cols += ` subscription_period= ?,`
            values.push(req.subscription_period)
        }
        if (req.subscription_period_type) {
            cols += ` subscription_period_type= ?,`
            values.push(req.subscription_period_type)
        }
        if (req.isActive || req.isActive == 0) {
            cols += ` isActive=?,`
            values.push(req.isActive)
        }
        values.push(req.subscription_id)

        cols = cols.substring(0, cols.lastIndexOf(",")) + " " + cols.substring(cols.lastIndexOf(",") + 1);

        let query = "UPDATE mst_subscription SET " + cols + " where subscription_id = ?";
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