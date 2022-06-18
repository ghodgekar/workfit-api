const express=require("express");
const router=express.Router();
const db = require('../config/dbconnection');
const { body } = require('express-validator');

let adminController = require("../controllers/admin");

router.post("/signup",[
    body('admin_username').not().isEmpty().withMessage('Username invalid.').custom(async (value,{req}) => {
        let isExist = await checkDuplicate('mst_admin','admin_username',value);
        if(isExist){
            throw new Error('User Name already exist!');
        }
        return true;
    }),
    body('admin_password').not().isEmpty().trim().isLength({min:4}).withMessage('Password invalid.'),
    body('admin_email').isEmail().withMessage('Email invalid.'),
    body('admin_name').not().isEmpty().withMessage('Name invalid.'),
    body('isActive').not().isEmpty().withMessage('Status invalid.').custom(async (value,{req}) => {
        if(value != 1 && value != 0){
            throw new Error('Status should be 1 or 0.');
        }
        return true;
    })
],adminController.signup);

router.post("/login",[
    body('admin_username').not().isEmpty().withMessage('Username invalid.'),
    body('admin_password').not().isEmpty().withMessage('Password invalid.')
],adminController.login);

router.post("/addVideo",[
    body('video_link').not().isEmpty().isURL().withMessage('Link invalid.'),
    body('video_name').not().isEmpty().withMessage('Name invalid.'),
    body('isActive').not().isEmpty().withMessage('Status invalid.').custom(async (value,{req}) => {
        if(value != 1 && value != 0){
            throw new Error('Status should be 1 or 0.');
        }
        return true;
    })
],adminController.addVideo);

router.post("/addBodyPart",[
    body('body_part_name').not().isEmpty().withMessage('Name invalid.').custom(async (value,{req}) => {
        let isExist = await checkDuplicate('mst_body_part','body_part_name',value);
        if(isExist){
            throw new Error('Body part already exist!');
        }
        return true;
    }),
    body('isActive').not().isEmpty().withMessage('Status invalid.').custom(async (value,{req}) => {
        if(value != 1 && value != 0){
            throw new Error('Status should be 1 or 0.');
        }
        return true;
    })
],adminController.addBodyPart);

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

router.get("/list",adminController.adminList);

router.get("/videoList",adminController.videoList);

router.get("/bodyPartList",adminController.bodyPartList);

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