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
    getOrderOne,
    getOrderTwo,
    getOrderThree,
    getOrderWithMissingArgs,
    getOrderWithNull,
    getOrderWithInvalidStatus,
    getAnotherBilboOrder,
    getYetAnotherBilboOrder,
    getAnotherDrogoOrder,
    getOrderOneCompleted,
    getBilbo,
    getDrogo,
    getBozo,
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

        await createCustomer(pool, getBilbo());
        await createOrder(pool, getOrderOne());
        const {rows: rowsAfterAddingOrder} = await pool.query(`
            SELECT COUNT(*) FROM orders;
        `)
        const rowsAfter = rowsAfterAddingOrder[0].count;

        expect(rowsBefore).toBe('0')
        expect(rowsAfter).toBe('1');
    })

    it("should create a new entry with correct values", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());

        await createOrder(pool, getOrderOne());
        const {rows: [orderFromDatabase]} = await pool.query(`
            SELECT * FROM orders;
        `);
        
        expect(matchesDatabase(getOrderOne(), orderFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        const {rows: [orderFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=1;
        `);

        await createOrder(pool, getOrderTwo());
        const {rows: [otherOrderFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=2;
        `);

        expect(matchesDatabase(getOrderOne(), orderFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderTwo(), orderFromDatabase)).toBe(false);
        expect(matchesDatabase(getOrderTwo(), otherOrderFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderOne(), otherOrderFromDatabase)).toBe(false);

    })

    it("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, getOrderWithMissingArgs())
        } catch (e) {
            expect(e.name).toMatch('error');
            expect(e.code).toMatch('23502');
        }
    })

    it("should throw an error if argument is null", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, getOrderWithNull())
        } catch (e) {
            console.log(e);
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow CHECK constraint", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createOrder(pool, getOrderWithInvalidStatus())
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })
})

describe("getAllOrders adapter", () => {
    it("should get all rows in orders table", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderThree());

        const {rows: [orderOneFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=1;
        `);
        const {rows: [orderTwoFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=2;
        `);
        const {rows: [orderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=3;
        `);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderTwo(), orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderThree(), orderThreeFromDatabase)).toBe(true);

        const orders = await getAllOrders(pool);

        expect(orders).toContainEqual(orderOneFromDatabase);
        expect(orders).toContainEqual(orderTwoFromDatabase);
        expect(orders).toContainEqual(orderThreeFromDatabase);
    })

    it("should get all orders and then again after orders have been updated or deleted", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderThree());

        const {rows: [orderOneFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=1;
        `);
        const {rows: [orderTwoFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=2;
        `);
        const {rows: [orderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE customer_id=3;
        `);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderTwo(), orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderThree(), orderThreeFromDatabase)).toBe(true);

        const orders = await getAllOrders(pool);

        expect(orders).toContainEqual(orderOneFromDatabase);
        expect(orders).toContainEqual(orderTwoFromDatabase);
        expect(orders).toContainEqual(orderThreeFromDatabase);

        await deleteOrderById(pool, 2);

        await updateOrder(pool, 3, getOrderThree());
        const {rows: [updatedOrderThreeFromDatabase]} = await pool.query(`
            SELECT * FROM orders WHERE id=3;
        `);

        const updatedOrders = await getAllOrders(pool);

        expect(updatedOrders).not.toContainEqual(getOrderThree());
        expect(updatedOrders).toContainEqual(updatedOrderThreeFromDatabase);
        expect(updatedOrders).toContainEqual(orderOneFromDatabase);
        expect(updatedOrders).not.toContainEqual(orderTwoFromDatabase);
    })
})

