export class BasicSockets {
    static sendToClient = (socket, event, payload) => {
        return socket.emit(event, payload);
    }

    static sendToLobby = (allSockets, room, event, payload) => {
        return allSockets.in(room).emit(event, payload);
    }

    static listen = async (socket, event, callback) => {
        return socket.on(event, callback);
    }
}