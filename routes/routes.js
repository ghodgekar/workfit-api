const express=require("express");
const router=express.Router();
const bodyParser=require("body-parser");
let adminController = require("../controllers/admin.controller");
const middleware=require("../middleware")

router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json());
router.use(express.static('public'));

let admin = require("./admin");
let doctor = require("./doctor");
let forum = require("./forum");

router.get("/",(req,res)=>{res.send("workfitt api running fast >>>>>>>>>>>>")})

router.post("/adminLogin",middleware.adminLogin)
router.post("/addAdmin",middleware.addAdmin)
router.get("/adminList",middleware.adminList);
router.post("/updateAdmin",middleware.updateAdmin);
router.post("/deleteAdmin",middleware.deleteAdmin)
router.post("/adminchangepassword",middleware.adminPassword)
router.post("/admincheck",middleware.admincheck)


router.use("/admin",admin);
router.use("/doctor",doctor);
router.use("/forum",forum);
// Adjunct
router.post("/addAdjunct",middleware.addAdjunct);
router.get("/adjunctList",middleware.adjunctList);
router.post("/deleteAdjunct",middleware.deleteAdjunct);
router.post("/updateAdjunct",middleware.updateAdjunct);
// Adjunct

// Instruction
router.post("/addInstruction",middleware.addInstruction)
router.get("/instructionList",middleware.instructionList)
router.post("/deleteInstruction",middleware.deleteInstruction)
router.post("/updateInstruction",middleware.updateInstruction)
router.get("/instructionByType",middleware.instructionByType)
// Instruction

// Video
router.post("/addVideo",middleware.addVideo);
router.get("/videoList",middleware.videoList);
router.post("/deleteVideo",middleware.deleteVideo);
router.post("/updateVideo",middleware.updateVideo);
router.get("/videoByType",middleware.videoByType);
// Video

// Body Part 
router.post("/addBodyPart",middleware.addBodyPart);
router.get("/bodyPartList",middleware.bodyPartList);
router.post("/deleteBodyPart",middleware.deleteBodyPart);
router.post("/updateBodyPart",middleware.updateBodyPart);
// Body Part 

// Scale Part 
router.post("/addScale",middleware.addScale);
router.get("/scaleList",middleware.scaleList);
router.post("/deleteScale",middleware.deleteScale);
router.post("/updateScale",middleware.updateScale);
// Scale Part 

// Doctor's Advice
router.post("/addDoctorAdvice",middleware.addDoctorAdvice);
router.get("/doctorAdviceList",middleware.doctorAdviceList);
router.post("/deleteDoctorAdvice",middleware.deleteDoctorAdvice);
router.post("/updateDoctorAdvice",middleware.updateDoctorAdvice);
router.get("/doctorAdviceByType",middleware.doctorAdviceByType);
router.post("/doctorAdviceByBodyArea",middleware.doctorAdviceByBodyArea);
// Doctor's Advice

// Body Area
router.post("/addBodyArea",middleware.addBodyArea);
router.get("/bodyAreaList",middleware.bodyAreaList);
router.post("/deleteBodyArea",middleware.deleteBodyArea);
router.post("/updateBodyArea",middleware.updateBodyArea);
router.get("/bodyAreaByUsedFor",middleware.bodyAreaByUsedFor);
// Body Area

// Exercise
router.post("/addExercise",middleware.addExercise);
router.get("/exerciseList",middleware.exerciseList);
router.post("/deleteExercise",middleware.deleteExercise);
router.post("/updateExercise",middleware.updateExercise);
router.post("/exerciseByBodyArea",middleware.exerciseByBodyArea);
router.post("/updateExerciseTrack",middleware.updateExerciseTrack);
// Exercise

//Subscription
router.post("/addSubscription",middleware.addSubscription)
router.get("/subscriptionList",middleware.subscriptionList);
router.post("/updateSubscription",middleware.updateSubscription);
router.post("/deleteSubscription",middleware.deleteSubscription)
//Subscription

//Email Template
router.post("/addEmailTemplate",middleware.addEmailTemplate)
router.get("/emailTemplateList",middleware.emailTemplateList);
router.post("/updateEmailTemplate",middleware.updateEmailTemplate);
router.post("/deleteEmailTemplate",middleware.deleteEmailTemplate)
//Email Template

// Prescription
router.post("/addPrescription",middleware.addPrescription)
router.get("/getPrescriptionById",middleware.getPrescriptionById)
// Prescription

// Doctor
router.post("/addDoctor",middleware.addDoctor)
router.post("/doctorLogin",middleware.doctorLogin)
router.post("/doctorById",middleware.doctorById)
// Doctor

let fs = require("fs")
router.get('/termsandconditions', function (req, res) {
  let tempFile = "./Agreement.pdf";
  fs.readFile(tempFile , function (err, data) {
    if(err){
        console.log("termsandconditions",err)
        res.send(err)
    }
    res.contentType("application/pdf");
    res.send(data);
  });
});

router.get('/workfittTnc', (req, res) => {
  const path = "./public/uploads/Agreement.pdf";
  if (fs.existsSync(path)) {
      res.contentType("application/pdf");
      fs.createReadStream(path).pipe(res)
  } else {
      res.status(500)
      console.log('File not found')
      res.send('File not found')
  }
})

router.get('/workfittTnc1', (req, res) => {
  var file = fs.createReadStream("./public/uploads/Agreement.pdf");
  var stat = fs.statSync("./public/uploads/Agreement.pdf");
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=Tnc.pdf');
  file.pipe(res);
  })



router.get("*",(req,res,next)=>{res.send({status:false,err:'Route not defined!'})});

module.exports=router;

