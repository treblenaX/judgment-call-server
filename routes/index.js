import express from 'express';
import path from 'path';
import { __dirname } from '../server.js';
var router = express.Router();

/** Basic Routes */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client', 'build', 'index.html'));
});

export default router;