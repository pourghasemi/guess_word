<template>
  <div class="card">{{ card.rank }} of {{ card.suit }}</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Card } from '../types/card'

export default defineComponent({
  props: {
    card: {
      type: Object as PropType<Card>,
      required: true,
    },
  },
})
</script>

<style scoped>
.card {
  border: 1px solid #333;
  padding: 10px;
  margin: 5px;
  text-align: center;
  width: 60px;
}
</style>
