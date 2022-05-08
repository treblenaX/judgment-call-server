export const ServerSocketStates = {
    ERROR: 'server:error',
    PLAYER_CONNECTED_TO_LOBBY: 'server:playerconnectedtolobby',

    /** Room Socket States */
    UPDATE_LOBBY_INFORMATION: 'server:room:updatelobbyinformation',
    ALL_PLAYERS_READY: 'server:room:allplayersready',
    STOP_COUNTDOWN: 'server:room:stopcountdown',
    START_DEAL: 'server:room:startdeal',
    DIRECT_TO_DISCUSSION: 'server:room:directtodiscussion',
    START_DISCUSSION_TURN: 'server:room:startdiscussionturn',
    START_MITIGATION: 'server:room:startmitigation',
    START_JUDGMENT_CALL: 'server:room:startjudgmentcall',
    START_SUMMARY: 'server:room:startsummary'
}