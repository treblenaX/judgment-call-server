import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import { Server } from 'socket.io';
import path from 'path';

import getRouter from './routes/get.js';
import Logger from 'js-logger';
import { LobbySockets } from './sockets/lobbySockets.js';
import { LobbyHandler } from './handlers/LobbyHandler.js';

const PORT = process.env.PORT || 3000;

const router = express.Router();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const connections = new Map();

/** Init */
app.use(bodyParser.json());
Logger.useDefaults();
app.use(express.static(path.resolve() + '/client/build'));

// app.use(express.static(path.resolve() + '/test.html'));

/** Basic Routes */
app.get('/', (req, res) => {
  res.sendFile(path.resolve() + "/client/builid/index.html");
  // res.sendFile(path.resolve() + '/test.html');
});

/**
   * SOCKET | CONNECTION
   * New browser connects to the server and 
   */
 io.on('connection', (socket) => {
  // On create a lobby or join lobby connection, create the user
  

  // Display `connected` to client
  LobbySockets.replyClientConnected(socket);

  // LISTEN - lobby code request
  LobbySockets.listenForLobbyCodeNeed(socket, io.sockets);

  // LISTEN - client join
  LobbySockets.listenForClientJoinedLobby(socket);

  // LISTEN - client disconnection
  LobbySockets.listenForClientDisconnect(socket);

  /** Lobby Listeners */
  LobbySockets.sendInitLobbyInfo(socket, io.sockets);
});

/** API */
app.use('/api', getRouter);

server.listen(PORT, () => {
    console.log("Server is listening at port 3000");
});

