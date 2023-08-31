const {
    createTables, 
    createCustomer, 
    getAllCustomers, 
    getCustomerById, 
    updateCustomer, 
    deleteCustomerById,
    getPool
} = require(".././index");

const { 
    matchesDatabase,
    bilbo,
    drogo,
    bozo,
    bimbo,
    bimboWrongEmail,
    bimboNull,
    bimboLong,
    bilboNewEmail
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
    it("should create customers table", async () => {
        await createTables(pool);

        const customers = await pool.query(`
            SELECT * FROM customers;
        `)

        expect(customers).toBeTruthy();
    })
})

describe("createCustomer adapter", () => {
    it("should create a new row in the table", async () => {
        await createTables(pool);

        const {rows} = await pool.query(`
            SELECT COUNT(*) FROM customers;
        `)
        const rowsBefore = rows[0].count;

        await createCustomer(pool, bilbo);
        const {rows: rowsAfterAddingCustomer} = await pool.query(`
            SELECT COUNT(*) FROM customers;
        `)
        const rowsAfter = rowsAfterAddingCustomer[0].count;

        expect(rowsBefore).toBe('0')
        expect(rowsAfter).toBe('1');
    })

    it("should create a new entry with correct values", async () => {
        await createTables(pool);

        await createCustomer(pool, drogo);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);
        
        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
    })

    it("should create multiple entries when called multiple times", async () => {
        await createTables(pool);

        await createCustomer(pool, bozo);
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bozo Baggins';
        `);

        await createCustomer(pool, drogo);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);

        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);
        expect(matchesDatabase(drogo, bozoFromDatabase)).toBe(false);
        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(bozo, drogoFromDatabase)).toBe(false);

    })

    it("should throw an error if not given enough arguments", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createCustomer(pool, bimbo)
        } catch (e) {
            expect(e.name).toMatch('error');
            expect(e.code).toMatch('23502');
        }
    })

    it("should throw an error if argument is null", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createCustomer(pool, bimboNull)
        } catch (e) {
            console.log(e);
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow CHECK constraint", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createCustomer(pool, bimboWrongEmail)
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })

    it("should throw an error if argument does not follow VARCHAR length constraint", async () => {
        expect.hasAssertions();

        await createTables(pool);

        try {
            await createCustomer(pool, bimboLong)
        } catch (e) {
            expect(e.name).toMatch('error');
        }
    })
})

describe("getAllCustomers adapter", () => {
    it("should get all rows in customers table", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        const {rows: [bilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bilbo Baggins';
        `);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Drogo Baggins';
        `);
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='Bozo Baggins';
        `);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);

        const customers = await getAllCustomers(pool);

        expect(customers).toContainEqual(bilboFromDatabase);
        expect(customers).toContainEqual(drogoFromDatabase);
        expect(customers).toContainEqual(bozoFromDatabase);
    })

    it("should get all customers and then again after customers have been updated or deleted", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        const {rows: [bilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='bilbo';
        `);
        const {rows: [drogoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='drogo';
        `);
        const {rows: [bozoFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE full_name='bozo';
        `);

        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);
        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);

        const customers = await getAllCustomers(pool);

        expect(customers).toContainEqual(bilboFromDatabase);
        expect(customers).toContainEqual(drogoFromDatabase);
        expect(customers).toContainEqual(bozoFromDatabase);

        await deleteCustomerById(pool, 3);

        await updateCustomer(pool, 1, bilboNewEmail);
        const {rows: [updatedBilboFromDatabase]} = await pool.query(`
            SELECT * FROM customers WHERE name='big ballroom gown';
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
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        const bilboFromDatabase = await getCustomerById(pool, 1);
        expect(matchesDatabase(bilbo, bilboFromDatabase)).toBe(true);
    })

    it("should get customers that are middle or last entry in table", async () => {
        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);
        await createCustomer(pool, bozo);

        const bozoFromDatabase = await getCustomerById(pool, 3);
        const drogoFromDatabase = await getCustomerById(pool, 2);

        expect(matchesDatabase(drogo, drogoFromDatabase)).toBe(true);
        expect(matchesDatabase(bozo, bozoFromDatabase)).toBe(true);
    })

    it("should throw an error if given the ID that does not exist", async () => {
        expect.hasAssertions();

        await createTables(pool);

        await createCustomer(pool, bilbo);
        await createCustomer(pool, drogo);

        try {
            await getCustomerById(pool, 3)
        } catch (e) {
            expect(e.name).toMatch('Error');
        }
    })
})

