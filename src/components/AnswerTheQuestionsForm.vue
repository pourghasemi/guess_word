<template>
    <!-- Separate Box for Player 1's Response -->
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white px-4" v-if="game?.questions">

    <div class="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg text-center text-white">
        <h2 class="text-3xl font-extrabold mb-4">Answer the Question</h2>
        <div class="bg-blue-500 py-2 px-4 rounded-full mb-6 text-lg font-semibold" @click="toggle = !toggle">
          <span v-if="!toggle">Category: {{ props.game?.category }}</span>
          <span v-if="toggle">{{ props.game?.selectedWord}}</span>
        </div>
        <template v-if="game.questions.length && game.questions[game.questions.length - 1].response === null">
        <div  class="mb-4">
          <p class="text-lg font-semibold">Q{{ game.questions.length }}: {{ game.questions[game.questions.length - 1].question }}</p>
        </div>
        <div class="flex items-center justify-center space-x-4 mb-4">
          <button
            @click="answerQuestion('Yes')"
            class="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full py-3 px-6 transition-transform transform hover:scale-110"
          >
            Yes
          </button>
          <button
            @click="answerQuestion('No')"
            class="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full py-3 px-6 transition-transform transform hover:scale-110"
          >
            No
          </button>
        </div>
    </template>
    </div>
    <div class="mb-6">
      <h2 class="text-2xl font-semibold mb-2">Questions:<small>({{ 20 - (game.questionCount || 0) }} Questions left)</small></h2>
      <ul v-if="game.questions?.length" class="space-y-2 max-h-56 overflow-y-auto">
        <li
          v-for="(entry, index) in game.questions"
          :key="index"
          class="bg-gray-800 p-3 rounded-lg flex justify-between items-center transition-transform transform hover:scale-105"
        >
          <span class="flex-1">Q{{ index + 1 }}: {{ entry.question }}</span>
          <span v-if="entry.response" :class="entry.response === 'Yes' ? 'text-green-400' : 'text-red-400'" class="font-bold">
            {{ entry.response }}
          </span>
          <span v-else class="loader">
          </span>
        </li>
      </ul>
    </div>


</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
  import { database } from '../config/firebase'
  import {
    doc,
    updateDoc,
  } from 'firebase/firestore'
import type { GameType, ResponseType } from '../types/types'

 const props = defineProps<{
    game: GameType | null,
    gameId: string
  }>()

  const emit = defineEmits(['deleteGame'])

  const gameRef = doc(database, 'games', props.gameId);
const toggle = ref(false);

 const answerQuestion = async (response: ResponseType) => {
  if (props.game) {
    const updatedQuestions = [...props.game.questions]
    updatedQuestions[props.game.questions.length-1].response = response
    await updateDoc(gameRef, {
      questions: updatedQuestions,
    })
  }
 };
</script>