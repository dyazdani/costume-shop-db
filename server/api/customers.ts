import express from "express";

const { getAllCustomers, getPool } = require("../db");

const pool = getPool();

const customerRouter = express.Router();

// GET /api/customers
customerRouter.get("/",async (req, res, next): Promise<void> => {
    try {
        const customers = await getAllCustomers(pool);
        res.send({customers});
    } catch(error) {
        next(error);
    }
})

export default customerRouter;