import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GameStates = {
    INIT: 'INIT',
    DEAL: 'DEAL',
    REVIEW: 'REVIEW',
    DISCUSS: 'DISCUSS',
    MITIGATION: 'MITIGATION',
    JUDGMENT_CALL: 'JUDGMENT CALL',
    OUTPUT: 'OUTPUT'
}

export class GameHandler {
    static createGame(lobby) {
        const gameMaster = lobby.gameMaster;

        // Init state
        gameMaster.state = GameStates.INIT;
    }

    static async chooseScenario() {
        this.verifyGameFilesLoaded();

        const scenarios = this.gameFiles.scenarios;

        
    }

    static async dealCards(lobby) {
        this.verifyGameFilesLoaded();
        // 
    }
    
    static async verifyGameFilesLoaded() {
        if (!this.gameFiles) {
            this.gameFiles = await loadGameFiles();
        }
    }

    static loadGameFiles = async () => JSON.parse(await fs.readFile('../json/game-files.json'));
}