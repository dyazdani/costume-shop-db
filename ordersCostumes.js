const addCostumeToOrder = async (pool, costumeId, orderId) => {
    // throw error if costume id does not exist
    const {rows:[costume]} = await pool.query(`
        SELECT * FROM costumes
        WHERE id = $1;
    `, [costumeId])
    if (costume === undefined) {
        throw new Error(`Could not retrieve data because id provided for costume (${id}) does not exist in table.`)
    } 

    // throw error if order id does not exist
    const {rows:[order]} = await pool.query(`
        SELECT * FROM orders
        WHERE id = $1;
    `, [orderId])
    if (order === undefined) {
        throw new Error(`Could not retrieve data because id provided for order (${id}) does not exist in table.`)
    } 
    
    // add costume
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
    // throw error if costume id does not exist
    const {rows:[costume]} = await pool.query(`
        SELECT * FROM costumes
        WHERE id = $1;
    `, [costumeId])
    if (costume === undefined) {
        throw new Error(`Could not retrieve data because id provided for costume (${id}) does not exist in table.`)
    } 

    // throw error if order id does not exist
    const {rows:[order]} = await pool.query(`
        SELECT * FROM orders
        WHERE id = $1;
    `, [orderId])
    if (order === undefined) {
        throw new Error(`Could not retrieve data because id provided for order (${id}) does not exist in table.`)
    } 
    
    // remove costume
    await pool.query(`
        DELETE FROM orders_costumes
        WHERE costume_id = $1 AND order_id = $2;
    `, [costumeId, orderId]);
}

const getAllOrdersOfCostumeById = async (pool, costumeId) => {
    // throw error if costume id does not exist
    const {rows:[costume]} = await pool.query(`
        SELECT * FROM costumes
        WHERE id = $1;
    `, [costumeId])
    if (costume === undefined) {
        throw new Error(`Could not retrieve data because id provided for costume (${id}) does not exist in table.`)
    } 

    // get orders    
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

const getAllCostumesFromOrderById = async (pool, orderId) => {
    // throw error if order id does not exist
    const {rows:[order]} = await pool.query(`
        SELECT * FROM orders
        WHERE id = $1;
    `, [orderId])
    if (order === undefined) {
        throw new Error(`Could not retrieve data because id provided for order (${id}) does not exist in table.`)
    } 
    
    // get costumes
    const {rows: costumes} = await pool.query(`
    SELECT 
        order_id, 
        costume_id, 
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
    getAllCostumesFromOrderById
}