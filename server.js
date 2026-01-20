const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the /public directory
app.use(express.static('public'));

// The System API: Serves the compiled state
app.get('/api/state', (req, res) => {
    try {
        const data = fs.readFileSync('./sys_data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "State file missing. Run 'make build'." });
    }
});

app.get('/api/sys-health', (req, res) => {
    const stats = fs.statSync('./sys_data.json');
    res.json({
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed,
        last_build: stats.mtime,
        version: "1.0.4-stable"
    });
});

app.listen(PORT, () => {
    console.log(`\x1b[32m[KERNEL]\x1b[0m System online at http://localhost:${PORT}`);
});