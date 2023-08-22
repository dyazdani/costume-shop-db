const {createTables, createCostume, getCostumeById} = require(".././index");
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

describe("getCostumeById adapter", () => {
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should get costume that is first entry in table", async () => {
        const client = await pool.connect();
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
        client.release();
    })

    it("should get costumes that is middle or last entry in table", async () => {
        const client = await pool.connect();
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
        client.release();
    })
})