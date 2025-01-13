<template>
  <div class=" relative">
    <div v-if="currentUser === game?.player2?.id && !game.selectedWord" id="message" class="message-text">
      Please wait while player1 select a word
    </div>
    <div v-if="game && currentUser && !game?.winner">
      <template v-if="game.player1?.id === currentUser && !game.selectedWord">
      <b class="text-xl">You are Player 1, select a word:</b>
      <SelectWordForm 
        :game="game"
        :gameId="gameId"
      />
      </template>
      <template v-if="game.selectedWord">
        <div class="bg-gray-100 inline-block p-4 absolute left-0">
          <b class="text-green-500">{{ formattedTime }}</b> time left.
        </div>

        <AskQuestionForm v-if="game.player2.id === currentUser" :game="game" :gameId="gameId"/>

        <div v-if="game.player1.id === currentUser && game.selectedWord ">
          <AnswerTheQuestionsForm :game="game" :gameId="gameId" @deleteGame="deleteGame"/>
        </div>

        <button @click="deleteGame" class="absolute bottom-0 left-0 m-8 p-4">End Game</button>

      </template>
    </div>
    <WinnerMessage v-if="game?.winner && game?.selectedWord" :winnerName="game?.winner.name" @clickEvent="deleteGame"/>
    <GameOver v-if="!game?.timeLeft && game?.selectedWord" @startNewGame="deleteGame"/>
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
  onSnapshot,
} from 'firebase/firestore'
import WinnerMessage from './WinnerMessage.vue'
import AskQuestionForm from './AskQuestionForm.vue'
import AnswerTheQuestionsForm from './AnswerTheQuestionsForm.vue'
import SelectWordForm from './SelectWordForm.vue'
import GameOver from './GameOver.vue'
import { User, GameType} from '../types/types'


// Define props with types
const props = defineProps<{
  player1: User | null,
  player2: User | null,
  gameId: string
}>()

const emit = defineEmits(['resetGame'])


// Firestore document reference
const gameRef = doc(database, 'games', props.gameId)
const game = ref<GameType | null>(null)
const currentUser = ref<string | null>(null)
const interval = ref<NodeJS.Timeout | null>(null);

// Watch for changes in props and set player roles
watch([() => props.player1, () => props.player2], async() => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    try{
      await setDoc(gameRef, {
          player1: props.player1,
          player2: props.player2,
          category: game.value?.category || '',
          selectedWord: game.value?.selectedWord || '',
          questions: game.value?.questions || [],
          questionCount: game.value?.questionCount || 0,
          winner: null,
          timeLeft:game.value?.timeLeft || 300 // 5 minutes in seconds
        })
    }catch(error) {
      console.log(error);
    }
  }
})

//if one of the player leave the game this watch will run.
watch([() => game.value?.player1?.id, () => game.value?.player2?.id], async() => {
  if (!game.value?.player1 && !game.value?.player2) {
    await emit('resetGame', {user1:null, user2: null});
  }
  else{
    await emit('resetGame', {user1:game.value?.player1, user2: game.value?.player2});
  }
})

watch([() => game.value?.selectedWord], ()=> {
  if(game.value?.selectedWord){
    if(interval.value){
    clearInterval(interval.value);
    interval.value = null;
  }
  startTimer();
  }
})

const unsubscribe = onSnapshot(gameRef, snapshot => {
    const data = snapshot.data()
    if (data) {
      game.value = data as GameType
    }
  })

// Fetch game data on component mount
onMounted(async () => {
  const user = auth.currentUser
  if (user) {
    currentUser.value = user.uid
    const gameSnapshot = await getDoc(gameRef)
    if (gameSnapshot.exists()) {
      game.value = gameSnapshot.data() as GameType
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
  if(!game.value?.player1 || !game.value?.player2){
    deleteGame();
  }
})

const startTimer = async () => {
  interval.value = setInterval(async ()=> {
    if (game.value?.timeLeft && game.value?.timeLeft > 0) {
      await updateDoc(gameRef, { timeLeft: game.value.timeLeft -1 })
    } else if (interval.value !== null) {
        clearInterval(interval.value);
    }
  }, 1000)
}

const formattedTime = computed(() => {
  if(game.value && game.value.timeLeft){
  const minutes = Math.floor(game.value.timeLeft / 60).toString().padStart(2, '0');
  const seconds = (game.value.timeLeft % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
  }
  return null;
});

async function deleteGame() {
  try {
    if(game.value){
      game.value.winner = null;
      if(interval.value){
        clearInterval(interval.value);
        interval.value = null;
      }
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
      await emit('resetGame',{user1: null, user2: null});
      deleteDoc(gameRef);
      console.log(`Game with ID ${props.gameId} has been deleted successfully.`);
    }
  } catch (error) {
    console.error("Error deleting game:", error);
  }
}
</script>
