import express from 'express';
import Logger from 'js-logger';
import { LobbyHandler } from '../handlers/LobbyHandler.js';
import { PlayerHandler } from '../handlers/PlayerHandler.js';
var router = express.Router();

/** Basic Routes */
router.get('/deal', (req, res) => {
    // const PREFIX = '[DEAL TEST] ';
    // // Create the lobby 
    // const lobbyCode = LobbyHandler.createLobby();

    // Logger.info(PREFIX + lobbyCode);
    // Logger.info(PREFIX + JSON.stringify(LobbyHandler.getLobbies()));

    // // Add players
    // for (let i = 0; i < 6; i++) {
    //     const player = PlayerHandler.createPlayer(`${i}`, lobbyCode);
    //     LobbyHandler.addPlayerToLobby(player, lobbyCode);
    // }

    // // Double check players are in the lobby
    // const lobby = LobbyHandler.findLobby(lobbyCode);
    // Logger.info(PREFIX + JSON.stringify(lobby));

    // // 

    // res.send('success');
});

export default router;