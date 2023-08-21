const {Client, Pool} = require("pg");

let pool;

    if (process.env.NODE_ENV === "test") {
        pool = new Pool({
            host: 'localhost',
            port: 5432,
            database: 'costume_shop_db_test'
        });
        pool.on("error", (error) => {
            console.error(error.stack())
        })
    } else {
        pool = new Pool({
            host: 'localhost',
            port: 5432,
            database: 'costume_shop_db_dev'
        });
        pool.on("error", (error) => {
            console.error(error.stack())
        })
    }  


const createTables = async () => {
    const client = await pool.connect();
    await client.query(`
        DROP TABLE IF EXISTS costumes;    
    `)
    await client.query(` 
        CREATE TABLE costumes(
            id SERIAL PRIMARY KEY,
            name VARCHAR(80) NOT NULL,
            category VARCHAR NOT NULL CHECK(category IN(
                'adult', 
                'child', 
                'baby', 
                'pet'
            )), 
            gender VARCHAR NOT NULL CHECK(gender IN(
                'male',
                'female',
                'unisex'
            )),
            size VARCHAR(10) NOT NULL,
            type VARCHAR(80) NOT NULL,
            stock_count INTEGER NOT NULL,
            price FLOAT NOT NULL 
        );
    `)
    // Selecting table created by me, which should just be 'costumes'
    const table = await client.query(`
        SELECT * FROM pg_catalog.pg_tables WHERE tableowner='darayazdani';
    `)
    console.log(table.rows[0])
    client.release();
    // Returning the name of the table I created
    return table.rows[0].tablename;
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
    const client = await pool.connect();
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
    client.release();
    return costume;
}

const getAllCostumes = async () => {
    const client = await pool.connect();
    const {rows: costumes} = await client.query(`
        SELECT * FROM costumes;
    `)
    client.release();
    return costumes;
}

const getCostumeById = async (id) => {
    const client = await pool.connect();
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
    client.release();
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
    const client = await pool.connect();
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
    client.release();
    return costume;
}

const deleteCostumeById = async (id) => {
    const client = await pool.connect();
    const {rows: [costume]} = await client.query(`
        DELETE FROM costumes
        WHERE id = $1;
    `, [id])
    client.release();
    return costume;
}

module.exports = {
    pool,
    createTables,
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume,
    deleteCostumeById
}
