import express from 'express';

const apiRouter = express.Router();

//TODO: Fix issue that is making localhost:3000/api return with error saying "Cannot GET /api"

// GET /api
apiRouter.get('/', (req, res, next): void => {
    try {
        res.send('API is live');
    } catch (e) {
        next(e);
    }
})

apiRouter.use((req, res): void => {
    res.status(404)
    .send({message: 'Invalid API endpoint'});
})



export default apiRouter;