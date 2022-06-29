const express=require("express");
const router=express.Router();
const db = require('../config/dbconnection');
const { body } = require('express-validator');

let adminController = require("../controllers/admin.controller");



router.post("/exerciseArr",[
    body('body_part_name').not().isEmpty().withMessage('Name invalid.')
],adminController.getExerciseArr);




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