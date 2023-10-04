const {
    getPool,
    createTables,
    createOrder,
    createCustomer
} = require('../../server/db');

const {
    getOrderOne,
    getOrderTwo,
    getOrderThree,
    getBilbo,
    getDrogo,
    getBozo
} = require('../../server/db/utils');

const {app} = require('../../server');
const supertest = require('supertest');
const request = supertest(app);

const pool = getPool();

describe('/api/orders', () => {
    beforeEach(async () => {
        await createTables(pool);
    })

    afterAll(async () => {
        await pool.end();
    })

    describe('GET /api/orders', () => {
        it('should return all orders when there is one in db', async () => {
            await createCustomer(pool, getBilbo());
            const orderOne = await createOrder(pool, getOrderOne());
            const response = await request.get('/api/orders');
            expect(response.status).toBe(200);
            expect(response.body.orders[0].date_placed).toBe(orderOne.date_placed.toISOString());
        })
        it('should return all orders when there are multiple entries in db', async () => {
            await createCustomer(pool, getBilbo());
            await createCustomer(pool, getDrogo());
            await createCustomer(pool, getBozo());

            const orderOne = await createOrder(pool, getOrderOne());
            const orderTwo = await createOrder(pool, getOrderTwo());
            const orderThree = await createOrder(pool, getOrderThree());

            const response = await request.get('/api/orders');
            expect(response.status).toBe(200);
            expect(response.body.orders[0].date_placed).toBe(orderOne.date_placed.toISOString());
            expect(response.body.orders[1].date_placed).toBe(orderTwo.date_placed.toISOString());
            expect(response.body.orders[2].date_placed).toBe(orderThree.date_placed.toISOString());

        })
    })

})
