const express=require("express");
const router=express.Router();
const db = require('../config/dbconnection');
const { body } = require('express-validator');

let adminController = require("../controllers/admin.controller");



router.post("/exerciseArr",[
    body('body_part_name').not().isEmpty().withMessage('Name invalid.')
],adminController.getExerciseArr);

router.post("/addEmailTemp",[
    body('template_code').not().isEmpty().withMessage('Code invalid.').custom(async (value,{req}) => {
        let isExist = await checkDuplicate('mst_email_templates','template_code',value);
        if(isExist){
            throw new Error('Code already exist!');
        }
        return true;
    }),
    body('template_name').not().isEmpty().withMessage('Name invalid.'),
    body('template_content').not().isEmpty().withMessage('Content invalid.'),
    body('isActive').not().isEmpty().withMessage('Status invalid.').custom(async (value,{req}) => {
        if(value != 1 && value != 0){
            throw new Error('Status should be 1 or 0.');
        }
        return true;
    })
],adminController.addEmailTemp);

router.post("/updateEmailTemp",[
    body('template_id').not().isEmpty().withMessage('Id invalid.'),
    body('isActive').not().isEmpty().withMessage('Status invalid.').custom(async (value,{req}) => {
        if(value != 1 && value != 0){
            throw new Error('Status should be 1 or 0.');
        }
        return true;
    })
],adminController.updateEmailTemp);


router.get("/emailTempList",adminController.emailTempList);

router.get("/getEmailTempByCode/:code",adminController.getEmailTempByCode);

router.get("/getEmailTempById/:id",adminController.getEmailTempById);

router.get("/deleteEmailTemp/:id",adminController.deleteEmailTemp);

router.use('*' ,(req,res,next) => next());

module.exports=router;

async function checkDuplicate(table,key,value) {
    let query = `SELECT ${key} from ${table} where ${key} = '${value}'`;
    let data = await db.executequery(query);
    if (data.length > 0){
        return true;
    } else {
        return false;
    }
}