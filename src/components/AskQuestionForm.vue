<template>
    <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white px-4" v-if="game">
      <div class="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg text-center mb-6">
        <h1 class="text-4xl font-extrabold mb-6">🎉 20 Questions Game 🎉</h1>
        <!-- Category Display -->
      <div class="bg-blue-500 py-2 px-4 rounded-full mb-6 text-lg font-semibold">
        Category: {{ props.game?.category }}
      </div>
        <div class="mb-6" v-if="game.questions.length === 0 || (game.questions[game.questions.length-1].response)">
          <p class="text-lg font-light mb-4">I'll guess it with yes/no questions!</p>
          <div class="flex items-center justify-center space-x-4">
            <input
              type="text"
              v-model="currentQuestion"
              @keyup.enter="submitQuestion"
              placeholder="Ask a yes/no question..."
              class="bg-gray-700 border border-gray-600 rounded-full text-center text-lg py-3 px-5 focus:outline-none focus:ring-4 focus:ring-pink-400 transition-transform transform hover:scale-110"
            />
            <button
              @click="submitQuestion"
              class="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full py-3 px-6 transition-transform transform hover:scale-110"
            >
              Ask
            </button>
          </div>
        </div>
        <div v-else class="text-center mt-4 font-semibold">
          Waiting for Player 1 to answer...
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
  
      <!-- Separate Box for Final Guess -->
      <div class="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg text-center">
        <h2 class="text-3xl font-extrabold mb-4">Final Guess</h2>
        <div class="flex items-center justify-center space-x-4 mb-4">
          <input
            type="text"
            v-model="finalGuess"
            placeholder="Enter your guess..."
            class="bg-gray-700 border border-gray-600 rounded-full text-center text-lg py-3 px-5 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-transform transform hover:scale-110 animate-pulse"
          />
          <button
            @click="submitGuess"
            class="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full py-3 px-6 transition-transform transform hover:scale-110 animate-pulse"
          >
            Submit
          </button>
        </div>
        <div v-if="guessResult" class="text-center mt-4 font-semibold">
          {{ guessResult }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { database } from '../config/firebase'
  import {
    doc,
    updateDoc,
    arrayUnion,
  } from 'firebase/firestore'
import { GameType } from '../types/types';

  const props = defineProps<{
    game: GameType | null,
    gameId: string
  }>()


  const gameRef = doc(database, 'games', props.gameId);
  const currentQuestion = ref('');
  const questions = ref([]);
  const finalGuess = ref('');
  const guessResult = ref('');


  const submitQuestion = async () => {
    if (currentQuestion.value.trim() === '' || questions.value.length >= 20) return;
    if (currentQuestion.value && props.game && props.game.questionCount < 20) {
        await updateDoc(gameRef, {
        questions: arrayUnion({ question: currentQuestion.value, response: null }),
        questionCount: props.game.questionCount + 1,
        })
        currentQuestion.value = ''
    }  
  };
  
  const submitGuess = async() => {
    if (finalGuess.value.trim() === '') return;
  
    const correctAnswer = props.game?.selectedWord;
    if (correctAnswer && finalGuess.value.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      guessResult.value = "Correct! You've guessed it! 🎉";
      props.game.winner = props.game.player2
      await updateDoc(gameRef, {
        winner: props.game.player2
        })
    } else {
      guessResult.value = "Oops! That's not correct. Try again!";
      finalGuess.value = '';
    }
  };


  </script>
  
  <style>
  .loader {
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top: 4px solid #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>