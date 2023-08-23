const {
    createTables, 
    createCostume, 
    getAllCostumes, 
    getCostumeById, 
    updateCostume, 
    deleteCostumeById
} = require(".././index");
const {Pool} = require("pg");

let pool; 
if (process.env.NODE_ENV === "test") {
    pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'costume_shop_db_test'
    });
    pool.on("error", (error) => {
        console.error(error.stack())
    })
} else {
    throw new Error("NODE_ENV environment variable not set to 'test'. Testing aborted.")
}  

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe("createTables adapter", () => {
    it("should create a table", async () => {
        //TODO: Fix this open handle
        // console.log("connected");
        await createTables();
        const costumes = await pool.query(`
            SELECT * FROM costumes;
        `)
        expect(costumes).toBeTruthy();
    })
})

describe("createCostume adapter", () => {
    it("should create a new row in the table", async () => {
        //TODO: Fix this open handle
        console.log("connected");
        await createTables();
        const {rows} = await pool.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsBefore = rows[0].count;
        await createCostume(
            "ballroom gown",
            "adult",
            "female",
            "L",
            "dress",
            1,
            150.99
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
        await createTables();
        await createCostume(
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
        await createTables();
        await createCostume(
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
})

//TODO: Add test: should get all costumes and then again after adding or deleting another costume

describe("getAllCostumes adapter", () => {
    it("should get all rows in costumes table", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "mutton chops",
            "adult",
            "male",
            "M",
            "facial hair",
            6,
            4.99
        );
        await createCostume(
            "platform heels",
            "adult",
            "female",
            "M",
            "shoes",
            2,
            54.99
        );
        await createCostume(
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

        const costumes = await getAllCostumes();
        console.log(costumes)

        expect(costumes).toContainEqual(chops);
        expect(costumes).toContainEqual(heels);
        expect(costumes).toContainEqual(monocle);
    })
})

describe("getCostumeById adapter", () => {
    it("should get costume that is first entry in table", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "wool leggings",
            "adult",
            "female",
            "M",
            "tights",
            3,
            17.99
        );
        await createCostume(
            "bloomers",
            "baby",
            "unisex",
            "S",
            "underwear",
            5,
            13.99
        );
        await createCostume(
            "tank top",
            "adult",
            "unisex",
            "L",
            "shirt",
            8,
            18.99
        );
        const leggings = await getCostumeById(1);
        expect(leggings.name).toBe("wool leggings");
    })

    it("should get costumes that is middle or last entry in table", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "diamond grill",
            "adult",
            "unisex",
            "M",
            "jewelry",
            1,
            119.99
        );
        await createCostume(
            "go-go boots",
            "adult",
            "female",
            "XL",
            "shoes",
            2,
            64.99
        );
        await createCostume(
            "wayfarers",
            "child",
            "unisex",
            "S",
            "glasses",
            1,
            34.99
        );
        const wayfarers = await getCostumeById(3);
        expect(wayfarers.name).toBe("wayfarers");
        const boots = await getCostumeById(2);
        expect(boots.name).toBe("go-go boots");        
    })
})

//TODO: add test: update more than one costume in a row
//TODO: add test: update the same costume more than once

describe("updateCostume adapter", () => {
    it("should update costume values when one value is changed", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "short shorts",
            "adult",
            "unisex",
            "M",
            "pants",
            2,
            31.99
        );
        const shorts = await getCostumeById(1);
        expect(shorts.name).toBe("short shorts");

       await updateCostume(
            1,
            "very short shorts",
            "adult",
            "unisex",
            "M",
            "jewelry",
            1,
            31.99
        );
        const shortsAgain = await getCostumeById(1);
        expect(shortsAgain.name).toBe("very short shorts");
    })

    it("should update costume values when all values are changed", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "chestplate",
            "adult",
            "unisex",
            "M",
            "armor",
            1,
            73.98
        );
        const chestplate = await getCostumeById(1);
        expect(chestplate.name).toBe("chestplate");
        expect(chestplate.category).toBe("adult");
        expect(chestplate.gender).toBe("unisex");
        expect(chestplate.size).toBe("M");
        expect(chestplate.type).toBe("armor");
        expect(chestplate.stock_count).toBe(1);
        expect(chestplate.price).toBe(73.98);

        await updateCostume(
            1,
            "breastplate",
            "pet",
            "female",
            "S",
            "dog",
            3,
            33.98
        );
        const breastplate = await getCostumeById(1);
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
        await createTables();
        await createCostume(
            "dunce cap",
            "child",
            "unisex",
            "S",
            "hat",
            3,
            14.99
        );
        await createCostume(
            "propeller cap",
            "child",
            "unisex",
            "S",
            "hat",
            4,
            34.99
        );
        const propellerCap = await getCostumeById(2);
        expect(propellerCap.name).toBe("propeller cap");
        expect(propellerCap.category).toBe("child");

        await updateCostume(
            2,
            "flying propeller cap",
            "adult",
            "unisex",
            "S",
            "hat",
            4,
            34.99
        );
        const flyingPropellerCap = await getCostumeById(2);
        expect(flyingPropellerCap.name).toBe("flying propeller cap");
        expect(flyingPropellerCap.category).toBe("adult");

        const dunceCap = await getCostumeById(1);
        expect(dunceCap.name).toBe("dunce cap");
        expect(dunceCap.category).toBe("child");

    })
})

describe("updateCostume adapter", () => {
    it("should delete row when there is only one row", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "Groucho glasses",
            "adult",
            "unisex",
            "M",
            "glasses",
            2,
            5.99
        );
        const groucho = await getCostumeById(1);
        expect(groucho.name).toBe("Groucho glasses");

        await deleteCostumeById(1);
        const costumes = await getAllCostumes();
        console.log(costumes);
        expect(costumes).toStrictEqual([])
        expect(costumes).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        console.log("connected");
        await createTables();
        await createCostume(
            "hoodie",
            "child",
            "unisex",
            "L",
            "coats",
            5,
            25.99
        );
        await createCostume(
            "pantaloons",
            "adult",
            "unisex",
            "XXL",
            "pants",
            7,
            33.99
        );
        await createCostume(
            "clown nose",
            "adult",
            "unisex",
            "L",
            "accessory",
            12,
            5.99
        );
        const hoodie = await getCostumeById(1);
        console.log(hoodie);
        expect(hoodie.name).toBe("hoodie")
        const pantaloons = await getCostumeById(2);
        expect(pantaloons.name).toBe("pantaloons")
        const clownNose = await getCostumeById(3);
        expect(clownNose.name).toBe("clown nose")

        deleteCostumeById(2);
        const costumes = await getAllCostumes();
        console.log(costumes);
        expect(costumes).toContainEqual(hoodie);
        expect(costumes).toContainEqual(clownNose);
        expect(costumes).not.toContainEqual(pantaloons);
        expect(costumes).toHaveLength(2);

    })
})