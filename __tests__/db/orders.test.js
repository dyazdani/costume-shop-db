const {
    createTables, 
    createOrder, 
    getAllOrders, 
    getOrderById,
    getOrdersByCustomerId, 
    updateOrder, 
    deleteOrderById,
    createCustomer,
    getPool
} = require("../../db/index");

const { 
    getOrderOne,
    getOrderTwo,
    getOrderThree,
    getAnotherBilboOrder,
    getYetAnotherBilboOrder,
    getAnotherDrogoOrder,
    getOrderOneCompleted,
    getBilbo,
    getDrogo,
    getBozo,
} = require("../../db/utils/index");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

beforeEach(async () => {
    await createTables(pool)

    await createCustomer(pool, getBilbo());
    await createCustomer(pool, getDrogo());
    await createCustomer(pool, getBozo());

    await createOrder(pool, getOrderOne())
    await createOrder(pool, getOrderTwo())
    await createOrder(pool, getOrderThree())
})

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe.skip("createTables adapter", () => {
    it("should create orders table", async () => {
        const orders = await pool.query(`
            SELECT * FROM orders;
        `)

        expect(orders).toBeTruthy();
    })
})

describe.skip("createOrder adapter", () => {
     it("should create a new entry with correct values", async () => {
        const {rows: [order]} = await pool.query(`
            SELECT * FROM orders;
        `);
        
        expect(order.date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
    })

    it("should create multiple entries when called multiple times", async () => {
        const orders = await getAllOrders(pool);

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');

    })
})

describe.skip("getAllOrders adapter", () => {
    it("should get all rows in orders table", async () => {
        const orders = await getAllOrders(pool);

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[2].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');
    })
    it("should get all orders and then again after orders have been updated or deleted", async () => {
        const orders = await getAllOrders(pool);

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[2].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');

        await deleteOrderById(pool, 2);
        await updateOrder(pool, 1, getAnotherBilboOrder());

        const updatedOrders = await getAllOrders(pool);

        // Checking if updatedOrders have orderThree and updated orderOne
        expect(updatedOrders).toHaveLength(2);
        expect(updatedOrders[1].date_placed.toISOString()).toBe('2021-04-01T00:00:00.000Z');
        expect(updatedOrders[0].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');
    })
})

describe.skip("getOrderById adapter", () => {
    it("should get order that is first entry in table", async () => {
        const orderOne = await getOrderById(pool, 1);
        expect(orderOne.date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
    })

    it("should get orders that are middle or last entry in table", async () => {
        const orderTwo = await getOrderById(pool, 2);
        const orderThree = await getOrderById(pool, 3);

        expect(orderTwo.date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orderThree.date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await getOrderById(pool, 4)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("getOrdersByCustomerId adapter", () => {
    it("should get all orders owned by given customer", async () => {
        await createOrder(pool, getAnotherBilboOrder());
        await createOrder(pool, getYetAnotherBilboOrder());

        const [bilboOne, bilboTwo, bilboThree] = await getOrdersByCustomerId(pool, 1);
        
        expect(bilboOne.date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(bilboTwo.date_placed.toISOString()).toBe('2021-04-01T00:00:00.000Z');
        expect(bilboThree.date_placed.toISOString()).toBe('2022-06-01T00:00:00.000Z');
    })

    it("should throw an error if given an customer ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await getOrdersByCustomerId(pool, 4)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("updateOrder adapter", () => {
    it("should update orders one after another", async () => {
        const orders = await getAllOrders(pool)

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');

        await updateOrder(pool, 1, getAnotherBilboOrder());
        await updateOrder(pool, 2, getAnotherDrogoOrder());

        const updatedBilboOrder = await getOrderById(pool, 1)
        const updatedDrogoOrder = await getOrderById(pool, 2)

        expect(updatedBilboOrder.date_placed.toISOString()).toBe('2021-04-01T00:00:00.000Z');
        expect(updatedDrogoOrder.date_placed.toISOString()).toBe('2000-05-01T00:00:00.000Z');
    })

    it("should be able to update the same order more than one", async () => {
        const orders = await getAllOrders(pool)

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        
        await updateOrder(pool, 1, getAnotherBilboOrder())
        const updatedBilboOrder = await getOrderById(pool, 1);
        expect(updatedBilboOrder.date_placed.toISOString()).toBe('2021-04-01T00:00:00.000Z');
    
        await updateOrder(pool, 1, getYetAnotherBilboOrder());
        const updatedAgainBilboOrder = await getOrderById(pool, 1);
        expect(updatedAgainBilboOrder.date_placed.toISOString()).toBe('2022-06-01T00:00:00.000Z');
    })

    it("should update order values when only one value is changed", async () => {
        const orders = await getAllOrders(pool)

        expect(orders[0].status).toBe('pending');
        
        await updateOrder(pool, 1, getOrderOneCompleted())
        const updatedBilboOrder = await getOrderById(pool, 1)

        expect(updatedBilboOrder.status).toBe('completed');
    })

    it("should only update order it selects by id", async () => {
        const orders = await getAllOrders(pool)

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[2].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');

        await updateOrder(pool, 2, getAnotherDrogoOrder());

        const bilboOrder = await getOrderById(pool, 1);
        const drogoOrder = await getOrderById(pool, 2);
        const bozoOrder = await getOrderById(pool, 3);

        expect(bilboOrder.date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(drogoOrder.date_placed.toISOString()).toBe('2000-05-01T00:00:00.000Z');
        expect(bozoOrder.date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');

    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await updateOrder(pool, 4, getAnotherBilboOrder())
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe.skip("deleteOrderById adapter", () => {
    it("should delete multiple rows", async () => {
        const orders = await getAllOrders(pool)
        expect(orders).toHaveLength(3);

        await deleteOrderById(pool, 3);
        await deleteOrderById(pool, 2);
        await deleteOrderById(pool, 1);
        
        const updatedOrders = await getAllOrders(pool);

        expect(updatedOrders).toStrictEqual([])
        expect(updatedOrders).toHaveLength(0);
    })

    it("should delete one row when there are multiple rows", async () => {
        const orders = await getAllOrders(pool);

        expect(orders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(orders[1].date_placed.toISOString()).toBe('2020-09-11T00:00:00.000Z');
        expect(orders[2].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');

        await deleteOrderById(pool, 2);

        const updatedOrders = await getAllOrders(pool);
  
        expect(updatedOrders).toHaveLength(2);
        expect(updatedOrders[0].date_placed.toISOString()).toBe('2005-05-01T00:00:00.000Z');
        expect(updatedOrders[1].date_placed.toISOString()).toBe('2023-09-01T00:00:00.000Z');
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await deleteOrderById(pool, 4)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})