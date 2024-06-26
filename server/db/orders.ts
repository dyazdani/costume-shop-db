// @ts-nocheck

const createOrder = async (pool, { datePlaced, status, customerId }) => {
    const {rows:[order]} = await pool.query(`
        INSERT INTO orders(
            date_placed,
            status,
            customer_id
        ) VALUES ($1, $2, $3)
        RETURNING *;   
    `, [datePlaced, status, customerId]);
    return order;
}

const getAllOrders = async (pool) => {
    const {rows: orders} = await pool.query(`
        SELECT * FROM orders;
    `)
    return orders;
}

const getOrderById = async (pool, id) => {
    const {rows:[order]} = await pool.query(`
        SELECT * FROM orders
        WHERE id = $1;
    `, [id])
    if (!order) {
        throw new Error(`Could not retrieve data because id provided (${id}) does not exist in table.`)
    } 
    return order;
}

const getOrdersByCustomerId = async (pool, customerId) => {
    const {rows: orders} = await pool.query(`
        SELECT * FROM orders
        JOIN customers ON customer_id = customers.id
        WHERE customers.id = $1;
    `, [customerId])

    if (orders.length === 0) {
        throw new Error(`Could not retrieve data because id provided (${id}) does not exist in table.`)
    } 

    return orders;
} 

const updateOrder = async (pool, id, { datePlaced, status, customerId }) => {
    const {rows: [order]} = await pool.query(`
        UPDATE orders
        SET 
            date_placed = $1,
            status = $2,
            customer_id = $3
        WHERE id = $4
        RETURNING *;
    `, [datePlaced, status, customerId, id])
    if (!order) {
        throw new Error(`Could not update row because id provided (${id}) does not exist in table.`)
    } 
    return order;
}

const deleteOrderById = async (pool, id) => {
    const {rows: [order]} = await pool.query(`
        DELETE FROM orders
        WHERE id = $1
        RETURNING *;
    `, [id])

    if (!order) {
        throw new Error(`Could not delete row because id provided (${id}) does not exist in table.`)
    } 
    
    return order;
}

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrdersByCustomerId,
    updateOrder,
    deleteOrderById
}