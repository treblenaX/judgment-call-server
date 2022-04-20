import { expect } from 'chai';
import { GameHandler } from '../handlers/GameHandler.js';
import { LobbyHandler } from '../handlers/LobbyHandler.js';
import { PlayerHandler } from '../handlers/PlayerHandler.js';

describe('Lobby stuff', () => {
    it('Create lobby', () => {
        // Create the lobby 
        const lobbyCode = LobbyHandler.createLobby();
        const lobbies = LobbyHandler.getLobbies();

        expect(lobbies[0]).to.have.property('lobbyCode', lobbyCode);
    });

    it('Add max players to lobby', () => {
        // Create the lobby 
        const lobbies = LobbyHandler.getLobbies();
        const lobbyCode = lobbies[0].lobbyCode;

        // Add max players
        for (let i = 0; i < 6; i++) {
            const player = PlayerHandler.createPlayer(`${i}`, lobbyCode);
            LobbyHandler.addPlayerToLobby(player, lobbyCode);
        }

        expect(lobbies[0].players).to.have.length(6);
        expect(lobbies[0].players[0]).to.have.property('lobbyCode');
    });
});

describe('Game stuff', () => {
    describe('INIT', () => {
        it('Create game', async () => {
            const lobby = LobbyHandler.getLobbies()[0];

            // Append new game to the lobby
            lobby.gameMaster = await GameHandler.createGame();

            expect(lobby.gameMaster).to.not.be.null;
            expect(lobby.gameMaster).to.have.property('gameFiles');
        });
    });
    describe('DEAL', () => {
        it('deal cards', async () => {
            const lobby = LobbyHandler.getLobbies()[0];

            // deal cards
            GameHandler.dealCards(lobby);

            console.log(JSON.stringify(lobby, undefined, 2));

            for (let i = 0; i < lobby.players.length; i++) {
                const player = lobby.players[i];

                expect(player).to.have.property('cards');
            }
        });
    });
})