import { LobbyHandler } from "../LobbyHandler.js";
import { PlayerHandler } from "../PlayerHandler.js";

export const receiveClientReview = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const pId = request.pId;
    const review = request.review;

    try {
        // Find lobby
        const lobby = LobbyHandler.findLobby(lobbyCode);
        // Find player
        const player = PlayerHandler.getPlayer(lobby.players, pId);

        // Add the review to the player data
        player.data = {
            review: review
        };

        console.log(player);

        // Socket emit to get ready for the discussion part
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: CTL_SLH : ${error}`);
    }
}

export const receiveClientDiscussion = (socket, request) => {
    const pId = request.pId;
    const review = request.review;

    try {
        
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, `CODE: CTL_SLH : ${error}`);
    }
}

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