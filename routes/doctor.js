const express=require("express");
const router=express.Router();
const db = require('../config/dbconnection');
const { body } = require('express-validator');

let doctorController = require("../controllers/doctor");

router.post("/signup",doctorController.signup);

router.post("/update",doctorController.update);

router.get("/delete/:id",doctorController.delete);

router.get("/getPrescriptionById/:id",doctorController.getPrescriptionById);

router.get("/getDoctorById/:id",doctorController.getDoctorById);

router.post("/login",[
    body('doctor_username').not().isEmpty().withMessage('Username invalid.'),
    body('doctor_password').not().isEmpty().withMessage('Password invalid.')
],doctorController.login);

router.post("/prescription",[
    body('doctor_id').not().isEmpty().withMessage('Doctor id invalid.').custom(async (value,{req}) => {
        let isExist = await checkForId('mst_doctors','doctor_Id',value);
        if(isExist){
            throw new Error('Doctor ID is not present in DB!');
        }
        return true;
    }),
    body('patient_email').isEmail().withMessage('Email invalid.'),
    body('patient_name').not().isEmpty().withMessage('Patient name invalid.'),
    body('date_of_evaluation').isDate().withMessage('Date of evaluation invalid.')
],doctorController.prescription);

router.post("/updateExTrack",[
    body('prescription_id').not().isEmpty().withMessage('Id invalid.').custom(async (value,{req}) => {
        let isExist = await checkForId('mst_exercise_track','prescription_id',value);
        if(isExist){
            throw new Error('Prescription id is not present in DB!');
        }
        return true;
    }),
    body('exercise_date').isDate().withMessage('Date invalid.'),
    body('exercise_index').not().isEmpty().withMessage('Index invalid.')
],doctorController.updateExTrack);

router.get("/list",doctorController.list);

router.use('*' ,(req,res,next) => next());

module.exports=router;

async function checkForId(table,key,value) {
    let query = `SELECT ${key} from ${table} where ${key} = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0){
        return false;
    } else {
        return true;
    }
}