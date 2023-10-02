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

afterAll(async () => {
    await pool.end()
})

describe('GET api/costumes', () => {
    
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


describe('GET api/costumes/:id', () => {
    it.only('returns costume by ID', async () => {
        await createCostume(pool, getBallroomGown());
        const buttlessChaps = await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());
        const response = await request.get('/api/costumes/' + buttlessChaps.id);
        expect(response.status).toBe(200);
        expect(response.body.costume.id).toBe(buttlessChaps.id);
      })

      it("should respond with error message if given an ID that does not exist", async () => {
        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());

        const response = await request.get('/api/costumes/4');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Oops! Server Error');
    })  
})
