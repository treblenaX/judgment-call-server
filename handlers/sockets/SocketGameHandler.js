import { ServerSocketStates } from "../../constants/ServerSocketStates.js";
import { GameHandler } from "../GameHandler.js";
import { LobbyHandler } from "../LobbyHandler.js";
import { PlayerHandler } from "../PlayerHandler.js";
import { TimerHandler } from "../TimerHandler.js";
import { handleLobbyReady } from "./SocketLobbyHandler.js";

export const receiveClientReview = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const review = request.review;
    const readyState = request.readyState;

    try {
        // Find lobby
        const lobby = LobbyHandler.findLobby(lobbyCode);
        // Find player
        const player = PlayerHandler.getPlayer(lobby.players, pId);

        // Add the review to the player data if ready
        player.data.review = (readyState) ? review : '';

        // Toggle the player's ready up 
        LobbyHandler.togglePlayerReady(pId, lobbyCode, readyState);

        // Check if the entire player is readied up
        // Init response
        const response = {
            lobby: lobby
        };

        const handleRequest = {
            lobbyCode: lobbyCode,
            ms: 7000 
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                // Build response message
                response.message = 'Review phase is now done. Moving on to start discussion.';

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                // Start the discussion phase
                GameHandler.dealDiscussionTurn(lobby);
                
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.DIRECT_TO_DISCUSSION, response);
            } else {
                // Emit to all clients that start up have been cancelled
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);
            }

            response.message = '';

            // Clean up after
            TimerHandler.deleteTimer(lobbyCode);
        }, socket, handleRequest);

        // Send update response to whole party
        emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: RCR_SGH : ${error}`);
    }
}

export const updateClientDiscussion = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const val = request.val;
    const col = request.col;

    const lobby = LobbyHandler.findLobby(lobbyCode);
    const gameMaster = lobby.gameMaster;

    // Save the data to the window
    gameMaster.focusPlayer.data[col].push(val);

    const response = {
        lobby: lobby
    }
    
    // Emit the data back to the clients to update
    emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
}

export const readyClientDiscussion = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const readyState = request.readyState;
    const lobby = LobbyHandler.findLobby(lobbyCode);

    try {
        // Toggle the player's ready up 
        LobbyHandler.togglePlayerReady(pId, lobbyCode, readyState);

        // console.log(JSON.stringify(lobby.readyStatus, null, 3));

        // Init response
        const response = {
            lobby: lobby
        };

        const handleRequest = {
            lobbyCode: lobbyCode,
            ms: 7000 
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                
                // Save the data
                GameHandler.savePlayerDiscussionData(lobby);

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                // Start the discussion phase
                const proceed = GameHandler.dealDiscussionTurn(lobby);

                // Reset the discussion timer
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);


                if (proceed) {  // Go to mitigation phase
                    // Change phase
                    GameHandler.dealMitigation(lobby);
                    // Build response message
                    response.message = 'Discussion phase is now done. Moving on to start mitigation.';
                    emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_MITIGATION, response);
                } else {    // Go to the next round of discussion
                    emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
                }
            } else {
                // Emit to all clients that start up have been cancelled
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);
            }

            response.message = '';

            // Clean up after
            TimerHandler.deleteTimer(lobbyCode);
        }, socket, handleRequest);

        // Send update response to whole party
        emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: RCD_SGH : ${error}`);
    }
}

export const receiveClientMitigation = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const mitigation = request.mitigation;
    const readyState = request.readyState;

    try {
        // Find lobby
        const lobby = LobbyHandler.findLobby(lobbyCode);
        // Find player
        const player = PlayerHandler.getPlayer(lobby.players, pId);

        // Add the mitigation to the player data if ready
        player.data.mitigation = (readyState) ? mitigation : '';

        // Toggle the player's ready up 
        LobbyHandler.togglePlayerReady(pId, lobbyCode, readyState);

        // Check if the entire player is readied up
        // Init response
        const response = {
            lobby: lobby
        };

        const handleRequest = {
            lobbyCode: lobbyCode,
            ms: 7000   
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                // Build response message
                response.message = 'Mitigation phase is now done. Moving on to start judgment call.';

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                // Start the Judgment Call phase
                GameHandler.dealJudgment(lobby);
                
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_JUDGMENT_CALL, response);
            } else {
                // Emit to all clients that start up have been cancelled
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);
            }

            response.message = '';

            // Clean up after
            TimerHandler.deleteTimer(lobbyCode);
        }, socket, handleRequest);

        // Send update response to whole party
        emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: RCM_SGH : ${error}`);
    }
}

export const receiveClientJudgment = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const judgment = request.judgment;
    const readyState = request.readyState;

    try {
        // Find lobby
        const lobby = LobbyHandler.findLobby(lobbyCode);
        // Find player
        const player = PlayerHandler.getPlayer(lobby.players, pId);

        // Add the mitigation to the player data if ready
        player.data.judgment = (readyState) ? judgment : '';

        // Toggle the player's ready up 
        LobbyHandler.togglePlayerReady(pId, lobbyCode, readyState);

        var currentdate = new Date(); 
        var datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth()+1)  + "/" 
                        + currentdate.getFullYear() + " @ "  
                        + currentdate.getHours() + ":"  
                        + currentdate.getMinutes() + ":" 
                        + currentdate.getSeconds();

        // Check if the entire player is readied up
        // Init response
        const response = {
            lobby: lobby,
            timestamp: datetime
        };

        const handleRequest = {
            lobbyCode: lobbyCode,
            ms: 7000    // @TODO change back
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                // Build response message
                response.message = 'Judgment phase is now done. Moving on to start summary.';

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                // Start the summary phase
                GameHandler.dealSummary(lobby);
                
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_SUMMARY, response);
            } else {
                // Emit to all clients that start up have been cancelled
                emitToWholeLobby(socket, lobbyCode, ServerSocketStates.STOP_COUNTDOWN);
            }

            response.message = '';

            // Clean up after
            TimerHandler.deleteTimer(lobbyCode);
        }, socket, handleRequest);

        // Send update response to whole party
        emitToWholeLobby(socket, lobbyCode, ServerSocketStates.UPDATE_LOBBY_INFORMATION, response);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: RCJ_SGH : ${error}`);
    }
}
/** Private function helpers */
const emitToWholeLobby = (socket, lobbyCode, event, response) => {
    socket.to(lobbyCode).emit(event, response); // Emit to party
    socket.emit(event, response);   // Emit to client
}