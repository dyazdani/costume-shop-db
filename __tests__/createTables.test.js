const {client, createTables} = require(".././index");

describe("createTables adapter", () => {
    beforeAll( async () => {
        await client.connect();
        console.log("connected");
    })
    afterAll( async () => {
        await client.end();
        console.log("connection closed");
    })

    it("should create table names 'costumes'", async () => {
        const table = await createTables();
        console.log("successfully created tables");
        expect(table).toBe("cos")
    })
})