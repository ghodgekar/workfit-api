const db = require('../config/dbconnection');
const encrypt_decrypt = require('../encrypt_decrypt')
const formidable = require('formidable');
const path = require('path');
const moment = require('moment');
const fs = require('fs');


async function validateLoginRequest(req) {
    console.log("request",req);
    if (!req.doctor_username) {
        return { status: false, msg: 'Please Enter Username' };
    }

    if (!req.doctor_password) {
        return { status: false, msg: 'Please Enter Password' };
    }

    return { status: true }
}

module.exports.doctorLogin = async (req) => {
    let validation = await validateLoginRequest(req);
    if (!validation.status) return validation

    let query = `SELECT * FROM mst_doctors where doctor_username = ? and isActive = ?`;
    let values = [req.doctor_username, 1]
    let data = await db.executevaluesquery(query, values);
    if (data.length > 0) {
        let password = await encrypt_decrypt.decrypt(data[0].doctor_password)
        // console.log("password",password, req.doctor_password );
        if (password == req.doctor_password) {
            if (moment().isBefore(data[0].subscription_end_date)) {
                return ({ status: true, data: data });
            } else {
                return ({ status: false, msg: 'Your Subscription Has Expired' });
            }
        } else {
            return ({ status: false, msg: 'Password does not match.' });
        }
    } else {
        return ({ status: false, msg: 'Username does not match.' });
    }

}

async function validateAddRequest(req) {
    // {
    //     doctor_mobile: '7208470446',
    //     doctor_logo: '/uploads/images/1656934050076_fed8e8fd9f3044ffb069b8800.png',
    //     doctor_sign: '/uploads/images/1656934050174_fed8e8fd9f3044ffb069b8801.png',
    //     doctor_name: 'Akshay Narkar',
    //     doctor_username: 'akshay1808',
    //     doctor_password: '12345678',
    //     doctor_email: 'akshaynarkar@gmail.com',
    //     consultation_charge: '200',
    //     treatment1_charge: '100',
    //     treatment2_charge: '100',
    //     treatment3_charge: '100',
    //     doctor_degree: 'MBBS',
    //     specialisation: 'Test',
    //     subscription: '6-month - 3000'
    // } 
    
    console.log("req.doctor_email",req);

    if (!req.doctor_mobile || req.doctor_mobile.length<10) {
        return { status: false, msg: "Please Enter Valid Mobile Number" }
    }
    if (!req.doctor_name ) {
        return { status: false, msg: "Please Enter Doctor Name" }
    }
    if (!req.doctor_username ) {
        return { status: false, msg: "Please Enter Doctor Username" }
    }
    if (!req.doctor_password) {
        return { status: false, msg: "Please Enter Doctor Password" }
    }
    if(await checkUsername(req.doctor_username)){
        return { status: false, msg: "Username is Already Present." }
    }
    if (!req.doctor_email) {
        return { status: false, msg: "Please Enter Doctor Email" }
    }
    return { status: true }
}

exports.deleteDoctor = async (req, res) => {
    try {
        let id = req.params.id;
        let query = `UPDATE mst_doctors SET isActive = 2 WHERE doctor_Id = ${id}`;
        let data = await db.executequery(query);
        if (data.affectedRows) {
            return ({ status: true, msg: 'Doctor Data Deleted Successfully.' });
        } else {
            return ({ status: false, err: 'There was some DB issue.' });
        }
    } catch (err) {
        console.log(err);
        res.send({ status: false, err: err });
    }
}

