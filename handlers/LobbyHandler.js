import { GameStates } from "../constants/GameStates.js";
import { GameHandler } from "./GameHandler.js";
import { PlayerHandler } from "./PlayerHandler.js";
import { TimerHandler } from "./TimerHandler.js";

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
            players: [],
            readyStatus: {
                isCountDown: false,
                count: 0
            }
        }

        GameHandler.changeGameState(lobby.gameMaster, GameStates.LOBBY);

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
        const index = lobbies.findIndex(lobby => lobby.lobbyCode === code);
        if (index < 0) return false;    // Lobby delete unsuccessful - lobby doesn't exist.
        lobbies.splice(index, 1)[0];
        return true;    // Lobby delete successful
    }
    
    static deletePlayer = (players, id) => {
        const index = players.findIndex((player) => player.pId == id);
        if (index !== -1) return players.splice(index, 1)[0];
    }

    static getLobbies() {
        return lobbies;
    }

    static resetLobbyReadyStatus = (lobbyCode) => {
        // Find the lobby players
        const lobby = LobbyHandler.findLobby(lobbyCode);
        const players = LobbyHandler.getPlayersInLobby(lobbyCode);

        // Unready them
        players.map((player) => player.readyState = false);
 
        // Reset the counter
        lobby.readyStatus.count = 0;
        lobby.readyStatus.isCountDown = false;
    }

    /**
     * Lobby Player Functions
     */
    static togglePlayerReady = (id, lobbyCode, readyState) => {
        // Find player in lobby
        const lobby = this.findLobby(lobbyCode);
        const player = this.getPlayerFromLobby(id, lobbyCode);
        //@TODO take out

        // Toggle the player's ready status
        player.readyState = readyState;
        // Update number of ready players in status
        lobby.readyStatus.count += (readyState == true) ? 1 : -1;

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
            const lobby = LobbyHandler.findLobby(code);
            const players = lobby.players;
            const readyPlayers = lobby.readyStatus.count;

            return (players.length <= readyPlayers);
        }

        return false;
    }

    /** helper functions */
    static verifyLobbyPlayerCount(code, lobby) {
        if (this.isLobbyValid(code)) {

            const count = lobby.players.length;

            return (1 <= count && count <= 6);
        }
        return null;    // @TODO: return error
    }
    static findLobby = (code) => lobbies.find(lobby => lobby.lobbyCode === code);
    static setCountDown = (bool, lobby) => lobby.readyStatus.isCountDown = bool;
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