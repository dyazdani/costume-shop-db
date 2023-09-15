const {server} = require('./app.js');
const { getPool } = require('./db');

const pool = getPool();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

server.listen(PORT, HOST, () => {
    console.log(`Server is listening on http://${HOST}:${PORT}`);
    pool.connect()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((error) => {
        console.error(error);
    })
})

server.on("close", () => {
    console.log("Closing connection to DB");
    pool.end() // TODO: return pool.end()? 
    .then(() => {
        console.log("Successfully closed connection to DB");
    }) 
})