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

const createCostume = async (
    costumeName, 
    category, 
    gender, 
    size, 
    type, 
    stockCount, 
    price
    ) => {
        const {rows:[costume]} = await client.query(`
            INSERT INTO costumes(
                name,
                category,
                gender,
                size,
                type,
                stock_count,
                price
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;   
        `, [costumeName, category, gender, size, type, stockCount, price]
        )
    return costume;
}

const getAllCostumes = async () => {
    const {rows: costumes} = await client.query(`
        SELECT * FROM costumes;
    `)
    return costumes;
}

const getCostumeById = async (id) => {
    const {rows:[costume]} = await client.query(`
        SELECT  
            name,
            category,
            gender,
            size,
            type,
            stock_count,
            price 
        FROM costumes
        WHERE id = $1;
    `, [id]) 
    return costume;
}

const updateCostume = async (
        id, 
        costumeName, 
        category,
        gender,
        size,
        type,
        stockCount,
        price
) => {
    const {rows: [costume]} = await client.query(`
        UPDATE costumes
        SET 
            name = $1,
            category = $2,
            gender = $3,
            size = $4,
            type = $5,
            stock_count = $6,
            price = $7
        WHERE id = $8
        RETURNING *;
    `, [
        costumeName, 
        category, 
        gender, 
        size, 
        type, 
        stockCount, 
        price, 
        id
    ])
    return costume;
}

module.exports = {
    client,
    createTables,
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume
}