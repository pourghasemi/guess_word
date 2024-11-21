<template>
  <div>
    <h2>Guess My Selected Word</h2>
    <div v-if="game && currentUser">
      <p v-if="isPlayer1">You are Player 1, select a word:</p>
      <input
        v-if="isPlayer1 && !game.selectedWord"
        v-model="selectedWord"
        @keyup.enter="setWord"
        placeholder="Enter a word"
      />

      <template v-if="game.selectedWord">
        <p v-if="isPlayer2">
          You are Player 2, ask a question ({{ 20 - game.questionCount }} left):
        </p>
        <input
          v-if="isPlayer2 && game.questionCount < 20"
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
                q.response || (isPlayer1 ? 'Respond' : 'Waiting for response')
              }}</strong>
              <button
                v-if="isPlayer1 && !q.response"
                @click="respond(index, 'Yes')"
              >
                Yes
              </button>
              <button
                v-if="isPlayer1 && !q.response"
                @click="respond(index, 'No')"
              >
                No
              </button>
            </li>
          </ul>
        </div>
      </template>

      <p v-if="winner">{{ winner }} has won!</p>
    </div>
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
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore'

// Define props with types
const props = defineProps<{
  player1: string,
  player2: string,
  gameId: string
}>()

type Response = "Yes" | "No" | null
type Question = { question: string, response: Response }
type Game = { questions: Question[], questionCount: number, selectedWord: string }

// Firestore document reference
const gameRef = doc(database, 'games', props.gameId)
const selectedWord = ref<string>('')
const question = ref<string>('')
const game = ref<Game | null>(null)
const currentUser = ref<string | null>(null)
const winner = ref<string>('')

// Identify player based on props
const isPlayer1 = ref(false)
const isPlayer2 = ref(false)

// Watch for changes in props and set player roles
watch([() => props.player1, () => props.player2], () => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    isPlayer1.value = user.uid === props.player1
    isPlayer2.value = user.uid === props.player2
  }
})

// Fetch game data on component mount
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    isPlayer1.value = user.uid === props.player1
    isPlayer2.value = user.uid === props.player2

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
        winner.value = 'Player 2'
      }
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
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
</script>
