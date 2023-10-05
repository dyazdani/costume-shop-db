import express from 'express';
const bcrypt = require('bcrypt');

const { getPool, createCustomer} = require('../db');

const pool = getPool();

const saltRounds = 10;

const accountRouter = express.Router()

// POST /api/register

//TODO: fix so that hash is  inserted into database. It is currently returning null value
accountRouter.post('/', async (req, res, next): Promise<void> => {
    try {
        console.log(req.body)
        const {fullName, email, password} = req.body;
        bcrypt.hash(password, saltRounds, async function(err: Error | undefined, hash: string) {
            const customer = await createCustomer(pool, {fullName, email, hash});
            console.log(customer)
            delete customer.password;
            res.send({customer});
          });
    } catch (e) {
        next(e);
    }
})

export default accountRouter;