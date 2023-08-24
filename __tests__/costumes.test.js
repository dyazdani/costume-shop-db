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
// TODO: create more objects like this one to use as arguments to function calls
const ballroomGown = {
    costumeName: "ballroom gown",
    category: "adult",
    gender: "female",
    size: "L",
    type: "dress",
    stockCount: 1,
    price: 150.99
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
    it.only("should create a new row in the table", async () => {
        console.log("connected");
        await createTables(pool);
        const {rows} = await pool.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsBefore = rows[0].count;
        await createCostume(
            pool,
            ballroomGown
        );
        const {rows: rowsAfterAddingCostume} = await pool.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsAfter = rowsAfterAddingCostume[0].count;
        expect(rowsBefore).toBe('0')
        expect(rowsAfter).toBe('1');
    })

    it("should create a new entry with correct values", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "buttless chaps",
            "adult",
            "unisex",
            "M",
            "pants",
            3,
            75.99
        );
        const {rows: [chaps]} = await pool.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        expect(chaps.name).toBe("buttless chaps");
        expect(chaps.category).toBe("adult");
        expect(chaps.gender).toBe("unisex");
        expect(chaps.size).toBe("M");
        expect(chaps.type).toBe("pants");
        expect(chaps.stock_count).toBe(3);
        expect(chaps.price).toBe(75.99);
    })

    it("should create multiple entries when called multiple times", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "bonnet",
            "child",
            "female",
            "S",
            "hat",
            8,
            14.99
        );
        const {rows: [bonnet]} = await pool.query(`
            SELECT * FROM costumes WHERE name='bonnet';
        `);
        await createCostume(
            pool,
            "epaulet",
            "adult",
            "unisex",
            "M",
            "accessory",
            4,
            24.99
        );
        const {rows: [epaulet]} = await pool.query(`
            SELECT * FROM costumes WHERE name='epaulet';
        `);
        expect(bonnet.name).toBe("bonnet");
        expect(bonnet.category).toBe("child");
        expect(bonnet.gender).toBe("female");
        expect(bonnet.size).toBe("S");
        expect(bonnet.type).toBe("hat");
        expect(bonnet.stock_count).toBe(8);
        expect(bonnet.price).toBe(14.99);

        expect(epaulet.name).toBe("epaulet");
        expect(epaulet.category).toBe("adult");
        expect(epaulet.gender).toBe("unisex");
        expect(epaulet.size).toBe("M");
        expect(epaulet.type).toBe("accessory");
        expect(epaulet.stock_count).toBe(4);
        expect(epaulet.price).toBe(24.99);
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
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "mutton chops",
            "adult",
            "male",
            "M",
            "facial hair",
            6,
            4.99
        );
        await createCostume(
            pool,
            "platform heels",
            "adult",
            "female",
            "M",
            "shoes",
            2,
            54.99
        );
        await createCostume(
            pool,
            "monocle",
            "pet",
            "unisex",
            "S",
            "glasses",
            1,
            9.99
        );
        const {rows: [chops]} = await pool.query(`
            SELECT * FROM costumes WHERE name='mutton chops';
        `);
        const {rows: [heels]} = await pool.query(`
            SELECT * FROM costumes WHERE name='platform heels';
        `);
        const {rows: [monocle]} = await pool.query(`
            SELECT * FROM costumes WHERE name='monocle';
        `);

        expect(chops.name).toBe("mutton chops");
        expect(heels.name).toBe("platform heels");
        expect(monocle.name).toBe("monocle");

        const costumes = await getAllCostumes(pool);
        console.log(costumes)

        expect(costumes).toContainEqual(chops);
        expect(costumes).toContainEqual(heels);
        expect(costumes).toContainEqual(monocle);
    })
})

