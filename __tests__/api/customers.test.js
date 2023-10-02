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

describe( 'api/customers', () => {
    afterAll(async () => {
        await pool.end()
    })

describe('GET api/customers', () => {

    beforeEach( async () => {
        await createTables(pool)
    })
    
    it('should return all customers when there is one in DB', async () => {
        const customer = await createCustomer(pool, getBilbo());
        const response = await request.get('/api/customers');
        expect(response.status).toBe(200);
        expect(response.body.customers[0].id).toBe(customer.id);
      })

      it('should return all customers when there is multiple in DB', async () => {
        const customers = await Promise.all(
            createCustomer(pool, getBilbo()),
            createCustomer(pool, getDrogo()),
            createCustomer(pool, getBozo())
        )
        const response = await request.get('/api/customers');
        expect(response.status).toBe(200);
        expect(response.body.customers[0].id).toBe(customers[0].id);
        expect(response.body.customers[1].id).toBe(customers[1].id);
        expect(response.body.customers[2].id).toBe(customers[2].id);
      })
})

})