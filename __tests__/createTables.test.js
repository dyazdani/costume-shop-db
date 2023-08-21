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
    pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'costume_shop_db_dev'
    });
    pool.on("error", (error) => {
        console.error(error.stack())
    })
}  

describe("createTables adapter", () => {
    // Disconnect from postgres database after all tests done
    afterAll(() => {
        pool.end()
    })
    it("should create a table", async () => {
        const client = await pool.connect();
        console.log("connected");
        const table = await createTables();
        expect(table).toBeTruthy();
        client.release();
        console.log("client released");
    })

    it("should create table with the name 'costumes'", async () => {
        const client = await pool.connect();
        console.log("connected");
        const table = await createTables();
        expect(table).toBe("costumes")
        client.release();
        console.log("client released");
    })
})