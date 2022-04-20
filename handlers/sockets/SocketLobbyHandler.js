import Logger from "js-logger";
import { LobbyHandler } from "../LobbyHandler.js";
import { PlayerHandler } from "../PlayerHandler.js";
import { ServerSocketStates } from "./ServerSocketStates.js"

export const connectToLobby = (socket, request) => {
    const lobbyCode = request.lobbyCode;
    const playerName = request.playerName;

    try {
        // Check if the lobby requested is valid
        if (!LobbyHandler.isLobbyValid(lobbyCode)) throw new Error('Lobby does not exist.');

        // Create the player
        const player = PlayerHandler.createPlayer(playerName, lobbyCode);

        // Add the player to the lobby
        LobbyHandler.addPlayerToLobby(player, lobbyCode);

        // Join socket.io room
        socket.join(lobbyCode);
        
        // Emit response + sucess back to client
        const lobby = LobbyHandler.findLobby(lobbyCode);
        const response = {
            clientPlayer: player,
            lobby: lobby
        }

        Logger.info(`[${clientId(socket)} - ${playerName}] has connected to [${lobbyCode}].`);

        // Send verification to the client
        socket.emit(ServerSocketStates.PLAYER_CONNECTED_TO_LOBBY, response);

        // Build lobby response
        const lobbyResponse = {
            lobby: lobby
        }

        // Send update request for everyone in the room
        socket.to(lobbyCode).emit(ServerSocketStates.UPDATE_LOBBY_INFORMATION, lobbyResponse);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, error);
    }
}

// export const refreshLobbyInformation = (socket, request) => {
//     try {
//         // Build response for the socket room
//         const response = {
//             lobby: LobbyHandler.findLobby(lobbyCode)
//         }

//         // Send refresh response to room
//         socket.to(lobbyCode).emit(ServerSocketStates.REFRESH_LOBBY_RESPONSE);
//     } catch (error) {
//         socket.emit(ServerSocketStates.ERROR, error);
//     }
// }

// @TODO: socket disconnect handle

const clientId = (socket) => socket.client.id;