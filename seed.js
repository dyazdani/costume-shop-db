const data = require('./seedData.json');

const {
    pool,
    createTables,
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume,
    deleteCostumeById
} = require(".");

// Two costume entries
const costumeOne = data[0];
const costumeTwo = data[1];


const seedDB = async () => {
    console.log("begin seeding db");
    console.log("creating tables");
    await createTables();
    console.log("successfully created tables");
    console.log("create costumes");
    data.forEach(async (costume) => {
        await createCostume(
            costume.name, 
            costume.category,
            costume.gender,
            costume.size,
            costume.type,
            costume.stock_count,
            costume.price
        );
    })  
    const costumes = await getAllCostumes();
    console.log(costumes);   
    const musketeerHat = await getCostumeById(1);
    console.log("got costume: ", musketeerHat);
    const updatedHat = await updateCostume(
        1,
        costumeOne.name, 
        costumeOne.category,
        costumeOne.gender,
        "S",
        costumeOne.type,
        costumeOne.stock_count,
        costumeOne.price 
    );
    console.log("updated hat to: ", updatedHat);
    await deleteCostumeById(1);
    console.log("successfully deleted");
    const finalCostumes = await getAllCostumes();
    console.log(finalCostumes);
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
