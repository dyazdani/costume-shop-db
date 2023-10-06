// @ts-nocheck

const createCustomer = async (pool, fullName, email, password) => {
    const {rows:[customer]} = await pool.query(`
        INSERT INTO customers (
            full_name,
            email,
            password
        ) 
        VALUES ($1, $2, $3)
        RETURNING *;   
    `, [fullName, email, password]);
    return customer;
}

const getAllCustomers = async (pool) => {
    const {rows: customers} = await pool.query(`
        SELECT * FROM customers;
    `)
    return customers;
}

const getCustomerByOrderId = async (pool, orderId) => {
    const {rows:[customer]} = await pool.query(`
        SELECT * FROM customers
        JOIN orders ON customer_id = customers.id
        WHERE orders.id = $1;
    `, [orderId])
    
    if (!customer) {
        throw new Error(`Could not retrieve data because id provided (${id}) does not exist in table.`)
    } 

    return customer;
}

const getCustomerById = async (pool, id) => {
    const {rows:[customer]} = await pool.query(`
        SELECT * FROM customers
        WHERE id = $1;
    `, [id])
    if (!customer) {
        throw new Error(`Could not retrieve data because id provided (${id}) does not exist in table.`)
    } 
    return customer;
}

const updateCustomer = async (pool, id, { fullName, email, password }) => {
    const {rows: [customer]} = await pool.query(`
        UPDATE customers
        SET 
            full_name = $1,
            email = $2,
            password = $3
        WHERE id = $4
        RETURNING *;
    `, [fullName, email, password, id])
    if (!customer) {
        throw new Error(`Could not update row because id provided (${id}) does not exist in table.`)
    } 
    return customer;
}

const deleteCustomerById = async (pool, id) => {
    const {rows: [customer]} =await pool.query(`
        DELETE FROM customers
        WHERE id = $1
        RETURNING *;
    `, [id])

    if (!customer) {
        throw new Error(`Could not delete row because id provided (${id}) does not exist in table.`)
    } 

    return customer;
}

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerById,
    getCustomerByOrderId,
    updateCustomer,
    deleteCustomerById
}