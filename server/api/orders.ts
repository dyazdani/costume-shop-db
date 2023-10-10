import express from "express";

const { getPool, getAllOrders, getOrderById, createOrder} = require('../db');

const pool = getPool();

const ordersRouter = express.Router();

// GET /api/orders

ordersRouter.get("/", async (req, res, next) => {
    try {
        const orders = await getAllOrders(pool);
        res.send({orders});
    } catch (e) {
        next(e)
    }
})

// GET /api/orders/:id

ordersRouter.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(pool, id)
        res.send({order});
    } catch (e) {
        next(e)
    }
})

export default ordersRouter;