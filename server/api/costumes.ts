// @ts-ignore
import express from "express";

const { getAllCostumes, getPool } = require("../db");

const pool = getPool();

const costumesRouter = express.Router()

// GET /api/costumes

costumesRouter.get("/", async (req, res, next): Promise<void> => {
    try {
        const costumes = await getAllCostumes(pool);
        res.send({costumes})
    } catch (e) {
        next(e)
    }
})

export default costumesRouter;

