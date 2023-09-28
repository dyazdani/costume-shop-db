const {
    createTables, 
    createCostume, 
    getAllCostumes, 
    getCostumeById, 
    updateCostume, 
    deleteCostumeById,
    getPool
} = require("../../server/db");

const { 
    getBallroomGown,
    getBigBallroomGown,
    getBonnet, 
    getButtlessChaps,
    getButtfulChaps
} = require("../../server/db/utils");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

beforeEach( async () => {
    await createTables(pool);

    await createCostume(pool, getBallroomGown());
    await createCostume(pool, getButtlessChaps());
    await createCostume(pool, getBonnet());
})

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe.skip("createTables adapter", () => {
    it("should create a table", async () => {
        const costumes = await pool.query(`
            SELECT * FROM costumes;
        `)

        expect(costumes).toBeTruthy();
    })
})

describe.skip("createCostume adapter", () => {
    it("should create multiple entries when called multiple times", async () => {
        const gown = await getCostumeById(pool, 1);
        const chaps = await getCostumeById(pool, 2);
        const bonnet = await getCostumeById(pool, 3);

        expect(gown.name).toBe('ballroom gown');
        expect(chaps.name).toBe('buttless chaps');
        expect(bonnet.name).toBe('bonnet');
    })
})

describe.skip("getAllCostumes adapter", () => {
    it("should get all rows in costumes table", async () => {
        const costumes = await getAllCostumes(pool);

        expect(costumes[0].name).toBe('ballroom gown');
        expect(costumes[1].name).toBe('buttless chaps');
        expect(costumes[2].name).toBe('bonnet');
    })

    it("should get all costumes and then again after costumes have been updated or deleted", async () => {
        const costumes = await getAllCostumes(pool);

        expect(costumes[0].name).toBe('ballroom gown');
        expect(costumes[1].name).toBe('buttless chaps');
        expect(costumes[2].name).toBe('bonnet');

        await deleteCostumeById(pool, 3);
        await updateCostume(pool, 1, getBigBallroomGown());

        const updatedCostumes = await getAllCostumes(pool);

        expect(updatedCostumes).toHaveLength(2);
        expect(updatedCostumes[1].name).toBe('big ballroom gown');
        expect(updatedCostumes[0].name).toBe('buttless chaps');
    })
})

describe.skip("getCostumeById adapter", () => {
    it("should get costume that is first entry in table", async () => {
        const gown = await getCostumeById(pool, 1);
        expect(gown.name).toBe('ballroom gown');
    })

    it("should get costumes that are middle or last entry in table", async () => {
        const bonnet = await getCostumeById(pool, 3);
        const chaps = await getCostumeById(pool, 2);

        expect(bonnet.name).toBe('bonnet');
        expect(chaps.name).toBe('buttless chaps');
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await getCostumeById(pool, 4)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("updateCostume adapter", () => {
    it("should update costumes one after another", async () => {
        const gown = await getCostumeById(pool, 1);
        const chaps = await getCostumeById(pool, 2);

        expect(gown.name).toBe('ballroom gown');
        expect(chaps.name).toBe('buttless chaps');

        await updateCostume(pool, 1, getBigBallroomGown())
        await updateCostume(pool, 2, getBonnet())

        const updatedGown = await getCostumeById(pool, 1);
        const updatedChaps = await getCostumeById(pool, 2);

        expect(updatedGown.name).toBe('big ballroom gown');
        expect(updatedChaps.name).toBe('bonnet');
    })

    it("should be able to update the same costume more than one", async () => {
        const gown = await getCostumeById(pool, 1);

        expect(gown.name).toBe('ballroom gown');

        await updateCostume(pool, 1, getBigBallroomGown())
        const updatedGown = await getCostumeById(pool, 1);

        expect(updatedGown.name).toBe('big ballroom gown');

        await updateCostume(pool, 1, getButtlessChaps())
        const updatedAgainGown = await getCostumeById(pool, 1);

        expect(updatedAgainGown.name).toBe('buttless chaps');
    })

    it("should only update costume it selects by id", async () => {
        await updateCostume(pool, 2, getButtfulChaps());
        
        const updatedChaps = await getCostumeById(pool, 2);
        const gown = await getCostumeById(pool, 1);
        const bonnet = await getCostumeById(pool, 3);

        expect(gown.name).toBe('ballroom gown');
        expect(updatedChaps.name).toBe('buttful chaps');
        expect(bonnet.name).toBe('bonnet');
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await updateCostume(pool, 4, getBonnet())
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("deleteCostumeById adapter", () => {
    it("should delete multiple rows", async () => {
        const costumes = await getAllCostumes(pool);
        expect(costumes).toHaveLength(3);

        await deleteCostumeById(pool, 3);
        await deleteCostumeById(pool, 2);
        await deleteCostumeById(pool, 1);

        const updatedCostumes = await getAllCostumes(pool);

        expect(updatedCostumes).toStrictEqual([])
        expect(updatedCostumes).toHaveLength(0);
    })

    it("should delete one row", async () => {
        await deleteCostumeById(pool, 2);

        const costumes = await getAllCostumes(pool);
  
        expect(costumes[0].name).toBe('ballroom gown');
        expect(costumes[1].name).toBe('bonnet');
        expect(costumes).toHaveLength(2);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await deleteCostumeById(pool, 4)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})