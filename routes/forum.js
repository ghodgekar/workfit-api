const express=require("express");
const router=express.Router();
const db = require('../config/dbconnection');
const { body } = require('express-validator');

let forumController = require("../controllers/forum");

router.post("/question/add",[
    body('question_desc').not().isEmpty().withMessage('Desc invalid.'),
    body('doctor_id').not().isEmpty().withMessage('Doctor id invalid.').custom(async (value,{req}) => {
        let isExist = await checkForId('mst_doctors','doctor_Id',value);
        if(isExist){
            throw new Error('Doctor ID is not present in DB!');
        }
        return true;
    })
],forumController.addQuestion);

router.post("/question/update",[
    body('question_id').not().isEmpty().withMessage('Id invalid.')
],forumController.updateQuestion);

router.post("/answer/add",[
    body('answer_desc').not().isEmpty().withMessage('Desc invalid.'),
    body('doctor_id').not().isEmpty().withMessage('Doctor id invalid.').custom(async (value,{req}) => {
        let isExist = await checkForId('mst_doctors','doctor_Id',value);;
        if(isExist){
            throw new Error('Doctor ID is not present in DB!');
        }
        return true;
    }),
    body('question_id').not().isEmpty().withMessage('Question id invalid.').custom(async (value,{req}) => {
        let isExist = await checkForId('mst_forum_questions','question_id',value);
        if(isExist){
            throw new Error('Question ID is not present in DB!');
        }
        return true;
    })
],forumController.addAnswer);

router.post("/answer/update",[
    body('answer_id').not().isEmpty().withMessage('Id invalid.')
],forumController.updateAnswer);

router.get("/getAllQuestions",forumController.getAllQuestions);

router.get("/getAllAnswers",forumController.getAllAnswers);

router.get("/questionWithAnswers",forumController.questionWithAnswers);

router.get("/question/delete/:id",forumController.deleteQuestion);

router.get("/answer/delete/:id",forumController.deleteAnswer);

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