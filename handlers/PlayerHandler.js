const players = [];

export class PlayerHandler {
    static addPlayer = (id, playerName, lobbyRoom) => {
        if (!playerName || playerName == undefined) return null;
        const existingPlayer = players.find(player => players.playerName === player);
    
        if (existingPlayer) return { error: "Username has already been taken" }
        if (!playerName && !lobbyRoom) return { error: "Username and lobby are required" }
        if (!playerName) return { error: "Username is required" }
        if (!lobbyRoom) return { error: "Lobby is required" }
    
        const player = { 
            id: id, 
            playerName: playerName, 
            lobbyRoom: lobbyRoom,
            readyState: false
        }

        players.push(player)
        return { player }
    }
    
    static getPlayer = (id) => {
        let player = players.find(player => player.id == id);
        return player;
    }
    
    static deletePlayer = (id) => {
        const index = players.findIndex((player) => player.id == id);
        if (index !== -1) return players.splice(index, 1)[0];
    }
    
    static getPlayers = (lobbyRoom) => players.filter(player => player.lobbyRoom === lobbyRoom);

    static setPlayerReady = (id, bool) => {
        const player = this.getPlayer(id);

        player.readyState = bool;

        return bool;
    }
}