import { Router } from "express";
import { createRecord, deleteRecord, listRecords, updateRecord } from "../controllers/recordController";
import { requireAuth } from "../middlewares/authMiddleware";
import { enforceIdempotency } from "../middlewares/idempotency";
import { requireRole } from "../middlewares/roleMiddleware";
import { validateRequest } from "../middlewares/validateRequest";
import { createRecordSchema, listRecordsSchema, recordIdSchema, updateRecordSchema } from "../validators/recordValidators";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("admin", "analyst"), validateRequest(listRecordsSchema), listRecords);
router.post("/", requireRole("admin"), enforceIdempotency("records:create"), validateRequest(createRecordSchema), createRecord);
router.patch("/:id", requireRole("admin"), validateRequest(updateRecordSchema), updateRecord);
router.delete("/:id", requireRole("admin"), validateRequest(recordIdSchema), deleteRecord);

export default router;
