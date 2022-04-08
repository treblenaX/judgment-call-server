import Logger from "js-logger";
import { LobbyHandler } from "../handlers/LobbyHandler.js";
import { PlayerHandler } from "../handlers/Player.js";
import { BasicSockets } from "./basicSockets.js";

// Requested Events
const NEED_LOBBY_CODE = 'NEED LOBBY CODE';
const CLIENT_DISCONNECT = 'disconnect';
const CLIENT_JOINED_LOBBY = 'CLIENT JOINED LOBBY';
const REQUESTING_LOBBY_INFO = 'REQUESTING LOBBY INFO';

// Response Events
const CLIENT_CONNECTED = 'CLIENT CONNECTED';
const FOUND_LOBBY_CODE = 'FOUND LOBBY CODE';
const WELCOME_PLAYER = 'WELCOME PLAYER';
const SENDING_LOBBY_INFO = 'SENDING LOBBY INFO';
const REFRESH_PLAYER_LIST = 'REFRESH PLAYER LIST';
 
export class LobbySockets extends BasicSockets {
    static replyClientConnected = (socket) => {
        this.sendToClient(socket, CLIENT_CONNECTED, true);

        Logger.info(`CONNECTED - [User ${socket.client.id}] Client connected.`);
    };

    static listenForLobbyCodeNeed = (socket, allSockets) => {
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
                    this.sendPlayerListRefresh(allSockets, lobbyCode);
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

    /** Lobby specific */

    static sendInitLobbyInfo = (socket, allSockets) => {
        this.listen(socket, REQUESTING_LOBBY_INFO, (lobbyCode) => {
            if (!lobbyCode) throw new Error(`Send Lobby Info - No lobby lobbyCode found. ${lobbyCode}`);

            this.sendToLobby(allSockets, lobbyCode, SENDING_LOBBY_INFO, PlayerHandler.getPlayers(lobbyCode));
        })
    }

    static sendPlayerListRefresh = (allSockets, lobbyCode) => {
        this.sendToLobby(allSockets, lobbyCode, REFRESH_PLAYER_LIST, PlayerHandler.getPlayers(lobbyCode));
    }

    static hi = (socket, allSockets) => {
        this.listen(socket, 'ready', (data) => {
            allSockets.in('123123').emit('message', data);
        })
    }
}

/** Private Logging Helpers */
const logLobbyPlayers = (lobbyCode) => {
    Logger.info(`LOBBY ${lobbyCode} - ${PlayerHandler.getPlayers(lobbyCode)}`);
}
  