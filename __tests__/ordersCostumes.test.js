const {
    createTables, 
    addCostumeToOrder,
    getAllOrdersOfCostumeById,
    getAllCostumesFromOrderById,
    removeCostumeFromOrder,
    getPool,
    createCostume,
    createCustomer,
    createOrder,
    updateOrder,
    updateCostume
} = require(".././index");

const { 
    matchesDatabase,
    ballroomGown,
    bigBallroomGown,
    buttlessChaps,
    bonnet,
    bonnetWithBees,
    buttfulChaps,
    orderOne,
    orderTwo,
    orderThree,
    orderFour,
    orderFive,
    anotherLogoOrder,
    bilbo,
    drogo,
    bozo,
    logo,
    pogo
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

    it("should add costumes to orders that have different IDs than them", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);
        
        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const entryOne = await addCostumeToOrder(pool, 1, 1);
        const entryTwo = await addCostumeToOrder(pool, 2, 3);
        const entryThree = await addCostumeToOrder(pool, 3, 2);

        const {rows: entries} = await pool.query(`
            SELECT * FROM orders_costumes;
        `)

        expect(matchesDatabase(entryOne, entries[0])).toBe(true);
        expect(entries[0].order_id).toBe(1);

        expect(matchesDatabase(entryTwo, entries[1])).toBe(true);
        expect(entries[1].order_id).toBe(3);

        expect(matchesDatabase(entryThree, entries[2])).toBe(true);
        expect(entries[2].order_id).toBe(2);
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

describe("removeCostumeToOrder adapter", () => {
    it("should remove costume from order", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        await addCostumeToOrder(pool, 1, 1);
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

        expect(matchesDatabase(entryTwo, updatedEntries[0])).toBe(true);
    })

    it("should remove multiple costumes from one order", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);
        
        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        await addCostumeToOrder(pool, 1, 1);
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

        expect(matchesDatabase(entryThree, updatedEntries[0])).toBe(true);
    })

    it("should remove the same costume from multiple orders", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        
        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        await addCostumeToOrder(pool, 1, 1);
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

        expect(matchesDatabase(entryTwo, updatedEntries[0])).toBe(true);
    })

    it("should remove costumes from orders that have IDs that differ from them", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps);
        await createCostume(pool, bonnet);
        
        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        await addCostumeToOrder(pool, 1, 1);
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

        expect(matchesDatabase(entryTwo, updatedEntries[0])).toBe(true);
    })

    it("should throw error if costume id does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCostume(pool, ballroomGown);

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        try {
            await removeCostumeToOrder(pool, 3, 1)
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
            await removeCostumeToOrder(pool, 1, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("getAllCostumesFromOrderById adapter", () => {
    it("should get all costumes", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps)
        await createCostume(pool, bonnet)
        await createCostume(pool, bonnetWithBees)
        await createCostume(pool, bigBallroomGown)

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        await addCostumeToOrder(pool, 1, 2);
        await addCostumeToOrder(pool, 2, 1);
        await addCostumeToOrder(pool, 3, 3);
        await addCostumeToOrder(pool, 4, 1);
        await addCostumeToOrder(pool, 5, 1);

        const costumes = await getAllCostumesFromOrderById(pool, 1);

        expect(costumes.length).toBe(3);

        expect(matchesDatabase(buttlessChaps, costumes[0])).toBe(true);
        expect(matchesDatabase(bonnetWithBees, costumes[1])).toBe(true);
        expect(matchesDatabase(bigBallroomGown, costumes[2])).toBe(true);
    })

    it("should get all costumes, and then again after updates and deletions of orders", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps)
        await createCostume(pool, bonnet)
        await createCostume(pool, bonnetWithBees)
        await createCostume(pool, bigBallroomGown)

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        await addCostumeToOrder(pool, 1, 2);
        await addCostumeToOrder(pool, 2, 1);
        await addCostumeToOrder(pool, 3, 3);
        await addCostumeToOrder(pool, 4, 1);
        await addCostumeToOrder(pool, 5, 1);

        const costumes = await getAllCostumesFromOrderById(pool, 1);

        expect(costumes.length).toBe(3);
        expect(matchesDatabase(buttlessChaps, costumes[0])).toBe(true);
        expect(matchesDatabase(bonnetWithBees, costumes[1])).toBe(true);
        expect(matchesDatabase(bigBallroomGown, costumes[2])).toBe(true);
        
        await removeCostumeFromOrder(pool, 2, 1)

        const updatedCostumes = await getAllCostumesFromOrderById(pool, 1);

        expect(updatedCostumes.length).toBe(2);
        expect(matchesDatabase(bonnetWithBees, updatedCostumes[0])).toBe(true);
        expect(matchesDatabase(bigBallroomGown, updatedCostumes[1])).toBe(true);

        await updateCostume(pool, 4, buttfulChaps);

        const updatedAgainCostumes = await getAllCostumesFromOrderById(pool, 1);

        expect(updatedAgainCostumes.length).toBe(2);

        expect(matchesDatabase(buttfulChaps, updatedAgainCostumes[1])).toBe(true);
        expect(matchesDatabase(bigBallroomGown, updatedAgainCostumes[0])).toBe(true);
    })

    it("should throw error if order id does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCostume(pool, ballroomGown);

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        try {
            await getAllCostumesFromOrderById(pool, 2)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("getAllOrdersOfCostumeById adapter", () => {
    it("should get all orders", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps)
        await createCostume(pool, bonnet)

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);
        await createCustomer(pool, logo);
        await createCustomer(pool, pogo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);
        await createOrder(pool, orderFour);
        await createOrder(pool, orderFive);

        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 2, 2);
        await addCostumeToOrder(pool, 1, 3);
        await addCostumeToOrder(pool, 2, 4);
        await addCostumeToOrder(pool, 3, 5);

        const orders = await getAllOrdersOfCostumeById(pool, 2);

        expect(orders.length).toBe(2);

        expect(matchesDatabase(orderTwo, orders[0])).toBe(true);
        expect(matchesDatabase(orderFour, orders[1])).toBe(true);
    })

    it("should get all orders, and then again after updates and deletions of orders", async () => {
        await createTables(pool);

        await createCostume(pool, ballroomGown);
        await createCostume(pool, buttlessChaps)
        await createCostume(pool, bonnet)

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);
        await createCustomer(pool, logo);
        await createCustomer(pool, pogo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);
        await createOrder(pool, orderFour);
        await createOrder(pool, orderFive);

        await addCostumeToOrder(pool, 1, 1);
        await addCostumeToOrder(pool, 2, 2);
        await addCostumeToOrder(pool, 1, 3);
        await addCostumeToOrder(pool, 2, 4);
        await addCostumeToOrder(pool, 3, 5);

        const orders = await getAllOrdersOfCostumeById(pool, 2);

        expect(orders.length).toBe(2);
        expect(matchesDatabase(orderTwo, orders[0])).toBe(true);
        expect(matchesDatabase(orderFour, orders[1])).toBe(true);
        
        await removeCostumeFromOrder(pool, 2, 2)

        const updatedOrders = await getAllOrdersOfCostumeById(pool, 2);

        expect(updatedOrders.length).toBe(1);
        expect(matchesDatabase(orderFour, updatedOrders[0])).toBe(true);

        await updateOrder(pool, 4, anotherLogoOrder);

        const updatedAgainOrders = await getAllOrdersOfCostumeById(pool, 2);

        expect(updatedAgainOrders.length).toBe(1);

        expect(matchesDatabase(anotherLogoOrder, updatedAgainOrders[0])).toBe(true);
    })

    it("should throw error if order id does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCostume(pool, ballroomGown);

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);

        try {
            await getAllOrdersOfCostumeById(pool, 2)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})