import express from "express";

const { getAllCostumes, getPool, getCostumeById } = require("../db");

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

// GET /api/costumes/:id
costumesRouter.get("/:id", async (req, res, next): Promise<void> => {
        try {
            const { id } = req.params;
            const costume = await getCostumeById(pool, id)
            res.send({ costume });
        } catch (e) {
            next(e)
        }
})

export default costumesRouter;

