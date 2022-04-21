import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Routes
import indexRouter from './routes/index.js';
import lobbyRouter from './routes/lobby.js';
import testRouter from './routes/tests.js';

import Logger from 'js-logger';
import { SocketStates } from './handlers/sockets/SocketStates.js';
import { ClientSocketStates } from './handlers/sockets/ClientSocketStates.js';
import { welcomeUser } from './handlers/sockets/SocketConnectionHandler.js';
import { connectToLobby, toggleReadyUp } from './handlers/sockets/SocketLobbyHandler.js';

export const DEBUG = false;
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  },
  pingInterval: 10000,  // 10 seconds
  pingTimeout: 5000  // 5 seconds timeout
});

/** Init middleware */
app.set('socketio', io);

app.use(bodyParser.json());
app.use(cors());
Logger.useDefaults({
  formatter: function (messages, context) {
      messages.unshift(new Date().toUTCString())
  }
});
/** Static files middleware */
app.use(express.static('/app/public'));  // public directory
if (DEBUG) {
  app.use(express.static(path.join(__dirname, 'public', 'client', 'build')));   // public client build
} else {
  app.use(express.static('/app/public/client/build'));   // public client build
}

/** Sockets INIT */
const onConnection = (socket) => {
  // Log the user connection
  welcomeUser(socket);
  // On need to connect to lobby
  socket.on(ClientSocketStates.CONNECT_TO_LOBBY, (request) => connectToLobby(socket, request));
  // On need to toggle ready up
  socket.on(ClientSocketStates.TOGGLE_PLAYER_READY, (request) => toggleReadyUp(socket, request));
  // On need to refresh lobby information
  // socket.on(ClientSocketStates.REFRESH_LOBBY_INFORMATION, (request) => refreshLobbyInformation(socket, request));
}

io.on(SocketStates.CONNECTION, onConnection);

/** Routing */
app.use('/', indexRouter);
app.use('/api/lobby', lobbyRouter);
app.use('/test', testRouter);

server.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`);
});

export default app;

