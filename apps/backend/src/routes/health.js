import {
  getHealth,
  getLiveness,
  getReadiness,
} from "../controllers/healthController.js";
import { Router } from "express";

const router = Router();

router.get("/", getHealth);
router.get("/live", getLiveness);
router.get("/ready", getReadiness);

export default router;