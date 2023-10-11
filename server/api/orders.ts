import express from "express";
const jwt = require('jsonwebtoken');


const { getPool, getAllOrders, getOrderById, createOrder} = require('../db');

const pool = getPool();

const ordersRouter = express.Router();

//TODO: fix this middleware auth so that it works
const authenticateJWT = (req: any, res: any, next: () => void) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            .then( () => {
                next();
            })

        } catch (e: any) {
            throw new Error(e);
        }
    }
}

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

ordersRouter.get("/:id", authenticateJWT, async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await getOrderById(pool, id)
        res.send({order});
    } catch (e) {
        next(e)
    }
})

export default ordersRouter;