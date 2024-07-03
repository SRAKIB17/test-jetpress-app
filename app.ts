import { createReadStream, stat, writeFile } from "fs";
import { File, FormWizard, Request, Response, Router, Server } from "jetpress";
import path from "path";
import { loggingPlugin } from "./loggingPlugin";


const server = new Server({
    enableSsl: true,
    cert: ''
});

server.use(FormWizard);
server.use(loggingPlugin);

// Static file serving
server.static('/', './public');
server.static('/static', './uploads', {
    cacheControl: 'public, max-age=31536000', // 1 year
    headers: {
        'Content-Security-Policy': "default-src 'self'",
        // 'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
    }
});

function staticMiddleware(root: string) {
    return function (req: Request, res: Response, next: any) {
        const filePath = path.resolve(root, req.location?.path || "");
        stat(filePath, (err, stats) => {
            if (err) {
                return next(); // File not found, continue to the next middleware
            }
            if (stats.isFile()) {
                const fileStream = createReadStream(filePath);
                fileStream.pipe(res);
            } else {
                next(); // Not a file, continue to the next middleware
            }
        });
    };
}

server.use('/static', staticMiddleware(path.join(__dirname, 'upload')));

// Define routes
server.options('/', (req: Request, res: Response) => {
    res.html('<h1>Welcome to JetPress!</h1>');
});

server.post('/upload', (req: Request, res: Response) => {
    const uploadedFile: File = req.file;
    if (!uploadedFile) {
        return res.status(400).send('No file uploaded.');
    }

    const newPath = path.join(__dirname, 'uploads', uploadedFile.filename);
    writeFile(newPath, uploadedFile.buffer, err => {
        if (err) throw err;
        console.log('File saved successfully:', newPath);
        res.buffer(uploadedFile.buffer);
    });
});

// Example route using router
const router = new Router();
router.get("/example", (req: Request, res: Response) => {
    res.json({ message: "Hello from the router!" });
});
server.get("/test/:params", (req, res) => {
    console.log(req.params)
    res.json({})
})
server.use('/api', router);

// Handle all other routes with a 404
server.use("*", (req: Request, res: Response) => {
    res.html("Not Found");
});

// Start the server
server.listen(3000, () => {
    console.log('JetPress server running at http://localhost:3000');
});