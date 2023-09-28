// @ts-nocheck

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

const dropTables = async (pool) => {
    await pool.query(`
        DROP TABLE IF EXISTS orders_costumes;
        DROP TABLE IF EXISTS orders;  
        DROP TABLE IF EXISTS customers;
        DROP TABLE IF EXISTS costumes; 
    `)
}

const createTables = async (pool) => {
    await dropTables(pool);
    await pool.query(` 
    CREATE TABLE customers(
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(80) NOT NULL CHECK(email LIKE '%_@__%._%'),
        password VARCHAR(80) NOT NULL 
    );
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
            stock_count INT NOT NULL,
            price FLOAT NOT NULL 
        );
        CREATE TABLE orders(
            id SERIAL PRIMARY KEY,
            date_placed TIMESTAMP WITH TIME ZONE NULL,
            status VARCHAR(255) NOT NULL CHECK(status IN(
                'pending', 
                'awaiting fulfillment', 
                'awaiting shipment', 
                'shipped',
                'completed',
                'cancelled',
                'refunded'
            )),
            customer_id INT NOT NULL REFERENCES customers(id)
        );
        CREATE TABLE orders_costumes(
            id SERIAL PRIMARY KEY,
            order_id INT NOT NULL REFERENCES orders(id),
            costume_id INT NOT NULL REFERENCES costumes(id)
        );
    `)
}

module.exports = {
    createTables,
    dropTables,
    getPool,
    ...require('./costumes'),
    ...require('./customers'),
    ...require('./orders'),
    ...require('./ordersCostumes')
}
