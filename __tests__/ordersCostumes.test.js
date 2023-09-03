const {
    createTables, 
    addCostumeToOrder,
    getAllOrdersOfCostumeById,
    getAllCostumesFromOrderById,
    removeCostumeFromOrder,
    getPool,
    createCostume,
    createCustomer,
    createOrder
} = require(".././index");

const { 
    matchesDatabase,
    ballroomGown,
    buttlessChaps,
    bonnet,
    orderOne,
    orderTwo,
    orderThree,
    orderWithMissingArgs,
    orderWithNull,
    orderWithInvalidStatus,
    anotherBilboOrder,
    yetAnotherBilboOrder,
    anotherDrogoOrder,
    orderOneCompleted,
    bilbo,
    drogo,
    bozo,
} = require("../utilities");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe("createTables adapter", () => {
    it("should orders_costumes table", async () => {
        await createTables(pool);

        const ordersCostumes = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(ordersCostumes).toBeTruthy();
    })
})

describe("addCostumeToOrder adapter", () => {
    it("should add costume to order", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        const costumeOrderEntry = await addCostumeToOrder(pool, 1, 1);

        const {rows: [costumeOrderEntryFromDatabase]} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(matchesDatabase(costumeOrderEntry, costumeOrderEntryFromDatabase)).toBe(true);
    })

    it("should add multiple costumes to one order", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);
        
        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        const entryOne = await addCostumeToOrder(pool, 1, 1);
        const entryTwo = await addCostumeToOrder(pool, 2, 1);
        const entryThree = await addCostumeToOrder(pool, 3, 1);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(matchesDatabase(entryOne, entries[0])).toBe(true);
        expect(entries[0].costume_id).toBe(1);

        expect(matchesDatabase(entryTwo, entries[1])).toBe(true);
        expect(entries[1].costume_id).toBe(2);

        expect(matchesDatabase(entryThree, entries[2])).toBe(true);
        expect(entries[2].costume_id).toBe(3);
    })
    it("should add the same costume to multiple orders", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        
        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const entryOne = await addCostumeToOrder(pool, 1, 1);
        const entryTwo = await addCostumeToOrder(pool, 1, 2);
        const entryThree = await addCostumeToOrder(pool, 1, 3);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(matchesDatabase(entryOne, entries[0])).toBe(true);
        expect(entries[0].order_id).toBe(1);

        expect(matchesDatabase(entryTwo, entries[1])).toBe(true);
        expect(entries[1].order_id).toBe(2);
        
        expect(matchesDatabase(entryThree, entries[2])).toBe(true);
        expect(entries[2].order_id).toBe(3);
    })
    it("should throw error if costume id does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCostume(pool, ballroomGown);

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        try {
            await addCostumeToOrder(pool, 3, 1)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })

    it("should throw error if order id does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCostume(pool, ballroomGown);

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        try {
            await addCostumeToOrder(pool, 1, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})