// describe("updateCustomer adapter", () => {
//     it("should update customers one after another", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         await createCustomer(pool, buttlessChaps);
//         const gownFromDatabase = await getCustomerById(pool, 1);
//         const chapsFromDatabase = await getCustomerById(pool, 2);

//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);
//         expect(matchesDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);

//         await updateCustomer(pool, 1, bigBallroomGown)
//         await updateCustomer(pool, 2, bonnet)
//         const updatedGownFromDatabase = await getCustomerById(pool, 1);
//         const bonnetFromDatabase = await getCustomerById(pool, 2);

//         expect(matchesDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);
//         expect(matchesDatabase(bonnet, bonnetFromDatabase)).toBe(true);
//     })

//     it("should be able to update the same customer more than one", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         const gownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);

//         await updateCustomer(pool, 1, bigBallroomGown)
//         const updatedGownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);

//         await updateCustomer(pool, 1, buttlessChaps)
//         const chapsFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
//     })

//     it("should update customer values when one value is changed", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         const gownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);

//         await updateCustomer(pool, 1, bigBallroomGown)
//         const updatedGownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(bigBallroomGown, updatedGownFromDatabase)).toBe(true);
//     })

//     it("should update customer values when all values are changed", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);

//         const gownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);

//         await updateCustomer(pool, 1, buttlessChaps)
//         const chapsFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(buttlessChaps, chapsFromDatabase)).toBe(true);
//     })

//     it("should only update customer it selects by id", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         await createCustomer(pool, buttlessChaps);

//         const gownFromDatabase = await getCustomerById(pool, 1);
//         const chapsFromDatabase = await getCustomerById(pool, 2);
  

//         await updateCustomer(pool, 2, bonnet);
//         const bonnetFromDatabase = await getCustomerById(pool, 2);

//         expect(matchesDatabase(bonnet, bonnetFromDatabase)).toBe(true);
//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);
//     })

//     it("should throw an error if given the ID that does not exist", async () => {
//         expect.hasAssertions();

//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         await createCustomer(pool, buttlessChaps);

//         try {
//             await updateCustomer(pool, 3, bonnet)
//         } catch (e) {
//             expect(e.name).toMatch('Error');
//         }
//     })
// })

// describe("deleteCustomerById adapter", () => {
//     it("should delete row when there is only one row", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         const gownFromDatabase = await getCustomerById(pool, 1);

//         expect(matchesDatabase(ballroomGown, gownFromDatabase)).toBe(true);

//         await deleteCustomerById(pool, 1);
//         const customers = await getAllCustomers(pool);

//         expect(customers).toStrictEqual([])
//         expect(customers).toHaveLength(0);
//     })

//     it("should delete row when there are multiple rows", async () => {
//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         await createCustomer(pool, buttlessChaps);
//         await createCustomer(pool, bonnet);

//         const gownFromDatabase = await getCustomerById(pool, 1);
//         const chapsFromDatabase = await getCustomerById(pool, 2);
//         const bonnetFromDatabase = await getCustomerById(pool, 3);

//         deleteCustomerById(pool, 2);

//         const customers = await getAllCustomers(pool);
  
//         expect(customers).toContainEqual(gownFromDatabase);
//         expect(customers).toContainEqual(bonnetFromDatabase);
//         expect(customers).not.toContainEqual(chapsFromDatabase);
//         expect(customers).toHaveLength(2);
//     })

//     it("should throw an error if given the ID that does not exist", async () => {
//         expect.hasAssertions();

//         await createTables(pool);

//         await createCustomer(pool, ballroomGown);
//         await createCustomer(pool, buttlessChaps);

//         try {
//             await deleteCustomerById(pool, 3)
//         } catch (e) {
//             console.log(e)
//             expect(e.name).toMatch('Error');
//         }
//     })
// })