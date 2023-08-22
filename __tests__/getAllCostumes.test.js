const {createTables, createCostume, getAllCostumes} = require(".././index");
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

describe("getAllCostumes adapter", () => {
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should get all rows in costumes table", async () => {
        const client = await pool.connect();
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
        const {rows: [chops]} = await client.query(`
            SELECT * FROM costumes WHERE name='mutton chops';
        `);
        const {rows: [heels]} = await client.query(`
            SELECT * FROM costumes WHERE name='platform heels';
        `);
        const {rows: [monocle]} = await client.query(`
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
        client.release();
    })

})