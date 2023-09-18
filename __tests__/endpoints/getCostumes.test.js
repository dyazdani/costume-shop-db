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

// TODO: Put this DB check in another test. 
// if (pool.options.database !== 'costume_shop_db_test') {
//     throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
// }

describe('GET api/costumes', () => {
    afterAll(async () => {
        await pool.end()
    })
    
    it('returns all costumes', async () => {
        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        const response = await request.get('/api/costumes');
        expect(response.status).toBe(200);
        expect(response.body[0].name).toBe('ballroom gown');
      })
})