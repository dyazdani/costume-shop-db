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
    // Disconnect from postgres database after tests
    afterAll(async () => {
        pool.end();
    })

    it("should create a new row in the table", async () => {
        //TODO: Fix this open handle
        const client = await pool.connect();
        console.log("connected");
        await createTables();
        const {rows} = await client.query(`
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
        const {rows: rowsAfterAddingCostume} = await client.query(`
            SELECT COUNT(*) FROM costumes;
        `)
        const rowsAfter = rowsAfterAddingCostume[0].count;
        expect(rowsBefore).toStrictEqual('0')
        expect(rowsAfter).toStrictEqual('1');
        client.release();
    })

    it("should create a new entry with correct values", async () => {
        const client = await pool.connect();
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
        const {rows: [chaps]} = await client.query(`
            SELECT * FROM costumes WHERE name='buttless chaps';
        `);
        
        expect(chaps.name).toBe("buttless chaps");
        expect(chaps.category).toBe("adult");
        expect(chaps.gender).toBe("unisex");
        expect(chaps.size).toBe("M");
        expect(chaps.type).toBe("pants");
        expect(chaps.stock_count).toBe(3);
        expect(chaps.price).toBe(75.99);
        client.release();
    })
})