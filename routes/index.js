import express from 'express';
var router = express.Router();

/** Basic Routes */
router.get('/', (req, res) => {
    res.send('Hello World');
});

export default router;