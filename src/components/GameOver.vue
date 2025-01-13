button:

<template>
  <div class="fixed inset-0 bg-black bg-opacity-85 flex flex-col justify-center items-center text-white">
    <div class="bg-red-600 bg-opacity-90 w-full max-w-md h-48 rounded-lg shadow-xl flex flex-col justify-center items-center text-white px-8 space-y-4">
      <div class="text-4xl font-extrabold tracking-wide">
        Game Over
      </div>
      <button
        @click="startNewGame"
        class="bg-white text-red-600 font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
      >
        Start New Game
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['startNewGame']);

const startNewGame = () => {
  emit('startNewGame')
};
</script>