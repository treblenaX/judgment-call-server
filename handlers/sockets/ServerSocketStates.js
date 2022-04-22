export const ServerSocketStates = {
    ERROR: 'server:error',
    PLAYER_CONNECTED_TO_LOBBY: 'server:playerconnectedtolobby',

    /** Room Socket States */
    UPDATE_LOBBY_INFORMATION: 'server:room:updatelobbyinformation',
    ALL_PLAYERS_READY: 'server:room:allplayersready',
    STOP_COUNTDOWN: 'server:room:stopcountdown',
    START_DEAL: 'server:room:startdeal',
    DEALT_CARDS: 'server:room:dealtcards',
}