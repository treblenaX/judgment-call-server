let playerId = 0;

export class PlayerHandler {
    static getNewPlayerId = () => {
        // Get fresh player Id
        const id = playerId;

        // Increment and update
        playerId++;
        if (playerId > 9999) {
            playerId = 0;
        }

        return id;
    }

    static createPlayer = (playerName, lobbyCode, socketId) => {
        const player = {
            socketId: socketId,
            pId: this.getNewPlayerId(),
            playerName: playerName,
            lobbyCode: lobbyCode,
            readyState: false,
            data: {
                review: ''
            }
        }

        return player;
    }
    
    static getPlayer = (players, id) => {
        let player = players.find(player => player.pId == id);
        return player;
    }
    
    static deletePlayer = (players, id) => {
        const index = players.findIndex((player) => player.pId == id);
        if (index !== -1) return players.splice(index, 1)[0];
    }

    static setPlayerReady = (id, bool) => {
        const player = this.getPlayer(id);

        player.readyState = bool;

        return bool;
    }
}