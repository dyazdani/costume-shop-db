const http = require('http');
const {readFile} = require('fs');
const { getAllCostumes } = require('./db/costumes');
const {getPool} = require('./db/')

const pool = getPool();

const server = http.createServer( async (req, res) => {
    if (req.url === '/') {
        readFile('./index.html', 'utf8', (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        })
    }

    if (req.url.startsWith('/api')) {
    if(req.url === '/api/costumes' && req.method === 'GET') {
        try {
            const costumes = await getAllCostumes(pool);
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify(costumes));
            res.end();
        } catch (e) {
            console.error(e);
            res.writeHead(500, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message: "Failed to get all costumes"}));
            res.end();
        }
    }
   }
})

module.exports = {
    server
}