describe("getCostumeById adapter", () => {
    it("should get costume that is first entry in table", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "wool leggings",
            "adult",
            "female",
            "M",
            "tights",
            3,
            17.99
        );
        await createCostume(
            pool,
            "bloomers",
            "baby",
            "unisex",
            "S",
            "underwear",
            5,
            13.99
        );
        await createCostume(
            pool,
            "tank top",
            "adult",
            "unisex",
            "L",
            "shirt",
            8,
            18.99
        );
        const leggings = await getCostumeById(pool, 1);
        expect(leggings.name).toBe("wool leggings");
    })

    it("should get costumes that is middle or last entry in table", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "diamond grill",
            "adult",
            "unisex",
            "M",
            "jewelry",
            1,
            119.99
        );
        await createCostume(
            pool,
            "go-go boots",
            "adult",
            "female",
            "XL",
            "shoes",
            2,
            64.99
        );
        await createCostume(
            pool,
            "wayfarers",
            "child",
            "unisex",
            "S",
            "glasses",
            1,
            34.99
        );
        const wayfarers = await getCostumeById(pool, 3);
        expect(wayfarers.name).toBe("wayfarers");
        const boots = await getCostumeById(pool, 2);
        expect(boots.name).toBe("go-go boots");        
    })
})

//TODO: add test: update more than one costume in a row
//TODO: add test: update the same costume more than once

describe("updateCostume adapter", () => {
    it("should update costume values when one value is changed", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "short shorts",
            "adult",
            "unisex",
            "M",
            "pants",
            2,
            31.99
        );
        const shorts = await getCostumeById(pool, 1);
        expect(shorts.name).toBe("short shorts");
       await updateCostume(
            pool,
            1,
            "very short shorts",
            "adult",
            "unisex",
            "M",
            "jewelry",
            1,
            31.99
        );
        const shortsAgain = await getCostumeById(pool, 1);
        expect(shortsAgain.name).toBe("very short shorts");
    })

    it("should update costume values when all values are changed", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "chestplate",
            "adult",
            "unisex",
            "M",
            "armor",
            1,
            73.98
        );
        const chestplate = await getCostumeById(pool, 1);
        expect(chestplate.name).toBe("chestplate");
        expect(chestplate.category).toBe("adult");
        expect(chestplate.gender).toBe("unisex");
        expect(chestplate.size).toBe("M");
        expect(chestplate.type).toBe("armor");
        expect(chestplate.stock_count).toBe(1);
        expect(chestplate.price).toBe(73.98);

        await updateCostume(
            pool,
            1,
            "breastplate",
            "pet",
            "female",
            "S",
            "dog",
            3,
            33.98
        );
        const breastplate = await getCostumeById(pool, 1);
        expect(breastplate.name).toBe("breastplate");
        expect(breastplate.category).toBe("pet");
        expect(breastplate.gender).toBe("female");
        expect(breastplate.size).toBe("S");
        expect(breastplate.type).toBe("dog");
        expect(breastplate.stock_count).toBe(3);
        expect(breastplate.price).toBe(33.98);
    })

    it("should only update costume it selects by id", async () => {
        console.log("connected");
        await createTables(pool);
        await createCostume(
            pool,
            "dunce cap",
            "child",
            "unisex",
            "S",
            "hat",
            3,
            14.99
        );
        await createCostume(
            pool,
            "propeller cap",
            "child",
            "unisex",
            "S",
            "hat",
            4,
            34.99
        );
        const propellerCap = await getCostumeById(pool, 2);
        expect(propellerCap.name).toBe("propeller cap");
        expect(propellerCap.category).toBe("child");

        await updateCostume(
            pool,
            2,
            "flying propeller cap",
            "adult",
            "unisex",
            "S",
            "hat",
            4,
            34.99
        );
        const flyingPropellerCap = await getCostumeById(pool, 2);
        expect(flyingPropellerCap.name).toBe("flying propeller cap");
        expect(flyingPropellerCap.category).toBe("adult");

        const dunceCap = await getCostumeById(pool, 1);
        expect(dunceCap.name).toBe("dunce cap");
        expect(dunceCap.category).toBe("child");

    })
})

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