<template>
  <div class="poker-table">
    <h2>Community Cards</h2>
    <div class="community-cards">
      <Card
        v-for="card in communityCards"
        :key="card.rank + card.suit"
        :card="card"
      />
    </div>
    <div class="players">
      <PlayerHand v-for="player in players" :key="player.id" :player="player" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import PlayerHand from './PlayerHand.vue'
import Card from './Card.vue'
import { Player, Card as CardType } from '../types/game'

export default defineComponent({
  components: { PlayerHand, Card },
  props: {
    players: {
      type: Array as PropType<Player[]>,
      required: true,
    },
    communityCards: {
      type: Array as PropType<CardType[]>,
      required: true,
    },
  },
})
</script>

<style scoped>
.poker-table {
  margin: 20px;
}

.community-cards {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.players {
  display: flex;
  justify-content: space-around;
}
</style>
