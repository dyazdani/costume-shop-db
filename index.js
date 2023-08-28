// TODO: Does this file run even when I just do testing?
const {Pool} = require("pg");

const getPool = () => {
    let pool;
    if (process.env.NODE_ENV === 'test') {
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
    return pool;
}


const createTables = async (pool) => {
    await pool.query(`
        DROP TABLE IF EXISTS costumes;    
    `)
    await pool.query(` 
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
}

const createCostume = async (
    pool,
    {
        name, 
        category, 
        gender, 
        size, 
        type, 
        stock_count, 
        price
    }) => {
    const {rows:[costume]} = await pool.query(`
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
    `, [name, category, gender, size, type, stock_count, price]
    )
    return costume;
}

const getAllCostumes = async (pool) => {
    const {rows: costumes} = await pool.query(`
        SELECT * FROM costumes;
    `)
    return costumes;
}

const getCostumeById = async (pool, id) => {
    const {rows:[costume]} = await pool.query(`
        SELECT
            id,  
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
    pool,
    id,
    {
        name, 
        category,
        gender,
        size,
        type,
        stock_count,
        price
    }) => {
    const {rows: [costume]} = await pool.query(`
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
        name, 
        category, 
        gender, 
        size, 
        type, 
        stock_count, 
        price, 
        id
    ])
    return costume;
}

const deleteCostumeById = async (pool, id) => {
    const {rows: [costume]} = await pool.query(`
        DELETE FROM costumes
        WHERE id = $1;
    `, [id])
    return costume;
}

module.exports = {
    createTables,
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume,
    deleteCostumeById,
    getPool
}
