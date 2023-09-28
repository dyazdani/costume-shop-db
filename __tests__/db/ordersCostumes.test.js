const {
    createTables, 
    addCostumeToOrder,
    getAllOrdersOfCostumeById,
    getCostumesByOrderId,
    removeCostumeFromOrder,
    getPool,
    createCostume,
    createCustomer,
    createOrder,
    updateOrder,
    updateCostume
} = require("../../server/db");

const { 
    getBallroomGown,
    getBigBallroomGown,
    getButtlessChaps,
    getBonnet,
    getBonnetWithBees,
    getButtfulChaps,
    getOrderOne,
    getOrderTwo,
    getOrderThree,
    getOrderFour,
    getOrderFive,
    getAnotherLogoOrder,
    getBilbo,
    getDrogo,
    getBozo,
    getLogo,
    getPogo
} = require("../../server/db/utils");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

beforeEach(async () => {
    await createTables(pool);

    await createCostume(pool, getBallroomGown());
    await createCostume(pool, getButtlessChaps());
    await createCostume(pool, getBonnet());

    await createCustomer(pool, getBilbo());
    await createCustomer(pool, getDrogo());
    await createCustomer(pool, getBozo());

    await createOrder(pool, getOrderOne());
    await createOrder(pool, getOrderTwo());
    await createOrder(pool, getOrderThree());
})

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe.skip("createTables adapter", () => {
    it("should orders_costumes table", async () => {
        const ordersCostumes = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(ordersCostumes).toBeTruthy();
    })
})

describe.skip("addCostumeToOrder adapter", () => {
    it("should add costume to order", async () => {
        await addCostumeToOrder(pool, 1, 1);

        const {rows: [entry]} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(entry.costume_id).toBe(1);
        expect(entry.order_id).toBe(1);
    })

    it("should add multiple costumes to one order", async () => {
        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 2, 1);
        await addCostumeToOrder(pool, 3, 1);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(entries[0].costume_id).toBe(1);
        expect(entries[1].costume_id).toBe(2);
        expect(entries[2].costume_id).toBe(3);
    })

    it("should add the same costume to multiple orders", async () => {
        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 1, 2);
        await addCostumeToOrder(pool, 1, 3);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(entries[0].order_id).toBe(1);
        expect(entries[1].order_id).toBe(2);
        expect(entries[2].order_id).toBe(3);
    })

    it("should add costumes to orders that have different IDs than them", async () => {
        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 2, 3);
        await addCostumeToOrder(pool, 3, 2);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(entries[0].order_id).toBe(1);
        expect(entries[1].order_id).toBe(3);
        expect(entries[2].order_id).toBe(2);
    })
})

