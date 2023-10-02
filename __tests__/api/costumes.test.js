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
            const gown = await createCostume(pool, getBallroomGown());
            const response = await request.get('/api/costumes');
            expect(response.status).toBe(200);
            expect(response.body.costumes[0].name).toBe(gown.name);
          })
    
          it('should return all costumes when there is multiple in DB', async () => {
            const gown = await createCostume(pool, getBallroomGown());
            const chaps = await createCostume(pool, getButtlessChaps());
            const bonnet = await createCostume(pool, getBonnet());
            const response = await request.get('/api/costumes');
            expect(response.status).toBe(200);
            expect(response.body.costumes[0].name).toBe(gown.name);
            expect(response.body.costumes[1].name).toBe(chaps.name);
            expect(response.body.costumes[2].name).toBe(bonnet.name);
          })
    })
    describe('POST /api/costumes', () => {
        it('should succeed in POST request', async () => {
            const bonnet = getBonnet();
            const response = await request.post('/api/costumes').send(bonnet);
            expect(response.status).toBe(200);
            expect(response.body.costume.name).toBe(bonnet.name);
            /*TODO: Should I test another property of the costume beside 
            'name'? Allie wanted 'id' but getBonnet() does not produce one */
        })
        it('should succeed with consecutive POST requests', async () => {
            const bonnet = getBonnet();
            const chaps = getButtlessChaps();
            const gown = getBallroomGown();
            
            const responseOne = await request.post('/api/costumes').send(bonnet);
            const responseTwo = await request.post('/api/costumes').send(chaps);
            const responseThree = await request.post('/api/costumes').send(gown);
           
            expect(responseOne.status).toBe(200);
            expect(responseTwo.status).toBe(200);
            expect(responseThree.status).toBe(200);

            expect(responseOne.body.costume.name).toBe(bonnet.name);
            expect(responseTwo.body.costume.name).toBe(chaps.name);
            expect(responseThree.body.costume.name).toBe(gown.name);
        })
    })

    describe('GET api/costumes/:id', () => {
        it('returns costume by ID', async () => {
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
})
