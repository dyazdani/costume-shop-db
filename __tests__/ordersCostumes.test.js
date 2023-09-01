const {
    createTables, 
    addCostumeToOrder,
    getAllOrdersOfCostumeById,
    getAllCostumesInOrderById,
    removeCostumeFromOrder,
    getPool
} = require(".././index");

const { 
    matchesDatabase,
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