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

module.exports = {
    addCostumeToOrder,
    removeCostumeFromOrder
}