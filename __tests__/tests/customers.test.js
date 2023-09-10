const {
    createTables, 
    createCustomer, 
    getAllCustomers, 
    getCustomerById,
    getCustomerByOrderId, 
    updateCustomer, 
    deleteCustomerById,
    createOrder,
    getPool
} = require("../../index");

const { 
    matchesDatabase,
    getBilbo,
    getDrogo,
    getBozo,
    getHimbo,
    getHimboWrongEmail,
    getHimboNull,
    getHimboLong,
    getHimboNoName,
    getBilboNewEmail,
    getOrderOne,
    getOrderTwo
} = require("../utilities");

// Create pool for queries
const pool = getPool(); 

// Double-check that correct database is being used. 
if (pool.options.database !== 'costume_shop_db_test') {
    throw new Error("Pool instance was not assigned testing database. Testing aborted. Be sure that NODE_ENV environment variable is set to 'test'.")
}

beforeEach( async () => {
    await createTables(pool);

    await createCustomer(pool, getBilbo());
    await createCustomer(pool, getDrogo());
    await createCustomer(pool, getBozo());
})

// Disconnect from postgres database after all tests done
afterAll(async () => {
    await pool.end()
})

describe("createTables adapter", () => {
    it("should create customers table", async () => {
        const customers = await pool.query(`
            SELECT * FROM customers;
        `)

        expect(customers).toBeTruthy();
    })
})

describe("createCustomer adapter", () => {
    it("should create a new entry with correct values", async () => {
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);
        
        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bozo Baggins';
        `);

        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);

        expect(matchesDatabase(getBozo(), bozoFromDatabase)).toBe(true);
        expect(matchesDatabase(getDrogo(), bozoFromDatabase)).toBe(false);
        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(getBozo(), drogoFromDatabase)).toBe(false);

    })

    it("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();
        try {
            await createCustomer(pool, getHimboNoName())
        } catch (e) {
            expect(e.name).toMatch('error');
            expect(e.code).toMatch('23502');
        }
    })

    it("should throw an error if argument is null", async () => {
        expect.hasAssertions();
        try {
            await createCustomer(pool, getHimboNull())
        } catch (e) {
            console.log(e);
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow CHECK constraint", async () => {
        expect.hasAssertions();
        try {
            await createCustomer(pool, getHimboWrongEmail())
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow VARCHAR length constraint", async () => {
        expect.hasAssertions();
        try {
            await createCustomer(pool, getHimboLong())
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })
})

describe("getAllCustomers adapter", () => {
    it("should get all rows in customers table", async () => {
        const {rows: [bilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bilbo Baggins';
        `);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bozo Baggins';
        `);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(getBozo(), bozoFromDatabase)).toBe(true);

        const customers = await getAllCustomers(pool);

        expect(customers).toContainEqual(bilboFromDatabase);
        expect(customers).toContainEqual(drogoFromDatabase);
        expect(customers).toContainEqual(bozoFromDatabase);
    })

    it("should get all customers and then again after customers have been updated or deleted", async () => {
        const {rows: [bilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bilbo Baggins';
        `);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bozo Baggins';
        `);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(getBozo(), bozoFromDatabase)).toBe(true);

        const customers = await getAllCustomers(pool);

        expect(customers).toContainEqual(bilboFromDatabase);
        expect(customers).toContainEqual(drogoFromDatabase);
        expect(customers).toContainEqual(bozoFromDatabase);

        await deleteCustomerById(pool, 3);

        await updateCustomer(pool, 1, getBilboNewEmail());
        const {rows: [updatedBilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bilbo Baggins';
        `);

        const updatedCustomers = await getAllCustomers(pool);

        expect(updatedCustomers).not.toContainEqual(bilboFromDatabase);
        expect(updatedCustomers).toContainEqual(updatedBilboFromDatabase);
        expect(updatedCustomers).toContainEqual(drogoFromDatabase);
        expect(updatedCustomers).not.toContainEqual(bozoFromDatabase);
    })
})

