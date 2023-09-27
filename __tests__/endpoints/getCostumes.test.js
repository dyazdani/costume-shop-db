const {
    getPool,
    createTables, 
    createCostume, 
} = require('../../server/db');

const {
    getBallroomGown,
    getButtlessChaps,
    getBonnet
} = require('../../server/db/utils');

const {app} = require('../../server')
const supertest = require('supertest');
const request = supertest(app)

const pool = getPool();

describe('GET api/costumes', () => {
    afterAll(async () => {
        await pool.end()
    })
    
    it('should return all costumes when there is one in DB', async () => {
        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        const response = await request.get('/api/costumes');
        expect(response.status).toBe(200);
        expect(response.body.costumes[0].name).toBe('ballroom gown');
      })

      it('should return all costumes when there is multiple in DB', async () => {
        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());
        const response = await request.get('/api/costumes');
        expect(response.status).toBe(200);
        expect(response.body.costumes[0].name).toBe('ballroom gown');
        expect(response.body.costumes[1].name).toBe('buttless chaps');
        expect(response.body.costumes[2].name).toBe('bonnet');
      })
})