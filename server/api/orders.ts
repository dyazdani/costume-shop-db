import express from "express";

const { getPool, getAllOrders, getOrderById, createOrder} = require('../db');

const pool = getPool();

const ordersRouter = express.Router();

// GET /api/orders

ordersRouter.get("/", async (req, res, next): Promise<void> => {
    try {
        const orders = await getAllOrders(pool);
        res.send({orders});
    } catch (e) {
        next(e)
    }
})

// POST /api/orders
// TODO: use middleware to use authorization for this endpoint

ordersRouter.post("/", async (req, res, next): Promise<void> => {
    try {
        const order = await createOrder(pool, req.body);
        res.send({order});
    } catch (e) {
        next(e);
    }
})

export default ordersRouter;