const {
    createTables, 
    createOrder, 
    getAllOrders, 
    getOrderById,
    getCustomerOrders, 
    updateOrder, 
    deleteOrderById,
    createCustomer,
    getPool
} = require(".././index");

const { 
    matchesDatabase,
    orderOne,
    orderTwo,
    orderThree,
    orderThreeCompleted,
    orderWithMissingArgs,
    orderWithNull,
    orderWithInvalidStatus,
    anotherBilboOrder,
    yetAnotherBilboOrder,
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
    it("should create orders table", async () => {
        await createTables(pool);

        const orders = await pool.query(`
            SELECT * FROM orders;
        `)

        expect(orders).toBeTruthy();
    })
})

describe("createOrder adapter", () => {
    it("should create a new row in the table", async () => {
        await createTables(pool);

        const {rows} = await pool.query(`
            SELECT COUNT(*) FROM orders;
        `)
        const rowsBefore = rows[0].count;

        await createCustomer(pool, bilbo);
        await createOrder(pool, orderOne);
        const {rows: rowsAfterAddingOrder} = await pool.query(`
            SELECT COUNT(*) FROM orders;
        `)
        const rowsAfter = rowsAfterAddingOrder[0].count;

        expect(rowsBefore).toBe('0')
        expect(rowsAfter).toBe('1');
    })

    it("should create a new entry with correct values", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);

        await createOrder(pool, orderOne);
        const {rows: [orderFromDatabase]} = await pool.query(`
            SELECT * FROM orders;
        `);
        
        expect(matchesDatabase(orderOne, orderFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);

        await createOrder(pool, orderOne);
        const {rows: [orderFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=1;
        `);

        await createOrder(pool, orderTwo);
        const {rows: [otherOrderFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=2;
        `);

        expect(matchesDatabase(orderOne, orderFromDatabase)).toBe(true);
        expect(matchesDatabase(orderTwo, orderFromDatabase)).toBe(false);
        expect(matchesDatabase(orderTwo, otherOrderFromDatabase)).toBe(true);
        expect(matchesDatabase(orderOne, otherOrderFromDatabase)).toBe(false);

    })

    it("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, orderWithMissingArgs)
        } catch (e) {
            expect(e.name).toMatch('error');
            expect(e.code).toMatch('23502');
        }
    })

    it("should throw an error if argument is null", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, orderWithNull)
        } catch (e) {
            console.log(e);
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow CHECK constraint", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, orderWithInvalidStatus)
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })
})

