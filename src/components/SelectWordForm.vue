<template>
    <div class="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-lg text-white text-center mt-6">
        <h2 class="text-3xl font-extrabold mb-4">Set Word</h2>
        <div class="mb-4">
          <select v-model="selectedCategory" class="bg-gray-700 border border-gray-600 w-full rounded-full text-lg py-3 px-5">
            <option disabled value="">Select a category</option>
            <option v-for="item in categories" :key="item.id">{{ item.name }}</option>
          </select>
        </div>
        <div class="flex items-center justify-center space-x-4 mb-4">
          <input
            type="text"
            v-model="selectedWord"
            placeholder="Enter a word..."
            class="bg-gray-700 border w-full border-gray-600 rounded-full text-center text-lg py-3 px-5 focus:outline-none focus:ring-4 focus:ring-blue-400 transition-transform transform hover:scale-110"
          />
        </div>
        <div class="flex items-center justify-center space-x-4 mb-4">
          <button
            @click="submitWord"
            class="bg-blue-500 w-full hover:bg-blue-600 text-white font-bold rounded-full py-3 px-6 transition-transform transform hover:scale-110"
          >
            Submit
          </button>
        </div>
        <WarningAlert v-if="showAlert" :showAlert="showAlert" message="Please select a category" @closeAlert="showAlert = false" />

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { database } from '../config/firebase'
  import {
    doc,
    updateDoc,
  } from 'firebase/firestore'
import WarningAlert from './WarningAlert.vue'
import { GameType } from '../types/types'

const categories = [
  {
    name: 'Food and Drinks',
    id: '1'
  },{
    name: 'Cities and Countries',
    id: '2'
  },{
    name: 'Animals',
    id: '3'
  },{
    name: 'Professions',
    id: '4'
  },{
    name: 'Movies',
    id: '5'
  },{
    name: 'TV Shows',
    id: '6'
  },{
    name: 'Books',
    id: '7'
  },{
    name: 'Technology and Software',
    id: '8'
  },{
    name: 'Space and Astronomy',
    id: '9'
  },{
    name: 'Natural Landmarks',
    id: '10'
  },{
    name: 'Famous Athletes',
    id: '11'
  },{
    name: 'Sports',
    id: '12'
  },{
    name: 'Person',
    id: '13'
  },{
    name: 'Famous person',
    id: '14'
  }
]


const props = defineProps<{
    game: GameType | null,
    gameId: string
}>()

const gameRef = doc(database, 'games', props.gameId);

const selectedCategory = ref<string>('')
const selectedWord = ref<string>('')
const showAlert = ref(false);

const submitWord = async () => {
  if (selectedWord.value) {
    if(selectedCategory.value){
    await updateDoc(gameRef, { selectedWord: selectedWord.value, category: selectedCategory.value })    
    }else{
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 5000);
    }
  }
}

</script>