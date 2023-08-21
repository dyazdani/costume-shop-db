const {client, createTables} = require(".././index");

describe("createTables adapter", () => {
    // Connect to postgres database before each test
    beforeAll(async () => {
        await client.connect();
        console.log("connected");
    })
    // Disconnect from postgres database after each test
    afterAll(async () => {
        await client.end();
        console.log("connection closed");
    })

    it("should create a table", async () => {
        const table = await createTables();
        expect(table).toBeTruthy();

    })

    it("should create table with the name 'costumes'", async () => {
        const table = await createTables();
        expect(table).toBe("costumes")
    })
})