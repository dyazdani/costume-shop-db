const {
    getPool,
    createTables, 
    createCostume, 
} = require('../../db/');

const {
    getBallroomGown,
    getButtlessChaps,
    getBonnet
} = require('../../db/utils');

const {server} = require('../../app')
const supertest = require('supertest');
const request = supertest(server)


let pool = getPool();

describe('GET api/costumes/:id', () => {
    afterAll(async () => {
        await pool.end()
    })
    
    it('returns costume by ID', async () => {
        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());

        const response = await request.get('/api/costumes/2');
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('buttless chaps');
      })
})