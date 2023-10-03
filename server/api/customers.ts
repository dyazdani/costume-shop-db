import express from "express";

const { getAllCustomers, getCustomerById, getPool } = require("../db");

const pool = getPool();

const customerRouter = express.Router();

// GET /api/customers
customerRouter.get("/", async (req, res, next): Promise<void> => {
    try {
        const customers = await getAllCustomers(pool);
        res.send({customers});
    } catch(error) {
        next(error);
    }
})

// GET /api/customers/:id
customerRouter.get("/:id", async (req, res, next): Promise<void> => {
    try {
        const { id } = req.params;
        const customer = await getCustomerById(pool, id);
        const { full_name, email } = customer;
        res.send( {customer: { id, full_name, email }} );
    } catch(error) {
        next(error);
    }
})

export default customerRouter;