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
} = require("../../db/index");

const { 
    getBilbo,
    getDrogo,
    getBozo,
    getHimbo,
    getBilboNewEmail,
    getOrderOne,
    getOrderTwo
} = require("../../db/utils/index");

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

describe.skip("createTables adapter", () => {
    it("should create customers table", async () => {
        const customers = await pool.query(`
            SELECT * FROM customers;
        `)

        expect(customers).toBeTruthy();
    })
})

describe.skip("createCustomer adapter", () => {
    it("should create multiple entries when called multiple times", async () => {
        const bilbo = await getCustomerById(pool, 1);
        const drogo = await getCustomerById(pool, 2);
        const bozo = await getCustomerById(pool, 3);

        expect(bilbo.full_name).toBe('Bilbo Baggins');    
        expect(drogo.full_name).toBe('Drogo Baggins');    
        expect(bozo.full_name).toBe('Bozo Baggins');    
    })
})

describe.skip("getAllCustomers adapter", () => {
    it("should get all rows in customers table", async () => {
        const customers = await getAllCustomers(pool)

        expect(customers[0].full_name).toBe('Bilbo Baggins');
        expect(customers[1].full_name).toBe('Drogo Baggins');
        expect(customers[2].full_name).toBe('Bozo Baggins');
    })

    it("should get all customers and then again after customers have been updated or deleted", async () => {
        const customers = await getAllCustomers(pool)

        expect(customers[0].full_name).toBe('Bilbo Baggins');
        expect(customers[1].full_name).toBe('Drogo Baggins');
        expect(customers[2].full_name).toBe('Bozo Baggins');

        await deleteCustomerById(pool, 3);
        await updateCustomer(pool, 1, getBilboNewEmail());
        
        const updatedCustomers = await getAllCustomers(pool);
        const newBilbo = await getCustomerById(pool, 1);
        const drogo = await getCustomerById(pool, 2);

        expect(updatedCustomers).toHaveLength(2);
        expect(newBilbo.email).toBe('guest@rivendell.me');
        expect(drogo.full_name).toBe('Drogo Baggins');
    })
})

describe.skip("getCustomerById adapter", () => {
    it("should get customer that is first entry in table", async () => {
        const bilbo = await getCustomerById(pool, 1);
        expect(bilbo.full_name).toBe('Bilbo Baggins');
    })

    it("should get customers that are middle or last entry in table", async () => {
        const drogo = await getCustomerById(pool, 2);
        const bozo = await getCustomerById(pool, 3);

        expect(drogo.full_name).toBe('Drogo Baggins');
        expect(bozo.full_name).toBe('Bozo Baggins');
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

describe.skip("getCustomerByOrderId adapter", () => {
    it("should get customer indicated in order", async () => {
        await createOrder(pool, getOrderTwo());
        await createOrder(pool, getOrderOne());

        const customerFromOrderTwo = await getCustomerByOrderId(pool, 1);
        expect(customerFromOrderTwo.full_name).toBe('Drogo Baggins');
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

describe.skip("updateCustomer adapter", () => {
    it("should update customers one after another", async () => {
        await updateCustomer(pool, 1, getBilboNewEmail())
        await updateCustomer(pool, 2, getHimbo())
        const updatedBilbo = await getCustomerById(pool, 1);
        const updatedDrogo = await getCustomerById(pool, 2);

        expect(updatedBilbo.email).toBe('guest@rivendell.me');
        expect(updatedDrogo.full_name).toBe('Himbo Baggins');
    })

    it("should be able to update the same customer more than one", async () => {
        await updateCustomer(pool, 1, getBilboNewEmail())
        const updatedBilbo = await getCustomerById(pool, 1);

        expect(updatedBilbo.email).toBe('guest@rivendell.me');

        await updateCustomer(pool, 1, getHimbo())
        const updatedAgainBilbo = await getCustomerById(pool, 1);

        expect(updatedAgainBilbo.full_name).toBe('Himbo Baggins');
    })  

    it("should only update customer it selects by id", async () => {
        await updateCustomer(pool, 2, getHimbo());
        const bilbo = await getCustomerById(pool, 1);  
        const himbo = await getCustomerById(pool, 2);
        const bozo = await getCustomerById(pool, 3);  

        expect(bilbo.full_name).toBe('Bilbo Baggins');
        expect(himbo.full_name).toBe('Himbo Baggins');
        expect(bozo.full_name).toBe('Bozo Baggins');
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

describe.skip("deleteCustomerById adapter", () => {
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

    it("should delete one row when there are multiple rows", async () => {
        await deleteCustomerById(pool, 2);

        const customers = await getAllCustomers(pool);

  
        expect(customers).toHaveLength(2);
        expect(customers[0].full_name).toBe('Bilbo Baggins');
        expect(customers[1].full_name).toBe('Bozo Baggins'); 
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