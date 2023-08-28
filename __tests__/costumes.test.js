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
    // it.only("should throw an error if not given enough arguments", async () => {
    //     await createTables(pool);
    //     expect(async () => {
    //         await createCostume(
    //             pool,
    //             "mutton chops",
    //             "adult",
    //             "male",
    //             "M",
    //             "facial hair",
    //             6
    //         )
    //     }).toThrow(new Error(`error: null value in column "price" of relation "costumes" violates not-null constraint`))
    // })

})

//TODO: Add test: should get all costumes and then again after adding or deleting another costume

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

//TODO: add test: update more than one costume in a row
//TODO: add test: update the same costume more than once

//TODO: use object arguments on all the tests below this
// TODO: use helper function in expect calls for all tests below

describe("updateCostume adapter", () => {
    it.only("should update costume values when one value is changed", async () => {
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
//TODO: change name of describe
describe("updateCostume adapter", () => {
    it("should delete row when there is only one row", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "Groucho glasses",
            "adult",
            "unisex",
            "M",
            "glasses",
            2,
            5.99
        );
        const groucho = await getCostumeById(pool, 1);
        expect(groucho.name).toBe("Groucho glasses");

        await deleteCostumeById(pool, 1);
        const costumes = await getAllCostumes(pool);
        console.log(costumes);
        expect(costumes).toStrictEqual([])
        expect(costumes).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "hoodie",
            "child",
            "unisex",
            "L",
            "coats",
            5,
            25.99
        );
        await createCostume(
            pool,
            "pantaloons",
            "adult",
            "unisex",
            "XXL",
            "pants",
            7,
            33.99
        );
        await createCostume(
            pool,
            "clown nose",
            "adult",
            "unisex",
            "L",
            "accessory",
            12,
            5.99
        );
        const hoodie = await getCostumeById(pool, 1);
        console.log(hoodie);
        expect(hoodie.name).toBe("hoodie")
        const pantaloons = await getCostumeById(pool, 2);
        expect(pantaloons.name).toBe("pantaloons")
        const clownNose = await getCostumeById(pool, 3);
        expect(clownNose.name).toBe("clown nose")

        deleteCostumeById(pool, 2);
        const costumes = await getAllCostumes(pool);
        console.log(costumes);
        expect(costumes).toContainEqual(hoodie);
        expect(costumes).toContainEqual(clownNose);
        expect(costumes).not.toContainEqual(pantaloons);
        expect(costumes).toHaveLength(2);

    })
})