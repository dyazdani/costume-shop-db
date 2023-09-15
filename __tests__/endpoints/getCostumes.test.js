const {
    getPool,
    createTables, 
    createCostume, 
} = require('../../db/');

const {
    getBallroomGown
} = require('../../db/utils');

const {server} = require('../../app')
const supertest = require('supertest');
const request = supertest(server)


let pool = getPool();

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

beforeEach( async () => {
    await createTables(pool);
    await createCostume(pool, getBallroomGown());;
})

afterAll(async () => {
    await pool.end()
})


describe('Testing api/costumes endpoint', () => {
    it('gets the test endpoint', async () => {
        const response = await request.get('/api/costumes')
        console.log(response)
        expect(response.status).toBe(200)
        expect(response.body[0].name).toBe('ballroom gown')
      })
})