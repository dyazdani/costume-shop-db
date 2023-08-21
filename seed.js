const data = require('./seedData.json');

const {
    client,
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
    const costumes = await getAllCostumes();
    console.log("costumes:", costumes);
    console.log("create costumes");
    const hat = await createCostume(
        costumeOne.name, 
        costumeOne.category,
        costumeOne.gender,
        costumeOne.size,
        costumeOne.type,
        costumeOne.stock_count,
        costumeOne.price
    );
    console.log("created ", hat);    
    const costumesAgain = await getAllCostumes();
    console.log(costumesAgain);
    const shirt = await createCostume(
        costumeTwo.name, 
        costumeTwo.category,
        costumeTwo.gender,
        costumeTwo.size,
        costumeTwo.type,
        costumeTwo.stock_count,
        costumeTwo.price
    );
    console.log("created ", shirt);
    const newCostumes = await getAllCostumes();
    console.log(newCostumes);   
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
client.connect()
.then(() => {
    console.log("connected");

    return seedDB();
})
.then(() => {
    return client.end();
})
.then(() => console.log("connection closed"))
.catch((error) => console.error(error));