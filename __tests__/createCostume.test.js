const {createTables, createCostume} = require(".././index");
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

describe("createCostume adapter", () => {
    // Connect to postgres database and create table before tests
    beforeAll(async () => {
        await client.connect();
        console.log("connected");
        await createTables();
    })
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should create a new row in the table", async () => {
        const {rows} = await client.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsBefore = rows[0].count;
        const costume = await createCostume(
            "ballroom gown",
            "adult",
            "female",
            "L",
            "dress",
            1,
            150.99
        );
        const {rows: rows2} = await client.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsAfter = rows2[0].count;
        expect(rowsBefore).toStrictEqual('0')
        expect(rowsAfter).toStrictEqual('1');
    })
})