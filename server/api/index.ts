import express from 'express';

const apiRouter = express.Router();

// GET /api
apiRouter.get('/', (req, res, next): void => {
    try {
        res.send('API is live');
    } catch (e) {
        next(e);
    }
})

import costumesRouter from './costumes';
apiRouter.use("/costumes", costumesRouter);

import customerRouter from './customers';
apiRouter.use("/customers", customerRouter);

import ordersRouter from './orders';
apiRouter.use("/orders", ordersRouter);

apiRouter.use((req, res): void => {
    res.status(404)
        .send({message: 'Invalid API endpoint'});
})



export default apiRouter;