describe("getCustomerById adapter", () => {
    it("should get customer that is first entry in table", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);
        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);
    })

    it("should get customers that are middle or last entry in table", async () => {
        const bozoFromDatabase = await getCustomerById(pool, 3);
        const drogoFromDatabase = await getCustomerById(pool, 2);

        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(getBozo(), bozoFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await getCustomerById(pool, 4)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("getCustomerByOrderId adapter", () => {
    it("should get customer indicated in order", async () => {
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderOne());

        const customerFromOrderTwo = await getCustomerByOrderId(pool, 1);
        expect(matchesDatabase(getDrogo(), customerFromOrderTwo)).toBe(true);
    })

    it("should throw an error if given an order ID that does not exist", async () => {
        expect.hasAssertions();
        await createOrder(pool, getOrderOne());
        await createOrder(pool, getOrderTwo());

        try {
            await getCustomerByOrderId(pool, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("updateCustomer adapter", () => {
    it("should update customers one after another", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);
        const drogoFromDatabase = await getCustomerById(pool, 2);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(getDrogo(), drogoFromDatabase)).toBe(true);

        await updateCustomer(pool, 1, getBilboNewEmail())
        await updateCustomer(pool, 2, getHimbo())
        const updatedBilboFromDatabase = await getCustomerById(pool, 1);
        const himboFromDatabase = await getCustomerById(pool, 2);

        expect(matchesDatabase(getBilboNewEmail(), updatedBilboFromDatabase)).toBe(true);
        expect(matchesDatabase(getHimbo(), himboFromDatabase)).toBe(true);
    })

    it("should be able to update the same customer more than one", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);

        await updateCustomer(pool, 1, getBilboNewEmail())
        const updatedBilboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getBilboNewEmail(), updatedBilboFromDatabase)).toBe(true);

        await updateCustomer(pool, 1, getHimbo())
        const himboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getHimbo(), himboFromDatabase)).toBe(true);
    })

    it("should update customer values when only one value is changed", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);

        await updateCustomer(pool, 1, getBilboNewEmail())
        const updatedBilboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getBilboNewEmail(), updatedBilboFromDatabase)).toBe(true);
    })

    it("should update customer values when all values are changed", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);

        await updateCustomer(pool, 1, getHimbo())
        const himboFromDatabase = await getCustomerById(pool, 1);

        expect(matchesDatabase(getHimbo(), himboFromDatabase)).toBe(true);
    })

    it("should only update customer it selects by id", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);  

        await updateCustomer(pool, 2, getHimbo());
        const himboFromDatabase = await getCustomerById(pool, 2);

        expect(matchesDatabase(getHimbo(), himboFromDatabase)).toBe(true);
        expect(matchesDatabase(getBilbo(), bilboFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await updateCustomer(pool, 4, getHimbo())
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

describe("deleteCustomerById adapter", () => {
    it("should delete multiple rows", async () => {
        const customers = await getAllCustomers(pool)
        expect(customers).toHaveLength(3);

        await deleteCustomerById(pool, 3);
        await deleteCustomerById(pool, 2);
        await deleteCustomerById(pool, 1);
        
        const updatedCustomers = await getAllCustomers(pool);

        expect(updatedCustomers).toStrictEqual([])
        expect(updatedCustomers).toHaveLength(0);
    })

    it("should delete row when there are multiple rows", async () => {
        const bilboFromDatabase = await getCustomerById(pool, 1);
        const drogoFromDatabase = await getCustomerById(pool, 2);
        const bozoFromDatabase = await getCustomerById(pool, 3);

        deleteCustomerById(pool, 2);

        const customers = await getAllCustomers(pool);
  
        expect(customers).toContainEqual(bilboFromDatabase);
        expect(customers).toContainEqual(bozoFromDatabase);
        expect(customers).not.toContainEqual(drogoFromDatabase);
        expect(customers).toHaveLength(2);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();
        try {
            await deleteCustomerById(pool, 4)
        } catch (e) {
            console.log(e)
            expect(e.name).toMatch('Error');
        }
    })
})