import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';
import { GameStates } from '../constants/GameStates.js';
import { LobbyHandler } from './LobbyHandler.js';
import { PlayerHandler } from './PlayerHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class GameHandler {
    /** Public functions */
    static async createGame() {
        const gameMaster = {
            state: GameStates.INIT,
            gameFiles: await this.loadGameFiles()
        }

        return gameMaster;
    }

    static changeGameState(gameMaster, state) {
        gameMaster.state = state;
    }

    static dealCards(lobby) {
        // Init variables
        const gameMaster = lobby.gameMaster;
        const players = lobby.players;

        // Change the game state to review
        gameMaster.state = GameStates.REVIEW;
        
        // Choose the scenario and parse info
        const scenarioInfo = this.chooseScenario(gameMaster.gameFiles);
        gameMaster.scenario = {
            name: scenarioInfo.name,
            description: scenarioInfo.description
        };

        // Reset the gameMaster copy of stakeholders to match the scenario
        gameMaster.gameFiles.stakeholders = scenarioInfo.stakeholders;

        // Draw a card for each player
        const drawnSHArr = this.drawCard(gameMaster.gameFiles.stakeholders, players.length);
        const drawnPArr = this.drawCard(gameMaster.gameFiles.principles, players.length);
        const drawnRArr = this.drawCard(gameMaster.gameFiles.ratings, players.length);

        // Distribute the cards to each player
        for (let i = 0; i < players.length; i++) {
            players[i].cards = {
                stakeholder: drawnSHArr[i],
                principle: drawnPArr[i],
                rating: drawnRArr[i],
                scenario: scenarioInfo
            };
        }
    }
    
    static dealDiscussionTurn(lobby) {
        // Init variables
        const gameMaster = lobby.gameMaster;
        const players = lobby.players;

        // Set the game state to 'DISCUSSION'
        gameMaster.state = GameStates.DISCUSS;

        // Init playersGone array to keep track of players who have gone. 
        if (!gameMaster.playersGone) gameMaster.playersGone = [];

        const playersGone = gameMaster.playersGone;

        // Add a focus window on who's being discussed
        gameMaster.focusPlayer = {};

        if (gameMaster.playersGone.length == players.length) { // Everyone has gone
            return true;
        } else {
            // Choose player who hasn't gone yet
            const player = players.find(player => !playersGone.includes(player.pId));

            // Error guard
            if (!player) throw new Error('Can\'t find player who hasn\'t gone.');

            // Compile info if player who hasn't gone
            const review = player.data.review;
            const cards = player.cards;

            // Mark that the player has gone
            playersGone.push(player.pId);

            // Update the focus player window
            gameMaster.focusPlayer = {
                pId: player.pId,
                stakeholder: cards.stakeholder,
                review: review,
                rating: cards.rating,
                data: {
                    benefits: [],
                    harms: [],
                    themes: []
                }
            };

            return false;
        }
    }

    static savePlayerDiscussionData(lobby) {
        const focusPlayer = lobby.gameMaster.focusPlayer;
        const players = lobby.players;

        const player = PlayerHandler.getPlayer(players, focusPlayer.pId);
        // Save the discussion data
        player.data.discussion = focusPlayer.data;
        // player.data.discussion = {
        //     benefits: [
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //     ],
        //     harms: [
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //     ],
        //     themes: [
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec finibus. ',
        //     ]
        // };
    }

    static isDoneDiscuss = (lobby) => {
        const players = lobby.players;
        const playersGone = lobby.gameMaster.playersGone;

        return players.length == playersGone.length;
    }

    static dealMitigation(lobby) {
        // Init variables
        const gameMaster = lobby.gameMaster;

        // Change the state
        gameMaster.state = GameStates.MITIGATION;
    }

    static dealJudgment(lobby) {
        // Init variables
        const gameMaster = lobby.gameMaster;

        // Change the state
        gameMaster.state = GameStates.JUDGMENT_CALL;
    }

    static dealSummary(lobby) {
        // Init variables
        const gameMaster = lobby.gameMaster;
        // Change the state
        gameMaster.state = GameStates.OUTPUT;
    }

    /** Deal helpers */
    static chooseScenario(gameFiles) {
        const scenarios = gameFiles.scenarios;
        const index = this.randomizeIndex(scenarios.length);
        const scenario = scenarios[index];

        return {
            name: scenario.name,
            description: scenario.description,
            stakeholders: this.findStakeholders(gameFiles, scenario.stakeholdersMap)
        }
    }

    static findStakeholders(gameFiles, stakeholderMap) {
        const stakeholders = gameFiles.stakeholders;
        const results = [];

        for (let i = 0; i < stakeholderMap.length; i++) {
            const index = stakeholderMap[i];
            results.push(stakeholders[index]);
        }

        return results;
    }

    static chooseCard(files, chosenArr) {
        const length = this.files.length;
        const index = this.randomizeIndex(length);
        
        // Check to see if the index is already chosen
        while (chosenArr.includes(index)) {
            index = this.randomizeIndex(length);
        }

        return files[index];
    }

    static drawCard(choices, playerCount) {
        const drawnArr = [];

        for (let i = 0; i < playerCount; i++) {
            // Draw the card
            let index = this.randomizeIndex(choices.length);
            const card = choices[index];

            // Discard the card from the deck
            choices.splice(index, 1);

            drawnArr.push(card);
        }

        return drawnArr;
    }

    /** Review helpers */

    /** Base helpers */
    static resetPlayerReady(lobby) {
        const players = lobby.players;
        for (let i = 0; i < players.length; i++) {
            players[i].readyState = false;
        }
    }

    /** Private function helpers */
    static randomizeIndex = (length) => {
        // const numberHolder = []; - in case we need to choose multiple
        const ceiling = length * 4;
        const randomNum = Math.floor(Math.random() * ceiling);

        // If randomNum = ceiling then drop it down to prevent error
        if (randomNum === ceiling) randomNum = ceiling - 1;

        // Determine scenario number
        const choice = randomNum / 4; 

        //if (!numberHolder.includes(choice)) numberHolder.push(choice);
        return Math.floor(choice);
    }

    static loadGameFiles = async () => JSON.parse(await fs.readFile(__dirname + '/../public/json/game-files.json'));
}