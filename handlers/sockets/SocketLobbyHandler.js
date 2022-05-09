import Logger from "js-logger";
import { GameHandler } from "../GameHandler.js";
import { LobbyHandler } from "../LobbyHandler.js";
import { PlayerHandler } from "../PlayerHandler.js";
import { TimerHandler } from "../TimerHandler.js";
import { ServerSocketStates } from "../../constants/ServerSocketStates.js"
import { GameStates } from "../../constants/GameStates.js";

export const connectToLobby = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const playerName = request.playerName;

    try {
        // Check if the lobby requested is valid
        if (!LobbyHandler.isLobbyValid(lobbyCode)) throw new Error('Lobby does not exist.');

        // Create the player
        const player = PlayerHandler.createPlayer(playerName, lobbyCode, socket.client.id);

        // Add the player to the lobby
        LobbyHandler.addPlayerToLobby(player, lobbyCode);

        // Join socket.io room
        socket.join(lobbyCode);
        
        // Emit response + sucess back to client
        const lobby = LobbyHandler.findLobby(lobbyCode);
        const response = {
            clientPlayer: player,
            lobby: lobby,
            message: 'Player successfully connected to lobby.'
        }

        Logger.info(`[${clientId(socket)} - ${playerName}] has connected to [${lobbyCode}].`);

        // Send verification to the client
        socket.emit(ServerSocketStates.PLAYER_CONNECTED_TO_LOBBY, response);

        // Build lobby response
        const lobbyResponse = {
            lobby: lobby,
            message: 'A new player has joined the lobby.'
        }

        // Send update request for everyone in the room
        emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, lobbyResponse);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: CTL_SLH : ${error}`);
    }
}

export const toggleReadyUp = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const readyState = request.readyState;

    try {
        const gameMaster = LobbyHandler.findLobby(lobbyCode).gameMaster;

        // Toggle the player's ready up 
        LobbyHandler.togglePlayerReady(pId, lobbyCode, readyState);

        // Double-check that the change is made; else throw Error
        if (LobbyHandler.getPlayerReadyStatus(pId, lobbyCode) != readyState) {
            throw new Error('Failed to change ready status.');
        } else {
            // Emit response + success back to room
            const response = {
                lobby: LobbyHandler.findLobby(lobbyCode),
                message: 'A player has changed their ready status.'
            }

            // Send update request to requester socket
            // Send update request for everyone in the room
            emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);

            // If lobby is ready
            const handleRequest = {
                lobbyCode: lobbyCode,
                ms: 1000 
            };

            handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
                if (LobbyHandler.isLobbyReady(lobbyCode)) {
                    // Find the lobby in focus
                    const lobby = LobbyHandler.findLobby(lobbyCode);

                    // Reset the lobby ready states
                    LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                    switch (gameMaster.state) {
                        case GameStates.LOBBY:
                            // Draw cards for the lobby
                            GameHandler.dealCards(lobby);

                            emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_DEAL, response);
                            return;
                        case GameStates.DISCUSS:
                            // Go to next turn
                            const proceed = GameHandler.dealDiscussionTurn(lobby);

                            emitToWholeLobby(socket, lobbyCode, 
                                (proceed) 
                                    ? ServerSocketStates.START_MITIGATION
                                    : ServerSocketStates.START_DISCUSSION_TURN
                                , response);
                            return;
                    }
                } else {
                    // Emit to all clients that start up have been cancelled
                    emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);
                }

                // Clean up after
                TimerHandler.deleteTimer(lobbyCode);
            }, socket, handleRequest);
        }
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: TRU_SLH : ${error}`);
    }
}


export const handleLobbyReady = (callback, socket, request) => {
    const lobbyCode = request.lobbyCode;
    const ms = request.ms;

    try {
        const lobby = LobbyHandler.findLobby(lobbyCode);
        const isLobbyReady = LobbyHandler.isLobbyReady(lobbyCode);
        const isValidPlayerCount = LobbyHandler.verifyLobbyPlayerCount(lobbyCode, lobby);
        const isCountDown = lobby.readyStatus.isCountDown;

        // Handle lobby is ready to start
        if (isLobbyReady && isValidPlayerCount && !isCountDown) {
            // Emit countdown start to the room
            emitToWholeLobby(socket, lobbyCode, ServerSocketStates.ALL_PLAYERS_READY);

            // Set the countdown variable
            LobbyHandler.setCountDown(true, lobby);

            // Start timer then check to see if received all client responses
            TimerHandler.setTimer(callback, ms, lobbyCode);
        } else if (!isLobbyReady && isCountDown) { //  Handle someone unreadying when game about to start  
            emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);

            // Stop countdown variable
            LobbyHandler.setCountDown(false, lobby);

            // Stop the timer
            TimerHandler.deleteTimer(lobbyCode);
        }
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: HLR_SLH : ${error}`);
    }
}

export const handleUserDisconnect = (socket) => {
    const clientId = socket.client.id;
    const lobbies = LobbyHandler.getLobbies();

    // Find the player
    lobbies.forEach(lobby => {
        const players = lobby.players;
        const player = players.find(player => player.socketId === clientId);

        if (player) {   // If the player is found
            // Delete the player
            PlayerHandler.deletePlayer(players, player.pId);
        }
    });

    // Scan through the lobbies and delete any empty lobbies @TODO make more efficient
    lobbies.forEach(lobby => {
        const count = lobby.players.length;
        const lobbyCode = lobby.lobbyCode;
        if (count == 0) {
            Logger.info(`[Lobby - ${lobbyCode}] has been deleted.`);
            LobbyHandler.deleteLobby(lobbyCode);
        }
    });
}

const emitToWholeLobby = (socket, lobbyCode, event, response) => {
    socket.to(lobbyCode).emit(event, response); // Emit to party
    socket.emit(event, response);   // Emit to client
}
const clientId = (socket) => socket.client.id;