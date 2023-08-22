const {createTables} = require(".././index");
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

describe("createTables adapter", () => {
    // Disconnect from postgres database after all tests done
    afterAll(() => {
        pool.end()
    })
    it("should create a table", async () => {
        //TODO: Fix this open handle
        const client = await pool.connect();
        console.log("connected");
        await createTables();
        const costumes = await client.query(`
            SELECT * FROM costumes;
        `)
        expect(costumes).toBeTruthy();
        client.release();
    })
})