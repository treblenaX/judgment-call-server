import { PlayerHandler } from "./PlayerHandler.js";

const lobbies = [];

export class LobbyHandler {
    static createLobby(gameMaster) {
        // Create valid lobby code
        let validLobby = false;
        let lobbyCode = '';

        while (!validLobby) {
            lobbyCode = generateLobbyCode();

            if (!this.findLobby(lobbyCode)) {    // Lobby does not exist
                validLobby = true;
            }
        }

        // Create lobby object
        const lobby = {
            lobbyCode: lobbyCode,
            gameMaster: gameMaster,
            players: []
        }

        // Add lobby to list of live lobbies
        lobbies.push(lobby);

        return lobbyCode;
    }

    static isLobbyValid(code) {
        const lobby = this.findLobby(code);
        const payload = {
            validLobby: (!lobby) ? false : true
        }
        
        return payload;
    }

    static deleteLobby(code) {
        const index = lobbies.indexOf(code);
        if (index < 0) return false;    // Lobby delete unsuccessful - lobby doesn't exist.
        lobbies.splice(index, 1);
        return true;    // Lobby delete successful
    }

    static getLobbies() {
        return lobbies;
    }

    /**
     * Lobby Player Functions
     */
    static togglePlayerReady = (id, lobbyCode, readyState) => {
        // Find player in lobby
        const player = this.getPlayerFromLobby(id, lobbyCode);

        // Toggle the player's ready status
        player.readyState = readyState;

        return player;
    }

    static getPlayerReadyStatus = (id, lobbyCode) => {
        // Find player in lobby
        const player = this.getPlayerFromLobby(id, lobbyCode);

        return player.readyState;
    }

    static getPlayerFromLobby = (id, lobbyCode) => {
        // Find the lobby
        const lobby = this.findLobby(lobbyCode);
        // Find the player in lobby
        const player = PlayerHandler.getPlayer(lobby.players, id);

        return player;
    }

    static getPlayersInLobby = (lobbyCode) => {
        // Find the lobby
        const lobby = this.findLobby(lobbyCode);

        return lobby.players;
    }

    static deletePlayerFromLobby = (id, lobbyCode) => {
        // Find the lobby
        const lobby = this.findLobby(lobbyCode);
        // Delete the player from the lobby
        const allPlayers = PlayerHandler.deletePlayer(lobby.players, id);
        
        // Reset the players inside the lobby
        lobby.players = allPlayers;
    }

    static addPlayerToLobby = (player, lobbyCode) => {
        // Find the lobby to add the player to
        const lobby = this.findLobby(lobbyCode);

        lobby.players.push(player);
    }

    /**
     * Game Functions
     */

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
        let number = Math.floor(Math.random() * 10);
        if (number === 10) number = 9;
        code += number;
    }
  
    return code;
}