describe("getAllOrders adapter", () => {
    it("should get all rows in orders table", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const {rows: [orderOneFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=1;
        `);
        const {rows: [orderTwoFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=2;
        `);
        const {rows: [orderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=3;
        `);

        expect(matchesDatabase(orderOne, orderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(orderTwo, orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(orderThree, orderThreeFromDatabase)).toBe(true);

        const orders = await getAllOrders(pool);

        expect(orders).toContainEqual(orderOneFromDatabase);
        expect(orders).toContainEqual(orderTwoFromDatabase);
        expect(orders).toContainEqual(orderThreeFromDatabase);
    })

    it("should get all orders and then again after orders have been updated or deleted", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const {rows: [orderOneFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=1;
        `);
        const {rows: [orderTwoFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=2;
        `);
        const {rows: [orderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=3;
        `);

        expect(matchesDatabase(orderOne, orderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(orderTwo, orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(orderThree, orderThreeFromDatabase)).toBe(true);

        const orders = await getAllOrders(pool);

        expect(orders).toContainEqual(orderOneFromDatabase);
        expect(orders).toContainEqual(orderTwoFromDatabase);
        expect(orders).toContainEqual(orderThreeFromDatabase);

        await deleteOrderById(pool, 2);

        await updateOrder(pool, 3, orderThree);
        const {rows: [updatedOrderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=3;
        `);

        const updatedOrders = await getAllOrders(pool);

        expect(updatedOrders).not.toContainEqual(orderThree);
        expect(updatedOrders).toContainEqual(updatedOrderThreeFromDatabase);
        expect(updatedOrders).toContainEqual(orderOneFromDatabase);
        expect(updatedOrders).not.toContainEqual(orderTwoFromDatabase);
    })
})

describe("getOrderById adapter", () => {
    it("should get order that is first entry in table", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const orderOneFromDatabase = await getOrderById(pool, 1);
        expect(matchesDatabase(orderOne, orderOneFromDatabase)).toBe(true);
    })

    it("should get orders that are middle or last entry in table", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);
        await createOrder(pool, orderThree);

        const orderThreeFromDatabase = await getOrderById(pool, 3);
        const orderTwoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(orderTwo, orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(orderThree, orderThreeFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);

        await createOrder(pool, orderOne);
        await createOrder(pool, orderTwo);

        try {
            await getOrderById(pool, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("getCustomerOrders adapter", () => {
    it("should get all orders owned by given customer", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);

        await createOrder(pool, orderOne);
        await createOrder(pool, anotherBilboOrder);
        await createOrder(pool, yetAnotherBilboOrder);

        const [bilboOne, bilboTwo, bilboThree] = await getCustomerOrders(pool, 1);
        
        expect(matchesDatabase(orderOne, bilboOne)).toBe(true);
        expect(matchesDatabase(anotherBilboOrder, bilboTwo)).toBe(true);
        expect(matchesDatabase(yetAnotherBilboOrder, bilboThree)).toBe(true);
    })

    it("should throw an error if given an customer ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, bilbo);

        await createOrder(pool, orderOne);

        try {
            await getCustomerOrders(pool, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("updateOrder adapter", () => {
    it("should update orders one after another", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        await createOrder(pool, drogo);
        const bilboFromDatabase = await getOrderById(pool, 1);
        const drogoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);

        await updateOrder(pool, 1, bilboNewEmail)
        await updateOrder(pool, 2, bozo)
        const updatedBilboFromDatabase = await getOrderById(pool, 1);
        const bozoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(bilboNewEmail, updatedBilboFromDatabase)).toBe(true);
        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);
    })

    it("should be able to update the same order more than one", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        const bilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);

        await updateOrder(pool, 1, bilboNewEmail)
        const updatedBilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilboNewEmail, updatedBilboFromDatabase)).toBe(true);

        await updateOrder(pool, 1, drogo)
        const drogoFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
    })

    it("should update order values when only one value is changed", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        const bilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);

        await updateOrder(pool, 1, bilboNewEmail)
        const updatedBilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilboNewEmail, updatedBilboFromDatabase)).toBe(true);
    })

    it("should update order values when all values are changed", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);

        const bilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);

        await updateOrder(pool, 1, drogo)
        const drogoFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
    })

    it("should only update order it selects by id", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        await createOrder(pool, drogo);

        const bilboFromDatabase = await getOrderById(pool, 1);
        const drogoFromDatabase = await getOrderById(pool, 2);
  

        await updateOrder(pool, 2, bozo);
        const bozoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);
        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createOrder(pool, bilbo);
        await createOrder(pool, drogo);

        try {
            await updateOrder(pool, 3, bozo)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("deleteOrderById adapter", () => {
    it("should delete row when there is only one row", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        const bilboFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);

        await deleteOrderById(pool, 1);
        const orders = await getAllOrders(pool);

        expect(orders).toStrictEqual([])
        expect(orders).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        await createTables(pool);

        await createOrder(pool, bilbo);
        await createOrder(pool, drogo);
        await createOrder(pool, bozo);

        const bilboFromDatabase = await getOrderById(pool, 1);
        const drogoFromDatabase = await getOrderById(pool, 2);
        const bozoFromDatabase = await getOrderById(pool, 3);

        deleteOrderById(pool, 2);

        const orders = await getAllOrders(pool);
  
        expect(orders).toContainEqual(bilboFromDatabase);
        expect(orders).toContainEqual(bozoFromDatabase);
        expect(orders).not.toContainEqual(drogoFromDatabase);
        expect(orders).toHaveLength(2);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createOrder(pool, bilbo);
        await createOrder(pool, drogo);

        try {
            await deleteOrderById(pool, 3)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})