const express=require("express");
const router=express.Router();
const bodyParser=require("body-parser");

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json());
router.use(express.static('public'));

let admin = require("./admin");
let doctor = require("./doctor");
let forum = require("./forum");

router.use("/admin",admin);
router.use("/doctor",doctor);
router.use("/forum",forum);
router.get("*",(req,res,next)=>{res.send({status:false,err:'Route not defined!'})});

module.exports=router;