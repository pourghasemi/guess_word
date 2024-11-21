<template>
  <div class="player-hand">
    <h3>{{ player.name }}</h3>
    <div class="hand">
      <Card
        v-for="card in player.hand"
        :key="card.rank + card.suit"
        :card="card"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import Card from './Card.vue'
import { Player } from '../types/game'

export default defineComponent({
  components: { Card },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
})
</script>

<style scoped>
.player-hand {
  margin: 10px;
}

.hand {
  display: flex;
}
</style>