describe.skip("removeCostumeToOrder adapter", () => {
    beforeEach(async () => {
        await addCostumeToOrder(pool, 1, 1);
    })
    it("should remove costume from order", async () => {
        const entryTwo = await addCostumeToOrder(pool, 2, 1);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        await removeCostumeFromOrder(pool, 1, 1)

        const {rows: updatedEntries} = await pool.query(`
        SELECT * FROM orders_costumes;
    `)
        expect(entries.length).toBe(2);
        expect(updatedEntries.length).toBe(1);
        expect(entryTwo).toStrictEqual(updatedEntries[0]);
    })

    it("should remove multiple costumes from one order", async () => {
        await addCostumeToOrder(pool, 2, 1);
        const entryThree = await addCostumeToOrder(pool, 3, 1);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        await removeCostumeFromOrder(pool, 1, 1)
        await removeCostumeFromOrder(pool, 2, 1)

        const {rows: updatedEntries} = await pool.query(`
        SELECT * FROM orders_costumes;
    `)
        expect(entries.length).toBe(3);
        expect(updatedEntries.length).toBe(1);
        expect(entryThree).toStrictEqual(updatedEntries[0]);
    })

    it("should remove the same costume from multiple orders", async () => {
        const entryTwo = await addCostumeToOrder(pool, 1, 2);
        await addCostumeToOrder(pool, 1, 3);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        await removeCostumeFromOrder(pool, 1, 1)
        await removeCostumeFromOrder(pool, 1, 3)

        const {rows: updatedEntries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(entries.length).toBe(3);
        expect(updatedEntries.length).toBe(1);
        expect(entryTwo).toStrictEqual(updatedEntries[0]);
    })

    it("should remove costumes from orders that have IDs that differ from them", async () => {
        const entryTwo = await addCostumeToOrder(pool, 2, 3);
        await addCostumeToOrder(pool, 3, 2);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        await removeCostumeFromOrder(pool, 1, 1)
        await removeCostumeFromOrder(pool, 3, 2)

        const {rows: updatedEntries} = await pool.query(`
        SELECT * FROM orders_costumes;
    `)
        expect(entries.length).toBe(3);
        expect(updatedEntries.length).toBe(1);
        expect(entryTwo).toStrictEqual(updatedEntries[0]);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await removeCostumeFromOrder(pool, 4, 4)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("getCostumesByOrderId adapter", () => {
    beforeEach(async () => {
        await createCostume(pool, getBonnetWithBees())
        await createCostume(pool, getBigBallroomGown())

        await addCostumeToOrder(pool, 1, 2);
        await addCostumeToOrder(pool, 2, 1);
        await addCostumeToOrder(pool, 3, 3);
        await addCostumeToOrder(pool, 4, 1);
        await addCostumeToOrder(pool, 5, 1);
    })
    it("should get all costumes", async () => {
        const costumes = await getCostumesByOrderId(pool, 1);

        expect(costumes.length).toBe(3);
        expect(costumes[0].name).toBe('buttless chaps');
        expect(costumes[1].name).toBe('bonnet with bees');
        expect(costumes[2].name).toBe('big ballroom gown');
    })

    it("should get all costumes, and then again after updates and deletions of orders", async () => {
        const costumes = await getCostumesByOrderId(pool, 1);

        expect(costumes.length).toBe(3);
        expect(costumes[0].name).toBe('buttless chaps');
        expect(costumes[1].name).toBe('bonnet with bees');
        expect(costumes[2].name).toBe('big ballroom gown');
        
        await removeCostumeFromOrder(pool, 2, 1)

        const updatedCostumes = await getCostumesByOrderId(pool, 1);

        expect(updatedCostumes.length).toBe(2);
        expect(updatedCostumes[0].name).toBe('bonnet with bees');
        expect(updatedCostumes[1].name).toBe('big ballroom gown');

        await updateCostume(pool, 4, getButtfulChaps());

        const updatedAgainCostumes = await getCostumesByOrderId(pool, 1);

        expect(updatedAgainCostumes.length).toBe(2);

        expect(updatedAgainCostumes[1].name).toBe('buttful chaps');
        expect(updatedAgainCostumes[0].name).toBe('big ballroom gown');
    })
})

describe.skip("getAllOrdersOfCostumeById adapter", () => {
    beforeEach(async () => {
        await createCustomer(pool, getLogo());
        await createCustomer(pool, getPogo());

        await createOrder(pool, getOrderFour());
        await createOrder(pool, getOrderFive());

        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 2, 2);
        await addCostumeToOrder(pool, 1, 3);
        await addCostumeToOrder(pool, 2, 4);
        await addCostumeToOrder(pool, 3, 5);
    })
    it("should get all orders", async () => {
        const orders = await getAllOrdersOfCostumeById(pool, 2);

        expect(orders.length).toBe(2);
        expect(orders[0].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2010-11-04T00:00:00.000Z');
    })

    it("should get all orders, and then again after updates and deletions of orders", async () => {
        const orders = await getAllOrdersOfCostumeById(pool, 2);

        expect(orders.length).toBe(2);
        expect(orders[0].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2010-11-04T00:00:00.000Z');
        
        await removeCostumeFromOrder(pool, 2, 2)

        const updatedOrders = await getAllOrdersOfCostumeById(pool, 2);

        expect(updatedOrders.length).toBe(1);
        expect(orders[1].date_placed.toISOString()).toBe('2010-11-04T00:00:00.000Z');

        await updateOrder(pool, 4, getAnotherLogoOrder());

        const updatedAgainOrders = await getAllOrdersOfCostumeById(pool, 2);

        expect(updatedAgainOrders.length).toBe(1);

        expect(updatedAgainOrders[0].date_placed.toISOString()).toBe('2001-05-05T00:00:00.000Z');
    })
})