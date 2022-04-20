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
        const response = {
            clientPlayer: player,
            lobby: LobbyHandler.findLobby(lobbyCode)
        }

        Logger.info(`[${clientId(socket)} - ${playerName}] has connected to [${lobbyCode}].`);

        // Send verification to the client
        socket.emit(ServerSocketStates.PLAYER_CONNECTED_TO_LOBBY, response);
        // Send update request for everyone in the room
        socket.to(lobbyCode).emit(ServerSocketStates.UPDATE_LOBBY_INFORMATION);
    } catch (error) {
        socket.emit(ServerSocketStates.ERROR, error);
    }
}

const clientId = (socket) => socket.client.id;