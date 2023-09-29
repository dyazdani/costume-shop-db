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

describe('/api/costumes', () => {
    beforeEach(async () => {
        await createTables(pool);
    })
    afterAll(async () => {
        await pool.end()
    })
    describe('GET api/costumes', () => {
        it('should return all costumes when there is one in DB', async () => {
            await createCostume(pool, getBallroomGown());
            const response = await request.get('/api/costumes');
            expect(response.status).toBe(200);
            expect(response.body.costumes[0].name).toBe('ballroom gown');
          })
    
          it('should return all costumes when there is multiple in DB', async () => {
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
    describe('POST /api/costumes', () => {
        it('should succeed in POST request', async () => {
            const response = await request.post('/api/costumes').send(getBonnet());
            expect(response.status).toBe(200);
            expect(response.body.costume.name).toBe('bonnet');
        })
        it('should succeed with consecutive POST requests', async () => {
            const responseOne = await request.post('/api/costumes').send(getBonnet());
            const responseTwo = await request.post('/api/costumes').send(getButtlessChaps());
            const responseThree = await request.post('/api/costumes').send(getBallroomGown());
           
            expect(responseOne.status).toBe(200);
            expect(responseTwo.status).toBe(200);
            expect(responseThree.status).toBe(200);

            expect(responseOne.body.costume.name).toBe('bonnet');
            expect(responseTwo.body.costume.name).toBe('buttless chaps');
            expect(responseThree.body.costume.name).toBe('ballroom gown');
        })
    })
})