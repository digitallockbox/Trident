// server.ts
import http from 'http';
import router from './engines';
import { loggingMiddleware, corsMiddleware } from './router';


// Apply middleware globally
router.use(loggingMiddleware);
router.use(corsMiddleware);

const server = http.createServer((req, res) => {
    router.handle(req, res, (err?: any) => {
        if (err) {
            res.statusCode = 500;
            res.end('Internal error');
            return;
        }
        res.statusCode = 404;
        res.end('Not found');
    });
});

server.listen(3000, () => {
    console.log('Minimal sovereign router listening on port 3000');
});
