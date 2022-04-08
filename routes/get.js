import express from 'express';

const getRouter = express.Router();

getRouter.use((req, res, next) => {
    console.log('called get Routes');
    next();
});

/** Lobby API */
getRouter.post('/createlobby', (req, res) => {
    const payload = req.body;

    res.send("Room code received: " + payload.room_code);
});

export default getRouter;