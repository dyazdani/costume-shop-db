const {
    getPool,
    createTables,
    createCostume,
    getAllCostumes,
    createCustomer,
    getAllCustomers,
    createOrder,
    getAllOrders
} = require("../index");

const { costumes, customers, orders } = require('./seedData.json');

const pool = getPool();

const seedDB = async () => {
    // *** BEGIN ***
    console.log("begin seeding db");
    console.log("creating tables");
    await createTables(pool);
    console.log("successfully created tables");

    // *** SEED COSTUMES ***
    console.log("creating costumes");
    costumes.forEach(async (costume) => await createCostume(pool, costume));

    const allCostumes = await getAllCostumes(pool);
    console.log(allCostumes);   
    console.log("finished seeding costumes");

    // *** SEED CUSTOMERS ***
    console.log("creating customers");
    customers.forEach(async (customer) => await createCustomer(pool, customer));

    const allCustomers = await getAllCustomers(pool);
    console.log(allCustomers);  
    console.log("finished seeding costumers");

     // *** SEED ORDERS ***
     console.log("creating orders");
     console.log("orders: ", orders);
     orders.forEach(async (order) => await createOrder(pool, order));
 
     const allOrders = await getAllOrders(pool);
     console.log(allOrders);   
     console.log("finished seeding orders");
    
    // *** END ***
    console.log("finished seeding db");
}

pool.connect()
.then(() => {
    console.log("connected");

    return seedDB();
})
.then(() => {
    return pool.end();
})
.then(() => console.log("connection closed"))
.catch((error) => console.error(error));
