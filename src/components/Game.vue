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

<script setup>
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

// Define props for player1 and player2
const props = defineProps({
  player1: String,
  player2: String,
  gameId: Number,
})

const gameRef = doc(database, 'games', props.gameId)
const selectedWord = ref('')
const question = ref('')
const game = ref(null)
const currentUser = ref(null)
const winner = ref('')

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
    if (user) {
      currentUser.value = user.uid
      isPlayer1.value = user.uid === props.player1
      isPlayer2.value = user.uid === props.player2
    }
    const gameSnapshot = await getDoc(gameRef)
    if (gameSnapshot.exists()) {
      game.value = gameSnapshot.data()
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
    game.value = snapshot.data()
    if (
      game.value.selectedWord &&
      game.value.questions.some(
        q => q.response === 'Yes' && q.question === game.value.selectedWord,
      )
    ) {
      winner.value = 'Player 2'
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

const setWord = async () => {
  if (selectedWord.value) {
    await updateDoc(gameRef, { selectedWord: selectedWord.value })
    selectedWord.value = ''
  }
}

const askQuestion = async () => {
  if (question.value && game.value.questionCount < 20) {
    await updateDoc(gameRef, {
      questions: arrayUnion({ question: question.value, response: null }),
      questionCount: game.value.questionCount + 1,
    })
    question.value = ''
  }
}

const respond = async (index, response) => {
  const updatedQuestions = [...game.value.questions]
  updatedQuestions[index].response = response
  await updateDoc(gameRef, {
    questions: updatedQuestions,
  })
}
</script>
