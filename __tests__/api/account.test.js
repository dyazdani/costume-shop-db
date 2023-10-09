const {
    getPool,
    createTables, 
    createCustomer, 
} = require('../../server/db');

const {
    getBilbo,
    getDrogo,
    getBozo
} = require('../../server/db/utils');

const {app} = require('../../server')
const supertest = require('supertest');
const request = supertest(app)

const pool = getPool();

describe( 'api/account', () => {
    afterAll(async () => {
        await pool.end()
    })

    describe('POST api/account/login', () => {

        beforeEach( async () => {
            await createTables(pool)
        })

        it('should return a JSON Web Token with valid id and password', async () => {
            const bilbo = getBilbo();            
            const customer = await request.post('/api/account/register').send(bilbo);
            const id = customer.body.customer.id;
            const response = await request.post('/api/account/login').send({id: id, password: bilbo.password});
            expect(response.status).toBe(200);
            expect(response.body.customer.full_name).toBe(bilbo.fullName);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token === 'string').toBe(true);
        })

    })

})
