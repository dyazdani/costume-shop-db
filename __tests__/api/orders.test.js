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
    //TODO: test authorization?
    // TODO: fix POST tests so that response status is 200 instead of 500
    describe('POST /api/orders', () => {
        it('should succeed in POST request', async () => {
            const bilbo = await createCustomer(pool, getBilbo());
            console.log(bilbo)

            const orderOne = await createOrder(pool, getOrderOne());
            const response = await request.post('/api/orders').send(orderOne);

            expect(response.status).toBe(200);
            expect(response.body.order.date_placed).toBe(orderOne.date_placed.toISOString());
        })
    })

})
