import express from 'express';
import path from 'path';
import { __dirname, DEBUG } from '../server.js';
var router = express.Router();

/** Basic Routes */
router.get('/', (req, res) => {
    if (DEBUG) {
        res.sendFile(path.join(__dirname, 'public', 'client', 'build', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'client', 'build', 'index.html'));
    }
});

export default router;