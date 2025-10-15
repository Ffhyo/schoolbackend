
import express from "express";
import { chat,chatActivity,generateActivities} from "./chat.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/chatActivity", chatActivity);
router.post("/generateActivities", generateActivities);
 

export default router;

