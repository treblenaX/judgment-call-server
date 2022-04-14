import { PlayerHandler } from "./PlayerHandler.js";

const lobbies = [];

export class LobbyHandler {
    static createLobbyCode() {
        let validLobby = false;
        let lobbyCode = '';

        while (!validLobby) {
            lobbyCode = generateLobbyCode();

            if (!this.findLobby(lobbyCode)) {    // Lobby does not exist
                validLobby = true;
            }
        }

        return lobbyCode;
    }

    static createLobby(code) {
        if (!code || code == undefined) return false;

        const lobby = {
            lobbyCode: code,
            gameMaster: {},
            playerIds: []
        }

        lobbies.push(code);

        return true;
    }

    static isLobbyValid(code) {
        const lobby = this.findLobby(code);
        return (!lobby) ? false : true;
    }

    static deleteLobby(code) {
        const index = lobbies.indexOf(code);
        if (index < 0) return false;    // Lobby delete unsuccessful - lobby doesn't exist.
        lobbies.splice(index, 1);
        return true;    // Lobby delete successful
    }

    /**
     * Game Functions
     */

    static addPlayerToLobby(code, playerId) {
        // Find the lobby to add player to
        const lobby = this.findLobby(code);

        // Add the playerId to array
        lobby.playerIds.push(playerId);

        // Return success
        return true;
    }

    static isLobbyReady(code) {
        if (this.isLobbyValid(code)) {  // If the lobby is valid
            const players = PlayerHandler.getPlayers(code);

            // If someone in lobby is not ready
            return players.filter((player) => !player.readyState);
        }
    }

    /** Private helper functions */
    static findLobby = (code) => lobbies.find(lobby => lobby.lobbyCode === code);
}



/**
 * HELPER
 * @returns 6-digits room code
 */
 function generateLobbyCode() {
    let code = '';
  
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 9);
    }
  
    return code;
}