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
        await createCustomer(pool, getBilbo());
        const response = await request.get('/api/customers');
        expect(response.status).toBe(200);
        console.log(response.body.customers)
        expect(response.body.customers[0].full_name).toBe('Bilbo Baggins');
      })

      it('should return all customers when there is multiple in DB', async () => {
        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());
        const response = await request.get('/api/customers');
        expect(response.status).toBe(200);
        expect(response.body.customers[0].full_name).toBe('Bilbo Baggins');
        expect(response.body.customers[1].full_name).toBe('Drogo Baggins');
        expect(response.body.customers[2].full_name).toBe('Bozo Baggins');
      })
})

})