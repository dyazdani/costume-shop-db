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

module.exports = {
    createTables,
    getPool,
    ...require('./costumes')
}
