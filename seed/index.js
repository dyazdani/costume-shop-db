const data = require('./seedData.json');

const {
    getPool,
    createTables,
    createCostume,
    getAllCostumes
} = require("../index");

// Two costume entries
const costumeOne = data[0];
const costumeTwo = data[1];

const pool = getPool();

const seedDB = async () => {
    console.log("begin seeding db");
    console.log("creating tables");
    await createTables(pool);
    console.log("successfully created tables");
    console.log("create costumes");
    data.forEach(async (costume) => await createCostume(pool, costume));

    const costumes = await getAllCostumes(pool);
    console.log(costumes);   
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