describe("getOrderById adapter", () => {
    it("should get order that is first entry in table", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderThree());

        const orderOneFromDatabase = await getOrderById(pool, 1);
        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
    })

    it("should get orders that are middle or last entry in table", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderThree());

        const orderThreeFromDatabase = await getOrderById(pool, 3);
        const orderTwoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(getOrderTwo(), orderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderThree(), orderThreeFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());

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

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getAnotherBilboOrder());
        await createOrder(pool, getYetAnotherBilboOrder());

        const [bilboOne, bilboTwo, bilboThree] = await getCustomerOrders(pool, 1);
        
        expect(matchesDatabase(getOrderOne(), bilboOne)).toBe(true);
        expect(matchesDatabase(getAnotherBilboOrder(), bilboTwo)).toBe(true);
        expect(matchesDatabase(getYetAnotherBilboOrder(), bilboThree)).toBe(true);
    })

    it("should throw an error if given an customer ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, getBilbo());

        await createOrder(pool, getOrderOne());

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

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());

        const orderOneFromDatabase = await getOrderById(pool, 1);
        const orderTwoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderTwo(), orderTwoFromDatabase)).toBe(true);

        const updatedOrderOneFromDatabase = await updateOrder(pool, 1, getAnotherBilboOrder())
        const updatedOrderTwoFromDatabase = await updateOrder(pool, 2, getAnotherDrogoOrder());

        expect(matchesDatabase(getAnotherBilboOrder(), updatedOrderOneFromDatabase)).toBe(true);
        expect(matchesDatabase(getAnotherDrogoOrder(), updatedOrderTwoFromDatabase)).toBe(true);
    })

    it("should be able to update the same order more than one", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());

        await createOrder(pool, getOrderOne());

        const orderOneFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);

        await updateOrder(pool, 1, getAnotherBilboOrder())
        const updatedOrderOneFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getAnotherBilboOrder(), updatedOrderOneFromDatabase)).toBe(true);
    
        await updateOrder(pool, 1, getYetAnotherBilboOrder());
        const yetAnotherUpdatedOrderFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getYetAnotherBilboOrder, yetAnotherUpdatedOrderFromDatabase)).toBe(true);
    })

    it("should update order values when only one value is changed", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());

        await createOrder(pool, getOrderOne());
        const orderOneFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
        
        await updateOrder(pool, 1, getOrderOneCompleted())
        const updatedOrderOneFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getOrderOneCompleted(), updatedOrderOneFromDatabase)).toBe(true);
    })

    it("should only update order it selects by id", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        const orderOneFromDatabase = await createOrder(pool, getOrderOne());
        const orderTwoFromDatabase = await createOrder(pool, getOrderTwo());
  
        await updateOrder(pool, 2, getAnotherDrogoOrder());
        const anotherOrderTwoFromDatabase = await getOrderById(pool, 2);

        expect(matchesDatabase(getAnotherDrogoOrder(), anotherOrderTwoFromDatabase)).toBe(true);
        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());

        try {
            await updateOrder(pool, 3, getAnotherBilboOrder())
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("deleteOrderById adapter", () => {
    it("should delete row when there is only one row", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());

        await createOrder(pool, getOrderOne());
        const orderOneFromDatabase = await getOrderById(pool, 1);

        expect(matchesDatabase(getOrderOne(), orderOneFromDatabase)).toBe(true);

        await deleteOrderById(pool, 1);
        const orders = await getAllOrders(pool);

        expect(orders).toStrictEqual([])
        expect(orders).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());
        await createCustomer(pool, getBozo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderThree());

        const orderOneFromDatabase = await getOrderById(pool, 1);
        const orderTwoFromDatabase = await getOrderById(pool, 2);
        const orderThreeFromDatabase = await getOrderById(pool, 3);

        deleteOrderById(pool, 2);

        const orders = await getAllOrders(pool);
  
        expect(orders).toContainEqual(orderOneFromDatabase);
        expect(orders).toContainEqual(orderThreeFromDatabase);
        expect(orders).not.toContainEqual(orderTwoFromDatabase);
        expect(orders).toHaveLength(2);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, getBilbo());
        await createCustomer(pool, getDrogo());

        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());

        try {
            await deleteOrderById(pool, 3)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})