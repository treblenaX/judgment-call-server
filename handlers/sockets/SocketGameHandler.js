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
            ms: 1000    // @TODO change back
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                // Build response message
                response.message = 'Review phase is now done. Moving on to start discussion.';

                // Start the discussion phase
                GameHandler.dealDiscussionTurn(lobby);

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);
                
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
            ms: 1000    // @TODO change back
        };

        handleLobbyReady(() => {    // After `ms` seconds, verify lobby is still ready
            if (LobbyHandler.isLobbyReady(lobbyCode)) {
                
                // Save the data
                GameHandler.savePlayerDiscussionData(lobby);

                // Start the discussion phase
                const proceed = GameHandler.dealDiscussionTurn(lobby);

                // Reset the lobby ready states
                LobbyHandler.resetLobbyReadyStatus(lobbyCode);

                if (proceed) {  // Go to mitigation phase
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

// export const receiveClientDiscussion = (socket, request) => {
//     const lobbyCode = request.lobbyCode;
//     const lobby = LobbyHandler.findLobby(lobbyCode);
//     const players = lobby.players;

//     try {
//         // Get the data
//         const focusPlayer = lobby.gameMaster.focusPlayer;
//         // Save the data
//         const player = players.find(player => player.pId === focusPlayer.pId);
//         player.data.discussion = focusPlayer.data;
    
//         const response = {
//             lobby: lobby
//         };
    
//         if (GameHandler.isDoneDiscuss(lobby)) { // If everyone has gone
//             // Move on to the mitigation phase
//             emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_MITIGATION, response);
//         } else {    
//             // Go to the next discussion turn
//             emitToWholeLobby(socket, lobbyCode, ServerSocketStates.START_DISCUSSION_TURN, response);
//         }
//     } catch (error) {
//         socket.emit(ServerSocketStates.ERROR, `CODE: RCD_SGH : ${error}`);
//     }
// }

export const receiveClientMitigation = (socket, request) => {
    const pId = request.pId;
    const review = request.review;

    try {
        
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: CTL_SLH : ${error}`);
    }
}

export const receiveClientJudgmentCall = (socket, request) => {
    const pId = request.pId;
    const review = request.review;

    try {
        
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: CTL_SLH : ${error}`);
    }
}
/** Listener */
export const cardsDealtListener = (socket, request) => {

}
/** Private function helpers */
const emitToWholeLobby = (socket, lobbyCode, event, response) => {
    socket.to(lobbyCode).emit(event, response); // Emit to party
    socket.emit(event, response);   // Emit to client
}