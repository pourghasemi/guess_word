<template>
  <div class="mt-8">
    <span v-if="game?.category"> {{ categories[Number(game?.category)-1].name }}</span>
    <div v-if="currentUser === game?.player2 && !game.selectedWord" id="message" class="message-text">
      Please wait while player1 select a word
    </div>
    <h2 v-if="currentUser === game?.player2 && props.player1 && game.selectedWord">Guess My Selected Word</h2>
    <div v-if="game && currentUser && !game.winner">
      <b v-if="game.player1 === currentUser && !game.selectedWord" class="text-xl">You are Player 1, select a word:</b>
      <br/>
      <p v-if="game.player1 === currentUser && game.selectedWord">Answer the questions</p>

    <div class=" max-w-sm mx-auto" v-if="game.player1 === currentUser && !game.selectedWord">
    <div class=" max-w-sm mx-auto">
      <label for="countries" class="block mb-2 text-sm font-medium text-white">Select an option</label>
      <select v-model="game.category" id="countries" class="max-h-16 overflow-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option value="" selected>Choose a category</option>
        <option :value="item.id" v-for="item of categories">{{ item.name }}</option>
      </select>
    </div>

      <input
        v-model="selectedWord"
        class="my-4 max-h-16 overflow-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        @keyup.enter="setWord"
        placeholder="Enter a word"
      />
      <div>
        <button @click="setWord">Start</button>

      </div>
    </div>
      <template v-if="game.selectedWord">
        --{{ formattedTime }}
        <p v-if="game.player2 === currentUser">
          You are Player 2, ask a question ({{ 20 - game.questionCount }} left):
        </p>
        <input
          v-if="game.player2 === currentUser && game.questionCount < 20"
          v-model="question"
          @keyup.enter="askQuestion"
          placeholder="Enter your question"
          class="rounded min-w-0 grow py-1.5 pl-1 pr-3 my-8 text-base text-gray-100 bg-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"

        />

        <div v-if="game.questions.length">
          <h3>Questions and Answers:</h3>
          <ul>
            <li v-for="(q, index) in game.questions" :key="index">
              {{ q.question }} -
              <strong>{{
                q.response || (game.player1 === currentUser ? 'Respond' : 'Waiting for response')
              }}</strong>
              <button
                v-if="game.player1 === currentUser && !q.response"
                @click="respond(index, 'Yes')"
              >
                Yes
              </button>
              <button
                v-if="game.player1 === currentUser && !q.response"
                @click="respond(index, 'No')"
              >
                No
              </button>
            </li>
          </ul>
        </div>
        <button @click="deleteGame" class="absolute bottom-0 left-0 m-8 p-4">End Game</button>

      </template>

      
    </div>
    <template v-if="game?.winner && game?.selectedWord">
      <p>{{ game.winner }} has won!</p>
      <button @click="deleteGame">Start new Game</button>
    </template>
    <div v-if="showAlert" id="toast-warning" class="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
          </svg>
          <span class="sr-only">Warning icon</span>
      </div>
      <div class="ms-3 text-sm font-normal">Please select a category</div>
      <button @click="showAlert = false" type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
          <span class="sr-only">Close</span>
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
      </button>
  </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { database, auth } from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore'

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
// Define props with types
const props = defineProps<{
  player1: string,
  player2: string,
  gameId: string
}>()

const emit = defineEmits(['resetGame'])

type Response = "Yes" | "No" | null
type Question = { question: string, response: Response }
type Game = { questions: Question[], questionCount: number, category: string, selectedWord: string, player1: string, player2: string, winner: string | null }

// Firestore document reference
const gameRef = doc(database, 'games', props.gameId)
const selectedWord = ref<string>('')
const question = ref<string>('')
const game = ref<Game | null>(null)
const currentUser = ref<string | null>(null)
const showAlert = ref(false);
const timeLeft = ref(300); // 5 minutes in seconds
const interval = ref<NodeJS.Timeout | null>(null);
const gameOver = ref(false);

