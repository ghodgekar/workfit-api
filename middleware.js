const adjunctController = require("./controllers/adjunct.controller")
const adminController = require("./controllers/admin.controller")
const instructionController = require("./controllers/instruction.controller")
const videoController = require("./controllers/video.controller")
const bodyPartController = require("./controllers/bodyPart.controller")
const doctorAdviceController = require("./controllers/doctorAdvice.controller")
const bodyAreaController = require("./controllers/bodyArea.controller")
const exerciseController = require("./controllers/execise.controller")
const subscriptionController = require("./controllers/subscription.controller")
const emailTemplateController = require("./controllers/emailTemplate.controller")
const prescriptionController = require("./controllers/prescription.controller")
const doctorController = require("./controllers/doctor.controller")
const scaleController = require("./controllers/scale.controller")



// Adjunct
module.exports.addAdjunct = async (req, res) => {
    try {
        let addAdjunct = await adjunctController.addAdjunct(req.body)
        res.send(addAdjunct)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.adjunctList = async (req, res) => {
    try {
        let ajunctList = await adjunctController.ajunctList(req)
        res.send(ajunctList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteAdjunct = async (req, res) => {
    try {
        let deleteAdjunct = await adjunctController.deleteAdjunct(req.body)
        res.send(deleteAdjunct)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateAdjunct = async (req, res) => {
    try {
        let updateAdjunct = await adjunctController.updateAdjunct(req.body)
        res.send(updateAdjunct)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Adjunct

// Admin
module.exports.adminLogin = async (req, res) => {
    try {
        let adminLogin = await adminController.adminLogin(req.body)
        res.send(adminLogin)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.adminPassword = async (req, res) => {
    try {
        let adminpass = await adminController.adminPassword(req.body)
        res.send(adminpass)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}


module.exports.admincheck = async (req, res) => {
    try {
        let admincheck = await adminController.admincheck(req.body)
        res.send(admincheck)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}


module.exports.addAdmin = async (req, res) => {
    try {
        let addAdmin = await adminController.addAdmin(req.body)
        res.send(addAdmin)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.adminList = async (req, res) => {
    try {
        let adminList = await adminController.adminList(req)
        res.send(adminList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateAdmin = async (req, res) => {
    try {
        let updateAdmin = await adminController.updateAdmin(req.body)
        res.send(updateAdmin)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteAdmin = async (req, res) => {
    try {
        let deleteAdmin = await adminController.deleteAdmin(req.body)
        res.send(deleteAdmin)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

// Admin

// Instructions
module.exports.addInstruction = async (req, res) => {
    try {
        let addInstruction = await instructionController.addInstruction(req.body)
        res.send(addInstruction)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.instructionList = async (req, res) => {
    try {
        let instructionList = await instructionController.instructionList(req)
        res.send(instructionList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteInstruction = async (req, res) => {
    try {
        let deleteInstruction = await instructionController.deleteInstruction(req.body)
        res.send(deleteInstruction)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateInstruction = async (req, res) => {
    try {
        let updateInstruction = await instructionController.updateInstruction(req.body)
        res.send(updateInstruction)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.instructionByType = async (req, res) => {
    try {
        let instructionByType = await instructionController.instructionByType(req)
        res.send(instructionByType)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}


// Video
module.exports.addVideo = async (req, res) => {
    try {
        let addVideo = await videoController.addVideo(req.body)
        res.send(addVideo)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.videoList = async (req, res) => {
    try {
        let videoList = await videoController.videoList(req)
        res.send(videoList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteVideo = async (req, res) => {
    try {
        let deleteVideo = await videoController.deleteVideo(req.body)
        res.send(deleteVideo)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateVideo = async (req, res) => {
    try {
        let updateVideo = await videoController.updateVideo(req.body)
        res.send(updateVideo)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.videoByType = async (req, res) => {
    try {
        let videoByType = await videoController.videoByType(req)
        res.send(videoByType)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// video


// Body Part
module.exports.addBodyPart = async (req, res) => {
    try {
        let addBodyPart = await bodyPartController.addBodyPart(req.body)
        res.send(addBodyPart)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.bodyPartList = async (req, res) => {
    try {
        let bodyPartList = await bodyPartController.bodyPartList(req)
        res.send(bodyPartList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteBodyPart = async (req, res) => {
    try {
        let deleteBodyPart = await bodyPartController.deleteBodyPart(req.body)
        res.send(deleteBodyPart)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateBodyPart = async (req, res) => {
    try {
        let updateBodyPart = await bodyPartController.updateBodyPart(req.body)
        res.send(updateBodyPart)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Body Part


//Scale
module.exports.addScale = async (req, res) => {
    try {
        let addScale = await scaleController.addScale(req.body)
        res.send(addScale)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.scaleList = async (req, res) => {
    try {
        let scaleList = await scaleController.scaleList(req)
        res.send(scaleList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteScale = async (req, res) => {
    try {
        let deleteScalet = await scaleController.deleteScale(req.body)
        res.send(deleteScalet)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateScale = async (req, res) => {
    try {
        let updateScale = await scaleController.updateScale(req.body)
        res.send(updateScale)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Doctor's Advice
module.exports.addDoctorAdvice = async (req, res) => {
    try {
        let addDoctorAdvice = await doctorAdviceController.addDoctorAdvice(req.body)
        res.send(addDoctorAdvice)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.doctorAdviceList = async (req, res) => {
    try {
        let doctorAdviceList = await doctorAdviceController.doctorAdviceList(req)
        res.send(doctorAdviceList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteDoctorAdvice = async (req, res) => {
    try {
        let deleteDoctorAdvice = await doctorAdviceController.deleteDoctorAdvice(req.body)
        res.send(deleteDoctorAdvice)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateDoctorAdvice = async (req, res) => {
    try {
        let updateDoctorAdvice = await doctorAdviceController.updateDoctorAdvice(req.body)
        res.send(updateDoctorAdvice)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.doctorAdviceByType = async (req, res) => {
    try {
        let doctorAdviceByType = await doctorAdviceController.doctorAdviceByType(req)
        res.send(doctorAdviceByType)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.doctorAdviceByBodyArea = async (req, res) => {
    try {
        let doctorAdviceByBodyArea = await doctorAdviceController.doctorAdviceByBodyArea(req.body)
        res.send(doctorAdviceByBodyArea)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Doctor's Advice

// Body Area
module.exports.addBodyArea = async (req, res) => {
    try {
        let addBodyArea = await bodyAreaController.addBodyArea(req.body)
        res.send(addBodyArea)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.bodyAreaList = async (req, res) => {
    try {
        let bodyAreaList = await bodyAreaController.bodyAreaList(req)
        res.send(bodyAreaList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteBodyArea = async (req, res) => {
    try {
        let deleteBodyArea = await bodyAreaController.deleteBodyArea(req.body)
        res.send(deleteBodyArea)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateBodyArea = async (req, res) => {
    try {
        let updateBodyArea = await bodyAreaController.updateBodyArea(req.body)
        res.send(updateBodyArea)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.bodyAreaByUsedFor = async (req, res) => {
    try {
        let bodyAreaByUsedFor = await bodyAreaController.bodyAreaByUsedFor(req)
        res.send(bodyAreaByUsedFor)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

// Body Area

// Exercise

module.exports.addExercise = async (req, res) => {
    try {
        let addExercise = await exerciseController.addExercise(req.body)
        res.send(addExercise)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.exerciseList = async (req, res) => {
    try {
        let exerciseList = await exerciseController.exerciseList(req)
        res.send(exerciseList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteExercise = async (req, res) => {
    try {
        let deleteExercise = await exerciseController.deleteExercise(req.body)
        res.send(deleteExercise)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateExercise = async (req, res) => {
    try {
        let updateExercise = await exerciseController.updateExercise(req.body)
        res.send(updateExercise)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.exerciseByBodyArea = async (req, res) => {
    try {
        let exerciseByBodyArea = await exerciseController.exerciseByBodyArea(req.body)
        res.send(exerciseByBodyArea)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateExerciseTrack = async (req, res) => {
    try {
        let updateExerciseTrack = await exerciseController.updateExerciseTrack(req.body)
        res.send(updateExerciseTrack)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

// Exercise

// Subscription
module.exports.addSubscription = async (req, res) => {
    try {
        let addSubscription = await subscriptionController.addSubscription(req.body)
        res.send(addSubscription)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.subscriptionList = async (req, res) => {
    try {
        let subscriptionList = await subscriptionController.subscriptionList(req)
        res.send(subscriptionList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteSubscription = async (req, res) => {
    try {
        let deleteSubscription = await subscriptionController.deleteSubscription(req.body)
        res.send(deleteSubscription)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateSubscription = async (req, res) => {
    try {
        let updateSubscription = await subscriptionController.updateSubscription(req.body)
        res.send(updateSubscription)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Subscription


// Email Template
module.exports.addEmailTemplate = async (req, res) => {
    try {
        let addEmailTemplate = await emailTemplateController.addEmailTemplate(req.body)
        res.send(addEmailTemplate)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.emailTemplateList = async (req, res) => {
    try {
        let emailTemplateList = await emailTemplateController.emailTemplateList(req)
        res.send(emailTemplateList)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.deleteEmailTemplate = async (req, res) => {
    try {
        let deleteEmailTemplate = await emailTemplateController.deleteEmailTemplate(req.body)
        res.send(deleteEmailTemplate)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.updateEmailTemplate = async (req, res) => {
    try {
        let updateEmailTemplate = await emailTemplateController.updateEmailTemplate(req.body)
        res.send(updateEmailTemplate)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Email Template

// Prescription
module.exports.addPrescription = async (req, res) => {
    try {
        let addPrescription = await prescriptionController.addPrescription(req.body)
        res.send(addPrescription)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.getPrescriptionById = async (req, res) => {
    try {
        let getPrescriptionById = await prescriptionController.getPrescriptionById(req)
        res.send(getPrescriptionById)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

// Prescription

// Doctor
module.exports.addDoctor = async (req, res) => {
    try {
        let addDoctor = await doctorController.addDoctor(req,res)
        console.log("addDoctor");
        return (addDoctor)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}

module.exports.doctorLogin = async (req, res) => {
    try {
        let doctorLogin = await doctorController.doctorLogin(req.body,res)
        console.log("doctorLogin");
        res.send(doctorLogin)
    } catch (error) {
        console.log("err", error);
        res.send({ status: false, data: error, err_msg: "Oop's Something went wrong" })
    }
}
// Doctor