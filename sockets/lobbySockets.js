import Logger from "js-logger";
import { LobbyHandler } from "../handlers/LobbyHandler.js";
import { PlayerHandler } from "../handlers/PlayerHandler.js";
import { BasicSockets } from "./basicSockets.js";

// Requested Events
const NEED_LOBBY_CODE = 'NEED LOBBY CODE';
const CLIENT_DISCONNECT = 'disconnect';
const CLIENT_JOINED_LOBBY = 'CLIENT JOINED LOBBY';
const REQUESTING_LOBBY_INFO = 'REQUESTING LOBBY INFO';
const UPDATE_READY_STATE = 'UPDATE PLAYER READY STATE';
const DOES_LOBBY_EXIST = 'DOES LOBBY EXIST'

// Response Events
const CLIENT_CONNECTED = 'CLIENT CONNECTED';
const FOUND_LOBBY_CODE = 'FOUND LOBBY CODE';
const WELCOME_PLAYER = 'WELCOME PLAYER';
const SENDING_LOBBY_INFO = 'SENDING LOBBY INFO';
const REFRESH_PLAYER_LIST = 'REFRESH PLAYER LIST';
const CONFIRM_UPDATE_READY_STATE = 'CONFIRMED PLAYER READY STATE';
const LOBBY_EXIST_RESPONSE = 'LOBBY EXISTENCE RESPONSE';
 
export class LobbySockets extends BasicSockets {
    static replyClientConnected = (socket) => {
        this.sendToClient(socket, CLIENT_CONNECTED, true);

        Logger.info(`CONNECTED - [User ${socket.client.id}] Client connected.`);
    };

    static listenForLobbyExistence = (socket) => {
        this.listen(socket, DOES_LOBBY_EXIST, (request) => {
            const lobbyCode = request.lobbyCode;
            const existence = LobbyHandler.isLobbyValid(lobbyCode);

            console.log('hit');

            const response = {
                existence: existence
            };

            socket.emit(LOBBY_EXIST_RESPONSE, response);
        });
    }

    static listenForLobbyCodeNeed = (socket, ioSockets) => {
        this.listen(socket, NEED_LOBBY_CODE, (request) => {
            const playerName = request.player;
            const newLobby = request.isHost;
            const requestCode = request.joinCode;
            const playerId = socket.client.id;

            let lobbyCode = '';
            let response = {};

            if (newLobby) { // NEED TO CREATE NEW LOBBY?
                // Generate new lobby lobbyCode to start new socket room
                lobbyCode = LobbyHandler.createLobbyCode();
                LobbyHandler.createLobby(lobbyCode);
                Logger.info(`LOBBY - [User ${playerId}_${playerName}] Created new lobby ${lobbyCode}.`);
                response.lobbyCode = lobbyCode;
                // Add players to our list of current players
                PlayerHandler.addPlayer(playerId, playerName, lobbyCode);
            } else {    // JOINING EXISTING LOBBY...
                lobbyCode = (LobbyHandler.isLobbyValid(requestCode)) ? requestCode : null;

                if (lobbyCode == null) {    // Lobby does not exist.
                    response.error = 'Lobby lobbyCode in request does not exist.';
                    Logger.error('Lobby lobbyCode in request does not exist.');
                } else {
                    // Add players to our list of current players
                    PlayerHandler.addPlayer(playerId, playerName, lobbyCode);
                    // Notify client to refresh list
                    this.sendPlayerListRefresh(ioSockets, lobbyCode);
                    response.lobbyCode = lobbyCode;
                }
            }

            if (!response.error) {  // No error so far.
                // Join the room with the desired lobby lobbyCode
                socket.join(lobbyCode);
            }
            
            // Send back the success/error response back to client
            socket.emit(FOUND_LOBBY_CODE, response);
            Logger.info(`LOBBY - [User ${playerId}_${playerName}] Sent lobby lobbyCode: ${lobbyCode}. Waiting for handshake...`);
        });
    };

    static listenForClientDisconnect = (socket) => {
        this.listen(socket, CLIENT_DISCONNECT, (reason) => {
            Logger.info(`DISCONNECTED - [User ${socket.client.id}] Client has disconnected - Reason: ${reason}.`);
        });
    };

    static listenForClientJoinedLobby = (socket) => {
        this.listen(socket, CLIENT_JOINED_LOBBY, (lobbyCode) => {
            const playerId = socket.client.id;

            Logger.info(`LOBBY[${lobbyCode}] - [User ${playerId}] Welcome handshake received. Welcome, user.`);

            socket.emit(WELCOME_PLAYER);
        });
    }

    /** Lobby Menu specific */

    static sendInitLobbyInfo = (socket, ioSockets) => {
        this.listen(socket, REQUESTING_LOBBY_INFO, (lobbyCode) => {
            if (!lobbyCode) throw new Error(`Send Lobby Info - No lobby lobbyCode found. ${lobbyCode}`);

            this.sendToLobby(ioSockets, lobbyCode, SENDING_LOBBY_INFO, PlayerHandler.getPlayers(lobbyCode));
        })
    }

    static sendPlayerListRefresh = (ioSockets, lobbyCode) => {
        this.sendToLobby(ioSockets, lobbyCode, REFRESH_PLAYER_LIST, PlayerHandler.getPlayers(lobbyCode));
    }

    static listenForPlayerReady = (socket, ioSockets) => {
        this.listen(socket, UPDATE_READY_STATE, (request) => {
            const playerId = socket.client.id;
            const readyState = request.readyState;
            const lobbyCode = request.lobbyCode;

            Logger.info(`LOBBY[${lobbyCode}] - [User ${playerId}] User ready: ${readyState}`);

            this.sendToClient(socket, CONFIRM_UPDATE_READY_STATE, PlayerHandler.setPlayerReady(playerId, readyState));
            this.sendPlayerListRefresh(ioSockets, lobbyCode);
        });
    }   
}

/** Private Logging Helpers */
const logLobbyPlayers = (lobbyCode) => {
    Logger.info(`LOBBY ${lobbyCode} - ${PlayerHandler.getPlayers(lobbyCode)}`);
}
  