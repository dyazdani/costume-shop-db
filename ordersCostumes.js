const addCostumeToOrder = async (pool, costumeId, orderId) => {
    const {rows: [costumeOrder]} = await pool.query(`
        INSERT INTO orders_costumes(
            costume_id,
            order_id
        ) VALUES ($1,$2)
        RETURNING *;
    `, [costumeId, orderId]
    )
    return costumeOrder;
}

const removeCostumeFromOrder = async (pool, costumeId, orderId) => {
    await pool.query(`
        DELETE FROM orders_costumes
        WHERE costume_id = $1 AND order_id = $2;
    `, [costumeId, orderId]);
}

// Find what other costumes were in an order that had a specific costume in it, i.e., "people who buy x also buy y". 
const getAllOrdersOfCostumeById = async (pool, costumeId) => {
    const {rows: orders} = await pool.query(`
    SELECT  
        orders.date_placed, 
        orders.status, 
        orders.customer_id 
    FROM orders_costumes 
    JOIN orders 
    ON order_id = orders.id 
    WHERE costume_id=$1;
    `, [costumeId]
    )
    return orders;
}

const getCostumesByOrderId = async (pool, orderId) => {
    const {rows: costumes} = await pool.query(`
    SELECT 
        costumes.name, 
        costumes.category, 
        costumes.gender,
        costumes.size,
        costumes.type,
        costumes.stock_count,
        costumes.price
    FROM orders_costumes 
    JOIN costumes
    ON costume_id = costumes.id 
    WHERE order_id=$1;
    `, [orderId]
    )
    return costumes;
}

module.exports = {
    addCostumeToOrder,
    removeCostumeFromOrder,
    getAllOrdersOfCostumeById,
    getCostumesByOrderId
}