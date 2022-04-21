import express from 'express';
import { __dirname } from '../server.js';
var router = express.Router();

/** Basic Routes */
router.get('/', (req, res) => {
    res.render('/client/build/index', { title: 'Judgment Call' });
});

export default router;