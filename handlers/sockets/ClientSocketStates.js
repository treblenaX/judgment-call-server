export const ClientSocketStates = {
    CONNECT_TO_LOBBY: 'client:connecttolobby',
    REFRESH_LOBBY_INFORMATION: 'client:room:refreshlobbyinformation',
    CHECK_LOBBY_READY_STATUS: 'client:room:checklobbyreadystatus',
    TOGGLE_PLAYER_READY: 'client:toggleplayerready',
    CARDS_DEALT: 'client:cardsdealt',
    SEND_REVIEW: 'client:sendreview'
} // @TODO: fix lobby ready status stuff