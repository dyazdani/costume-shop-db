const {Client} = require("pg");

const client = new Client("postgres://localhost:5432/costume_shop_db_dev");
client.on("error", (error) => {
    console.error(error.stack())
})

const createTables = async () => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS costumes(
            id SERIAL PRIMARY KEY,
            name VARCHAR(80) NOT NULL,
            category VARCHAR NOT NULL CHECK (
                category='baby' or 
                category='child' or 
                category='adult' or 
                category='pet'
            ),
            gender VARCHAR NOT NULL CHECK (
                category='male' or 
                category='female' or 
                category='unisex'
            ),
            size VARCHAR(10) NOT NULL,
            type VARCHAR(80) NOT NULL,
            stock_count NUMBER NOT NULL,
            price NUMBER NOT NULL 
        );
    `)
}

module.exports = {
    client,
    createTables
}