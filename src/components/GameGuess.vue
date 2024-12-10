<template>
  <div class="mt-8">
    <div v-if="currentUser === game?.player2 && !game.selectedWord" id="message" class="message-text">
      Please wait while I select a word
    </div>
    <h2 v-if="currentUser === game?.player2 && props.player1">Guess My Selected Word</h2>
    <div v-if="game && currentUser && !game.winner">
      <b v-if="game.player1 === currentUser && !game.selectedWord" class="text-xl">You are Player 1, select a word:</b>
      <br/>
      <p v-if="game.player1 === currentUser && game.selectedWord">Answer the questions</p>

      <input
        v-if="game.player1 === currentUser && !game.selectedWord"
        v-model="selectedWord"
        class="rounded min-w-0 grow py-1.5 pl-1 pr-3 my-8 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
        @keyup.enter="setWord"
        placeholder="Enter a word"
      />
      <template v-if="game.selectedWord">
        <p v-if="game.player2 === currentUser">
          You are Player 2, ask a question ({{ 20 - game.questionCount }} left):
        </p>
        <input
          v-if="game.player2 === currentUser && game.questionCount < 20"
          v-model="question"
          @keyup.enter="askQuestion"
          placeholder="Enter your question"
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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
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

// Define props with types
const props = defineProps<{
  player1: string,
  player2: string,
  gameId: string
}>()

const emit = defineEmits(['resetGame'])

type Response = "Yes" | "No" | null
type Question = { question: string, response: Response }
type Game = { questions: Question[], questionCount: number, selectedWord: string, player1: string, player2: string, winner: string | null }

// Firestore document reference
const gameRef = doc(database, 'games', props.gameId)
const selectedWord = ref<string>('')
const question = ref<string>('')
const game = ref<Game | null>(null)
const currentUser = ref<string | null>(null)

// Watch for changes in props and set player roles
watch([() => props.player1, () => props.player2], async() => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    await setDoc(gameRef, {
        player1: props.player1,
        player2: props.player2,
        selectedWord: '',
        questions: [],
        questionCount: 0,
        winner: null
      })
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
        selectedWord: '',
        questions: [],
        questionCount: 0,
      })
    }
  }

  onUnmounted(() => {
    unsubscribe();
  })
})

onUnmounted(() => {
  deleteGame();
})

const setWord = async () => {
  if (selectedWord.value && game.value) {
    await updateDoc(gameRef, { selectedWord: selectedWord.value })
    selectedWord.value = ''
  }
}

const askQuestion = async () => {
  if (question.value && game.value && game.value.questionCount < 20) {
    await updateDoc(gameRef, {
      questions: arrayUnion({ question: question.value, response: null }),
      questionCount: game.value.questionCount + 1,
    })
    question.value = ''
  }
}

const respond = async (index: number, response: Response) => {
  if (game.value) {
    const updatedQuestions = [...game.value.questions]
    updatedQuestions[index].response = response
    await updateDoc(gameRef, {
      questions: updatedQuestions,
    })
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
        selectedWord: '',
        questions: [],
        questionCount: 0,
        winner: null
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
