import express from 'express';
//import { access } from 'fs';
const bcrypt = require('bcrypt');
//const jwt = require('jsonwebtoken');
//require('dotenv').config()

const { getPool, createCustomer, getCustomerById} = require('../db');
const pool = getPool();

const saltRounds = 10;

//const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const accountRouter = express.Router()

// POST /api/account/register

accountRouter.post('/register', async (req, res, next): Promise<void> => {
    try {
        const {fullName, email, password} = req.body;
        bcrypt.hash(password, saltRounds, async function(err: Error | undefined, hash: string) {
            const customer = await createCustomer(pool, fullName, email, hash);
            delete customer.password;
            res.send({customer});
          });
    } catch (e) {
        next(e);
    }
})

// POST /api/account/login

accountRouter.post('/login', async (req, res, next): Promise<void> => {
    try {
        const customer = await getCustomerById(pool, req.body.id);
        const isValid = await bcrypt.compare(req.body.password, customer.password);

        if (isValid) {
            console.log('Password is valid!')

            // JSON Web Token returned to client
            // const token = jwt.sign({
            //     id: customer.id,
            //     username: customer.fullName
            // }, accessTokenSecret);
            // res.json({token});
        } else {
            console.log('Password is invalid!')
        }
        delete customer.password;
        res.send({customer})
    } catch (e) {
        next(e);
    }
})






export default accountRouter;