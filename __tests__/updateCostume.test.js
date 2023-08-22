const {createTables, createCostume, getCostumeById, updateCostume} = require(".././index");
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

describe("updateCostume adapter", () => {
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should update costume values when one value is changed", async () => {
        const client = await pool.connect();
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
        client.release();
    })

    it("should update costume values when all values are changed", async () => {
        const client = await pool.connect();
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
        client.release();
    })

    it("should only update costume it selects by id", async () => {
        const client = await pool.connect();
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

        client.release();
    })
})