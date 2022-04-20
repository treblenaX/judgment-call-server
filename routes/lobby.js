import express from 'express';
import Logger from 'js-logger';
import { GameHandler } from '../handlers/GameHandler.js';
import { LobbyHandler } from '../handlers/LobbyHandler.js';
var router = express.Router();

router.get('/', (req, res, next) => {
    res.send(true);
});

/**
 * Checks through the lobbies to see if the lobby requested is in there.
 */
router.get('/isValid', (req, res, next) => {
    const query = req.query;
    const lobbyCode = query.lobbyCode;

    let response = LobbyHandler.isLobbyValid(lobbyCode);

    if (!response.validLobby) {    // Error guard
        response.error = 'Lobby is not valid.';
    } else {    // Valid response
        response.message = 'The lobby code is valid!';
    }

    Logger.info(response);

    res.type('json');
    res.send(response);
});

/**
 * Creates a new lobby.
 * @param { playerName } request
 */
router.post('/createLobby', async (req, res, next) => {
    let response = {
        lobbyCode: LobbyHandler.createLobby(await GameHandler.createGame())
    };

    if (!response.lobbyCode) {  // Error guard
        response.error = 'There was an error creating the lobby code.';
    } else {    // Valid response
        response.message = 'New lobby has been created!';
    }
    Logger.info(response);

    res.type('json');
    res.send(response);
});

export default router;