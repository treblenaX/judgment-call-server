import { expect } from 'chai';
import { GameHandler } from '../handlers/GameHandler.js';
import { LobbyHandler } from '../handlers/LobbyHandler.js';
import { PlayerHandler } from '../handlers/PlayerHandler.js';

describe('Lobby stuff', () => {
    it('Create lobby', async () => {
        // Create the lobby 
        const lobbyCode = LobbyHandler.createLobby(await GameHandler.createGame());
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
        it('deal cards max lobby', async () => {
            const lobby = LobbyHandler.getLobbies()[0];

            // deal cards
            GameHandler.dealCards(lobby);

            // console.log(JSON.stringify(lobby, undefined, 2));

            for (let i = 0; i < lobby.players.length; i++) {
                const player = lobby.players[i];
                const cards = player.cards;

                expect(cards).to.not.be.null;
                expect(cards).to.have.property('stakeholder');
                expect(cards).to.have.property('rating');
                expect(cards).to.have.property('principle');

                expect(cards.stakeholder).to.not.be.undefined;
                expect(cards.rating).to.not.be.undefined;
                expect(cards.principle).to.not.be.undefined;
            }
        });
    });
    describe('DISCUSS', () => {
        it('handle max players discussion turn', async () => {
            const lobby = LobbyHandler.getLobbies()[0];
            const players = lobby.players;

            const testReview = `
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed consectetur, quam non consectetur sollicitudin, libero arcu ornare tortor, vitae pretium metus leo vitae metus. Curabitur a mattis turpis. Donec vestibulum ultricies auctor. Vestibulum dictum posuere libero, eu tempor arcu porttitor sed. Aenean arcu arcu, gravida vitae tellus et, scelerisque porttitor erat. Integer tincidunt dictum ipsum sit amet porttitor. Duis eget consectetur mauris. Proin eget dui at neque porttitor sollicitudin eget ac sem.

                Nunc lobortis metus at lacinia euismod. In id orci vel odio volutpat euismod. In pharetra id leo id ullamcorper. Aenean vehicula velit vel venenatis rutrum. Fusce in massa vitae augue viverra elementum. Maecenas ante ex, venenatis at nibh quis, varius convallis felis. Phasellus placerat sed nunc vitae accumsan. Nunc porttitor, dui sit amet molestie hendrerit, nulla felis feugiat nulla, ac suscipit quam dolor non orci. Integer sollicitudin magna eu tristique accumsan. Maecenas dignissim purus at tellus pellentesque, ac tincidunt eros tincidunt. Morbi porttitor elementum augue, sed laoreet leo fermentum sit amet. 
            `.trim();
            // add reviews
            for (let i = 0; i < players.length; i++) {
                players[i].data.review = testReview + i;
            }

            for (let i = 0; i < players.length; i++) {
                const payload = GameHandler.dealDiscussionTurn(lobby);

                expect(payload).to.not.be.null;
                expect(payload).to.have.property('review');
                expect(payload).to.have.property('cards');

                expect(payload.review).to.equal(testReview + i);
            }

            // Expect that all players have gone
            const playersGone = lobby.gameMaster.playersGone;

            expect(playersGone.length).to.equal(players.length);
        });
    });
})