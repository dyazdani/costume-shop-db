const {Client} = require("pg");

const client = new Client("postgres://localhost:5432/costume_shop_db_dev");
client.on("error", (error) => {
    console.error(error.stack())
})


module.exports = {
    client
}