module.exports.addDoctor =  async (req,res) => {
    let bodyObj = {}
    var form =  new formidable.IncomingForm();
    form.parse(req);
    
    form.on('fileBegin', function (name, file) {
        if (file.originalFilename != '' && file.originalFilename != undefined && file.originalFilename != null) {
            if (file.mimetype && file.mimetype.includes('image')) {
                let ext = file.originalFilename.split('.')[1];
                let fileName = Date.now() + '_' + file.newFilename + '.' + ext;
                file.filepath = path.join(__dirname, '../public/uploads/images/') + fileName;
                bodyObj[name] = "/uploads/images/" + fileName;
            }
        }
    });
    form.on('field', function (name, value) {
        bodyObj[name] = value;
        console.log("bodyObj",bodyObj);
    });
    form.on('error', (err) => {
        res.send({ status: false, err: err })
    });

    form.on('end', async function () {
        console.log("i am heree");
        let validation = await validateAddRequest(bodyObj);
        console.log("validation",validation);
        if (!validation.status) {
            if (!res.headersSent) {
            if (bodyObj.doctor_logo) await deleteFile(bodyObj.doctor_logo);

            if (bodyObj.doctor_sign) await deleteFile(bodyObj.doctor_sign);

            res.send(validation)
            }
        }else{
            if (!res.headersSent) {

        bodyObj.doctor_password = await encrypt_decrypt.encrypt(bodyObj.doctor_password)
        bodyObj.doctor_mobile = parseInt(bodyObj.doctor_mobile)
        let subscriptionObject = await processSubscription(bodyObj.subscription)
        let query = `INSERT INTO mst_doctors
        (doctor_name, doctor_username, doctor_email, doctor_mobile, doctor_password, doctor_degree, specialisation, doctor_logo, doctor_sign, subscription_type,
        subscription_start_date, subscription_end_date, doctor_address, registration_number, consultation_charge, treatment1_charge, treatment2_charge, treatment3_charge, isActive) 
        VALUES 
        (?,?,?,?,?,?,?,?,?,?,
         ?,?,?,?,?,?,?,?,?)`;//19

        let values = [
            bodyObj.doctor_name, bodyObj.doctor_username, bodyObj.doctor_email, bodyObj.doctor_mobile, bodyObj.doctor_password, bodyObj.doctor_degree, bodyObj.specialisation, bodyObj.doctor_logo, bodyObj.doctor_sign, subscriptionObject.subscription_type,
            subscriptionObject.subscription_start_date, subscriptionObject.subscription_end_date, bodyObj.doctor_address, bodyObj.registration_number, parseInt(bodyObj.consultation_charge), parseInt(bodyObj.treatment1_charge), parseInt(bodyObj.treatment2_charge), parseInt(bodyObj.treatment3_charge), 1
        ]//19
        let result = await db.executevaluesquery(query, values)
        console.log("add doctor res",result);
        if (result.insertId) {
            res.send({ status: true, msg: "Data inserted successfully" })
        } else {
            if (bodyObj.doctor_logo) {
                deleteFile(bodyObj.doctor_logo);
            }
            if (bodyObj.doctor_sign) {
                deleteFile(bodyObj.doctor_sign);
            }
            res.send({ status: false, msg: "Oop's Database Issue Occured" })
        }

        
    }

    }
    })

    // console.log("resp",resp);

    // console.log("form",form);

}


// async function validateAddRequest(req) {
//     if (!req.doctor_username) {
//         return { status: false, msg: 'Please Enter Username' };
//     }

//     if (req.doctor_username && await checkUsername(req.doctor_username)) {
//         return { status: false, msg: 'Username Already Exists' };
//     }

//     if (!req.doctor_password) {
//         return { status: false, msg: 'Please Enter Password' };
//     }

//     if (!req.doctor_email) {
//         return { status: false, msg: 'Please Enter Email' };
//     }

//     if (req.doctor_email && req.doctor_email.trim().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
//         return { status: false, msg: 'Please Enter Valid Email' };
//     }

//     if (!req.doctor_name) {
//         return { status: false, msg: 'Please Enter Name' };
//     }

//     if (!req.doctor_mobile) {
//         return { status: false, msg: 'Please Enter Mobile Number' };
//     }

//     if (!req.subscription) {
//         return { status: false, msg: 'Please Select a Subscription Plan' };
//     }

//     if (!req.doctor_logo) {
//         return { status: false, msg: 'Please Select a Logo' };
//     }

//     if (!req.doctor_sign) {
//         return { status: false, msg: 'Please Select a Sign' };
//     }

//     if (!req.consultation_charge) {
//         return { status: false, msg: 'Please Enter Consultation Charges' };
//     }

//     if (!req.treatment1_charge) {
//         return { status: false, msg: 'Please Enter Treatment Type 1 Charges' };
//     }

//     if (!req.treatment2_charge) {
//         return { status: false, msg: 'Please Enter Treatment Type 2 Charges' };
//     }

//     if (!req.treatment3_charge) {
//         return { status: false, msg: 'Please Enter Treatment Type 3 Charges' };
//     }

//     return { status: true };
// }

async function processSubscription(subscription) {
    let arr = subscription.split("-")
    let subscriptionObj = {}
    subscriptionObj.subscription_start_date = moment().format('YYYY-MM-DD')
    if (arr[1].trim() == 'month') {
        subscriptionObj.subscription_end_date = moment().add(Number(arr[0]), 'M').format('YYYY-MM-DD');
    } else if (arr[1].trim() == 'year') {
        subscriptionObj.subscription_end_date = moment().add(Number(arr[0]), 'y').format('YYYY-MM-DD');
    }
    subscriptionObj.subscription_type = arr[0] + " " + arr[1]

    return subscriptionObj
}

async function checkUsername(value) {
    let query = `SELECT doctor_username from mst_doctors where doctor_username = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0) {
        return true;
    } else {
        return false;
    }
}

function deleteFile(fName) {
    let filePath = path.join(__dirname, '../public/uploads/images/') + fName;
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('deleted');
        });
    }
}