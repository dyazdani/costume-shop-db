const createCostume = async (
    pool,
    {
        name, 
        category, 
        gender, 
        size, 
        type, 
        stockCount, 
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
    `, [name, category, gender, size, type, stockCount, price]);
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
        SELECT *
        FROM costumes
        WHERE id = $1;
    `, [id])
    if (!costume) {
        throw new Error(`Could not retrieve data because id provided (${id}) does not exist in table.`)
    } 
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
        stockCount,
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
        stockCount, 
        price, 
        id
    ])
    if (!costume) {
        throw new Error(`Could not update row because id provided (${id}) does not exist in table.`)
    } 
    return costume;
}

const deleteCostumeById = async (pool, id) => {
    const {rows: [costume]} = await pool.query(`
        DELETE FROM costumes
        WHERE id = $1
        RETURNING *;
    `, [id])

    if (!costume) {
        throw new Error(`Could not delete row because id provided (${id}) does not exist in table.`)
    } 
    
    return costume;
}

module.exports = {
    createCostume,
    getAllCostumes,
    getCostumeById,
    updateCostume,
    deleteCostumeById
}