// Watch for changes in props and set player roles
watch([() => props.player1, () => props.player2], async() => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    try{
      await setDoc(gameRef, {
          player1: props.player1,
          player2: props.player2,
          category: '',
          selectedWord: game.value?.selectedWord || '',
          questions: game.value?.questions || [],
          questionCount: game.value?.questionCount || 0,
          winner: null,
          timeLeft:game.value?.timeLeft || 300
        })
    }catch(error) {
      console.log(error);
    }
  }
})

watch([() => game.value?.player1, () => game.value?.player2], async() => {
  if (!game.value?.player1 && !game.value?.player2) {
    await emit('resetGame', {val1:null, val2: null} as {val1: string | null, val2: string | null});
  }
  else{
    await emit('resetGame', {val1:game.value?.player1, val2: game.value?.player2} as {val1: string | null, val2: string | null});
  }
})

const unsubscribe = onSnapshot(gameRef, snapshot => {
    const data = snapshot.data()
    if (data) {
      game.value = data as Game
      if (
        game.value.selectedWord &&
        game.value.questions.some(
          q => q.response === 'Yes' && q.question === game.value?.selectedWord,
        )
      ) {
        game.value.winner = game.value.player2;
      }
    }
  })

// Fetch game data on component mount
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    const gameSnapshot = await getDoc(gameRef)
    if (gameSnapshot.exists()) {
      game.value = gameSnapshot.data() as Game
      console.log('game: ', game);
    } else {
      await setDoc(gameRef, {
        player1: props.player1,
        player2: props.player2,
        category: '',
        selectedWord: '',
        questions: [],
        questionCount: 0,
        timeLeft:300
      })
    }
  }

  onUnmounted(() => {
    unsubscribe();
  })
})

onUnmounted(() => {
  // clearInterval(interval?.value);
  if(!game.value.player1 || !game.value.player2){
    deleteGame();
  }
})

const setWord = async () => {
  if (selectedWord.value && game.value) {
    if(game.value.category){
    await updateDoc(gameRef, { selectedWord: selectedWord.value })
    selectedWord.value = ''
    interval.value = setInterval(async ()=>{
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
        await updateDoc(gameRef, { timeLeft: timeLeft.value })
      } else {
        if (interval.value !== null) {
          clearInterval(interval.value);
        }
        deleteGame();
      }
    }, 1000)
    }else{
      showAlert.value = true;
      setTimeout(() => {
        showAlert.value = false;
      }, 5000);
    }
  }
}

const formattedTime = computed(() => {
  if(game.value && game.value.timeLeft){
  const minutes = Math.floor(game.value.timeLeft / 60).toString().padStart(2, '0');
  const seconds = (game.value.timeLeft % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
  }
  return null;
});

const askQuestion = async () => {
  if (question.value && game.value && game.value.questionCount < 20) {
    await updateDoc(gameRef, {
      questions: arrayUnion({ question: question.value, response: null }),
      questionCount: game.value.questionCount + 1,
    })
    question.value = ''
    clearInterval(interval?.value);
  }
}

const respond = async (index: number, response: Response) => {
  if (game.value) {
    const updatedQuestions = [...game.value.questions]
    updatedQuestions[index].response = response
    await updateDoc(gameRef, {
      questions: updatedQuestions,
    })
    interval.value = setInterval(async ()=>{
      if (timeLeft.value > 0) {
        timeLeft.value -= 1;
        await updateDoc(gameRef, { timeLeft: timeLeft.value })
      } else {
        if (interval.value !== null) {
          clearInterval(interval.value);
        }
        deleteGame();
      }
    }, 1000)
  }
}

async function deleteGame() {
  try {
    if(game.value){
      game.value.winner = null;
      // Delete the document
      // await deleteDoc(gameRef);
      await updateDoc(gameRef, {
        player1: null,
        player2: null,
        category: '',
        selectedWord: '',
        questions: [],
        questionCount: 0,
        winner: null,
        timeLeft:300
      })
      await emit('resetGame');
      deleteDoc(gameRef);

      console.log(`Game with ID ${props.gameId} has been deleted successfully.`);
    }
  } catch (error) {
    console.error("Error deleting game:", error);
  }
}
</script>
