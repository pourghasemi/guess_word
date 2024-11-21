import { Card } from './card'

export interface Player {
  id: number
  name: string
  hand: Card[]
}

export interface GameState {
  deck: Card[]
  players: Player[]
  communityCards: Card[]
  currentPlayerIndex: number
}
