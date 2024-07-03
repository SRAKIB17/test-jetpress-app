import { writeFile } from "fs";
import pkg from 'jetpress';
const { FormWizard, Router, Server } = pkg;
import path from "path";

const server = new Server({
    enableSsl: true,
    cert: ''
});

server.use(FormWizard);

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


// Define routes
server.options('/', (req, res) => {
    res.html('<h1>Welcome to JetPress!</h1>');
});

server.post('/upload', (req, res) => {
    const uploadedFile = req.file;
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
router.get("/example", (req, res) => {
    res.json({ message: "Hello from the router!" });
});
server.get("/test/:params", (req, res) => {
    console.log(req.params)
    res.json({})
})
server.use('/api', router);

// Handle all other routes with a 404
server.use("*", (req, res) => {
    res.html("Not Found");
});

// Start the server
server.listen(3000, () => {
    console.log('JetPress server running at http://localhost:3000');
});