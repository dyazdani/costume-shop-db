const {
    createTables, 
    createCostume, 
    getAllCostumes, 
    getCostumeById, 
    updateCostume, 
    deleteCostumeById,
    getPool
} = require(".././index");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

// Helper function for comparing argument with selected data from database
const matchesCostumeInDatabase = (inputCostume, costumeFromDatabase) => {
    let areAllPropertiesMatched = true;
    for (const prop in inputCostume) {
        if (inputCostume[prop] !== costumeFromDatabase[prop]) {
            areAllPropertiesMatched = false;
            return areAllPropertiesMatched;
        }
    }
    return areAllPropertiesMatched;
}

// Costume objects to reuse for testing
const ballroomGown = {
    name: "ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stock_count: 1,
    price: 150.99
}

const bigBallroomGown = {
    name: "big ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stock_count: 1,
    price: 150.99
}

const buttlessChaps = {
    name: "buttless chaps",
    category: "adult",
    gender: "unisex",
    size: "M",
    type: "pants",
    stock_count: 3,
    price: 75.99
}

const bonnet = {
    name: "bonnet",
    category: "child",
    gender: "female",
    size: "S",
    type: "hat",
    stock_count: 8,
    price: 14.99
}


// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe("createTables adapter", () => {
    it("should create a table", async () => {
        await createTables(pool);

        const costumes = await pool.query(`
            SELECT * FROM costumes;
        `)

        expect(costumes).toBeTruthy();
    })
})

describe("createCostume adapter", () => {
    it("should create a new row in the table", async () => {
        await createTables(pool);

        const {rows} = await pool.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsBefore = rows[0].count;

        await createCostume(pool, ballroomGown);
        const {rows: rowsAfterAddingCostume} = await pool.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsAfter = rowsAfterAddingCostume[0].count;

        expect(rowsBefore).toBe('0')
        expect(rowsAfter).toBe('1');
    })

    it("should create a new entry with correct values", async () => {
        await createTables(pool);

        await createCostume(pool, buttlessChaps);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        
        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        await createTables(pool);

        await createCostume(pool, bonnet);
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        await createCostume(pool, buttlessChaps);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);

        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(buttlessChaps, bonnetFromDatabase)).toBe(false);
        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(bonnet, chapsFromDatabase)).toBe(false);

    })

    // TODO: get this test to work
    it.only("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createCostume(
                pool,
                "mutton chops",
                "adult",
                "male",
                "M",
                "facial hair",
                6
            )
        } catch (e) {
            expect(e.name).toMatch('error');
            expect((e.code)).toMatch('23502');
        }
        
            
    })

})

describe("getAllCostumes adapter", () => {
    it("should get all rows in costumes table", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);

        const {rows: [gownFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='ballroom gown';
        `);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);

        const costumes = await getAllCostumes(pool);

        expect(costumes).toContainEqual(gownFromDatabase);
        expect(costumes).toContainEqual(chapsFromDatabase);
        expect(costumes).toContainEqual(bonnetFromDatabase);
    })

    it("should get all costumes and then again after costumes have been updated or deleted", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);

        const {rows: [gownFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='ballroom gown';
        `);
        const {rows: [chapsFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        const {rows: [bonnetFromDatabase]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);

        const costumes = await getAllCostumes(pool);

        expect(costumes).toContainEqual(gownFromDatabase);
        expect(costumes).toContainEqual(chapsFromDatabase);
        expect(costumes).toContainEqual(bonnetFromDatabase);

        await deleteCostumeById(pool, 3);

        await updateCostume(pool, 1, bigBallroomGown);
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
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);

        const gownFromDatabase = await getCostumeById(pool, 1);
        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);
    })

    it("should get costumes that are middle or last entry in table", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);

        const bonnetFromDatabase = await getCostumeById(pool, 3);
        const chapsFromDatabase = await getCostumeById(pool, 2);

        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);

    })
})

describe("updateCostume adapter", () => {
    it("should update costumes one after another", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        const gownFromDatabase = await getCostumeById(pool, 1);
        const chapsFromDatabase = await getCostumeById(pool, 2);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);

        await updateCostume(pool, 1, bigBallroomGown)
        await updateCostume(pool, 2, bonnet)
        const updatedGownFromDatabase = await getCostumeById(pool, 1);
        const bonnetFromDatabase = await getCostumeById(pool, 2);

        expect(matchesCostumeInDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);
    })

    it("should be able to update the same costume more than one", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, bigBallroomGown)
        const updatedGownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, buttlessChaps)
        const chapsFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
    })

    it("should update costume values when one value is changed", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, bigBallroomGown)
        const updatedGownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);
    })

    it("should update costume values when all values are changed", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);

        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);

        await updateCostume(pool, 1, buttlessChaps)
        const chapsFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
    })

    it("should only update costume it selects by id", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);

        const gownFromDatabase = await getCostumeById(pool, 1);
        const chapsFromDatabase = await getCostumeById(pool, 2);
  

        await updateCostume(pool, 2, bonnet);
        const bonnetFromDatabase = await getCostumeById(pool, 2);

        expect(matchesCostumeInDatabase(bonnet, bonnetFromDatabase)).toBe(true);
        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);

    })
})

describe("deleteCostumeById adapter", () => {
    it("should delete row when there is only one row", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        const gownFromDatabase = await getCostumeById(pool, 1);

        expect(matchesCostumeInDatabase(ballroomGown, gownFromDatabase)).toBe(true);

        await deleteCostumeById(pool, 1);
        const costumes = await getAllCostumes(pool);

        expect(costumes).toStrictEqual([])
        expect(costumes).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);

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
})