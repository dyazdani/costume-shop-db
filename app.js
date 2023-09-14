const { getPool } = require('./db');
const http = require('http');

const pool = getPool();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

const server = http.createServer( async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('Server is running');
    res.end();
})

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

