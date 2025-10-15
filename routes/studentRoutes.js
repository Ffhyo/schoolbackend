import { getlogin,getStudent ,getStudentByHouse,getStudentById,getStudentByClass} from "../controllers/studentController.js";
import express from "express";
const router = express.Router();
router.post("/",getlogin);
router.post("/getStudent", getStudent);
router.post("/getStudentByHouse", getStudentByHouse);
router.get("/getStudentById/:id", getStudentById);
router.get("/getStudentByClass/:Class",getStudentByClass);
export default router;