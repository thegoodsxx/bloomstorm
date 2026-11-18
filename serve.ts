import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const PORT = 8080;
const PUBLIC_DIR = path.join(__dirname, 'game');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url || '/';
    if (urlPath === '/') urlPath = '/index.html';

    // Remove query params
    const queryIdx = urlPath.indexOf('?');
    if (queryIdx !== -1) {
        urlPath = urlPath.substring(0, queryIdx);
    }

    const safePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
    if (!safePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.readFile(safePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`BLOOMSTORM game server running at http://localhost:${PORT}`);
});
