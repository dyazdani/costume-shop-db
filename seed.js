const {
    client,
    createTables,
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume,
    deleteCostumeById
} = require(".");


const seedDB = async () => {
    console.log("begin seeding db");
    console.log("creating tables");
    await createTables();
    console.log("successfully created tables");
    const costumes = await getAllCostumes();
    console.log("costumes:", costumes);
    console.log("create costumes");
    const hat = await createCostume("musketeer hat", "adult", "male", "XL", "hat", 1, 100.00);
    console.log("created ", hat);    
    const costumesAgain = await getAllCostumes();
    console.log(costumesAgain);
    const shirt = await createCostume("T-shirt", "adult", "female", "L", "shirt", 1, 20.00);
    console.log("created ", shirt);
    const newCostumes = await getAllCostumes();
    console.log(newCostumes);   
    const musketeerHat = await getCostumeById(1);
    console.log("got costume: ", musketeerHat);
    const updatedHat = await updateCostume(1, "musketeer hat", "adult", "male", "S", "hat", 1, 100.00);
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

