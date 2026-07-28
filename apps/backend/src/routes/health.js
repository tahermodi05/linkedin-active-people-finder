import { getHealth } from "../controllers/healthController.js";
import { Router } from "express";

const router = Router();

router.get("/", getHealth);

export default router;