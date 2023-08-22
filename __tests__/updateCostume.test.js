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
})