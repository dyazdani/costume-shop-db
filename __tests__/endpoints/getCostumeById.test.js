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


const pool = getPool();

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

      it("should respond with error message if given an ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);
        await createCostume(pool, getBallroomGown());
        await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());

        const response = await request.get('/api/costumes/4');
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Failed to get costume with id 4');
    })  
})