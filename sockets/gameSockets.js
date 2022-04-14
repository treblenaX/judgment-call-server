import { GameHandler } from "../handlers/GameHandler";
import { LobbyHandler } from "../handlers/LobbyHandler";
import { BasicSockets } from "./basicSockets";
import { SocketStates } from "./SocketStates";

export class GameSockets extends BasicSockets {
    // PRE-GAME
    static lobbyEmitGameReadyStatus = async (socket, ioSockets, request) => {
        const lobbyCode = request.lobbyCode;

        if (LobbyHandler.isLobbyReady(lobbyCode)) { // If the lobby is ready
            // Create game w/ lobby code
            const gameMaster = GameHandler.createGame(lobbyCode);

            // Send game to lobby
            this.sendToLobby(ioSockets, lobbyCode, SocketStates.INIT_PLAYERS_READY, { game: gameMaster });
        }
    };

    // DEAL
    /**
     * Emit `DEAL_INIT` state to the client. 
     * 
     * Game: Shuffle and deal cards
     * @param {*} socket 
     * @param {*} ioSockets 
     * @param {*} request 
     */
    static lobbyEmitDealInit = async (socket, ioSockets, request) => {
        const lobbyCode = request.lobbyCode;

        // Deal cards
        
    }
    // REVIEW
    // DISCUSS
    // MITIGATION
    // JUDGMENT CALL
    // OUTPUT
}