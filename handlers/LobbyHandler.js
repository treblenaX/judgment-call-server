const lobbies = [];

export class LobbyHandler {
    static createLobbyCode() {
        let validLobby = false;
        let lobbyCode = '';

        while (!validLobby) {
            lobbyCode = generateLobbyCode();

            if (!lobbies.find(lobby => lobbies === lobby)) {    // Lobby does not exist
                validLobby = true;
            }
        }

        return lobbyCode;
    }

    static createLobby(code) {
        if (!code || code == undefined) return false;

        lobbies.push(code);

        return true;
    }

    static isLobbyValid(code) {
        const lobby = lobbies.find(lobby => lobby === code);
        return (!lobby) ? false : true;
    }

    static deleteLobby(code) {
        const index = lobbies.indexOf(code);
        if (index < 0) return false;    // Lobby delete unsuccessful - lobby doesn't exist.
        lobbies.splice(index, 1);
        return true;    // Lobby delete successful
    }
}


/**
 * HELPER
 * @returns 6-digits room code
 */
 function generateLobbyCode() {
    let code = '';
  
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 9);
    }
  
    return code;
}