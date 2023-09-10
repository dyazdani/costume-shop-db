const {
    createTables, 
    createCostume, 
    getAllCostumes, 
    getCostumeById, 
    updateCostume, 
    deleteCostumeById,
    getPool
} = require("../../index");

const { 
    matchesDatabase,
    getBallroomGown,
    getBigBallroomGown,
    getBonnet, 
    getBonnetMissingArg,
    getButtlessChaps,
    getGownWithWrongType,
    getGownWithWrongCategory,
    getGownWithLongSize
} = require("../utilities");

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

describe("createTables adapter", () => {
    it("should create a table", async () => {
        const costumes = await pool.query(`
            SELECT * FROM costumes;
        `)

        expect(costumes).toBeTruthy();
    })
})

describe("createCostume adapter", () => {
    it("should create a new entry with correct values", async () => {
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        
        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);

        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);
        expect(matchesDatabase(getButtlessChaps(), bonnetFromDatabase)).toBe(false);
        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
        expect(matchesDatabase(getBonnet(), chapsFromDatabase)).toBe(false);

    })

    it("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();
        try {
            await createCostume(pool, getBonnetMissingArg())
        } catch (e) {
            expect(e.name).toMatch('error');
            expect(e.code).toMatch('23502');
        }
    })

    it("should throw an error if given the wrong argument type", async () => {
        expect.hasAssertions();
        try {
            await createCostume(pool, getGownWithWrongType())
        } catch (e) {
            console.log(e);
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow CHECK constraint", async () => {
        expect.hasAssertions();
        try {
            await createCostume(pool, getGownWithWrongCategory())
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow VARCHAR length constraint", async () => {
        expect.hasAssertions();
        try {
            await createCostume(pool, getGownWithLongSize())
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })
})

describe("getAllCostumes adapter", () => {
    it("should get all rows in costumes table", async () => {
        const {rows: [gownFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='ballroom gown';
        `);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);
        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);

        const costumes = await getAllCostumes(pool);

        expect(costumes).toContainEqual(gownFromDatabase);
        expect(costumes).toContainEqual(chapsFromDatabase);
        expect(costumes).toContainEqual(bonnetFromDatabase);
    })

    it("should get all costumes and then again after costumes have been updated or deleted", async () => {
        const {rows: [gownFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='ballroom gown';
        `);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);
        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);

        const costumes = await getAllCostumes(pool);

        expect(costumes).toContainEqual(gownFromDatabase);
        expect(costumes).toContainEqual(chapsFromDatabase);
        expect(costumes).toContainEqual(bonnetFromDatabase);

        await deleteCostumeById(pool, 3);

        await updateCostume(pool, 1, getBigBallroomGown());
        const {rows: [updatedGownFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='big ballroom gown';
        `);

        const updatedCostumes = await getAllCostumes(pool);

        expect(updatedCostumes).not.toContainEqual(gownFromDatabase);
        expect(updatedCostumes).toContainEqual(updatedGownFromDatabase);
        expect(updatedCostumes).toContainEqual(chapsFromDatabase);
        expect(updatedCostumes).not.toContainEqual(bonnetFromDatabase);
    })
})

describe("getCostumeById adapter", () => {
    it("should get costume that is first entry in table", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);
        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);
    })

    it("should get costumes that are middle or last entry in table", async () => {
        await createTables(pool);

        await createCostume(pool, getBallroomGown());
        await createCostume(pool, getButtlessChaps());
        await createCostume(pool, getBonnet());

        const bonnetFromDatabase = await getCostumeById(pool, 3);
        const chapsFromDatabase = await getCostumeById(pool, 2);

        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);
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

describe("updateCostume adapter", () => {
    it("should update costumes one after another", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);
        const chapsFromDatabase = await getCostumeById(pool, 2);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);
        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);

        await updateCostume(pool, 1, getBigBallroomGown())
        await updateCostume(pool, 2, getBonnet())
        const updatedGownFromDatabase = await getCostumeById(pool, 1);
        const bonnetFromDatabase = await getCostumeById(pool, 2);

        expect(matchesDatabase(getBigBallroomGown(), updatedGownFromDatabase)).toBe(true);
        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);
    })

    it("should be able to update the same costume more than one", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, getBigBallroomGown())
        const updatedGownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getBigBallroomGown(), updatedGownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, getButtlessChaps())
        const chapsFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
    })

    it("should update costume values when one value is changed", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, getBigBallroomGown())
        const updatedGownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getBigBallroomGown(), updatedGownFromDatabase)).toBe(true);
    })

    it("should update costume values when all values are changed", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, getButtlessChaps())
        const chapsFromDatabase = await getCostumeById(pool, 1);

        expect(matchesDatabase(getButtlessChaps(), chapsFromDatabase)).toBe(true);
    })

    it("should only update costume it selects by id", async () => {
        const gownFromDatabase = await getCostumeById(pool, 1);
        // TODO Delete line 341
        const chapsFromDatabase = await getCostumeById(pool, 2);
  

        await updateCostume(pool, 2, getBonnet());
        const bonnetFromDatabase = await getCostumeById(pool, 2);

        expect(matchesDatabase(getBonnet(), bonnetFromDatabase)).toBe(true);
        expect(matchesDatabase(getBallroomGown(), gownFromDatabase)).toBe(true);
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

describe("deleteCostumeById adapter", () => {
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
        const gownFromDatabase = await getCostumeById(pool, 1);
        const chapsFromDatabase = await getCostumeById(pool, 2);
        const bonnetFromDatabase = await getCostumeById(pool, 3);

        deleteCostumeById(pool, 2);

        const costumes = await getAllCostumes(pool);
  
        expect(costumes).toContainEqual(gownFromDatabase);
        expect(costumes).toContainEqual(bonnetFromDatabase);
        expect(costumes).not.toContainEqual(chapsFromDatabase);
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