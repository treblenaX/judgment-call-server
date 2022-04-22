import Logger from "js-logger";

let activeTimers = [];

export class TimerHandler {
    static setTimer(callback, ms, lobbyCode) {
        // Verify that `activeTimers` is not undefined
        this.verifyTimerArray();

        // Create timer
        const timer = setTimeout(callback, ms);

        // Store the timer
        this.storeTimer(lobbyCode, timer);
    }

    static storeTimer(lobbyCode, timer) {
        // Build object
        const object = {
            timer: timer,
            lobbyCode: lobbyCode
        };
        
        // Add to active timers
        this.activeTimers.push(object);
    }

    static deleteTimer(lobbyCode) {
        const index = this.activeTimers.findIndex((obj) => obj.lobbyCode === lobbyCode);

        if (index != -1) {  // If the object still exists
            // Stop interval
            const timer = this.activeTimers[index].timer;
            clearTimeout(timer);
    
            // Delete the timer object
            return this.activeTimers.splice(index, 1)[0];
        }

        return new Error('Failed to delete timer.');
    }

    static verifyTimerArray = () => (!this.activeTimers) ? this.activeTimers = [] : this.activeTimers;
}