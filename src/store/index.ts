import { createStore } from 'vuex'
import { GameState, Player } from '../types/game'

const initialState: GameState = {
  deck: [], // Initialize with a shuffled deck
  players: [],
  communityCards: [],
  currentPlayerIndex: 0,
}

export default createStore({
  state: initialState,
  mutations: {
    setPlayers(state, players: Player[]) {
      state.players = players
    },
    // Add more mutations for game actions like dealing cards, betting, etc.
  },
})
