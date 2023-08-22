const {
    createTables, 
    createCostume, 
    getAllCostumes, 
    getCostumeById, 
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

describe("updateCostume adapter", () => {
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should delete row when there is only one row", async () => {
        const client = await pool.connect();
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
        client.release();
    })

    it("should delete row when there are multiple rows", async () => {
        const client = await pool.connect();
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

        client.release();
    })
})