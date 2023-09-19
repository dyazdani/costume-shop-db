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


const pool = getPool();

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