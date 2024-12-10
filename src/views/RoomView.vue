<template>
  <div class="min-h-screen	text-white">
    <span @click="leaveRoom" class="mx-2 cursor-pointer text-red-500 absolute bottom-0 right-0 m-8 p-4 hover:bg-red-700 hover:text-white rounded">leave room</span>

    <div v-if="users.length">
      <h2>Room: {{ roomId }}</h2>
      <p v-if="users.length < 2">Waiting for another player to join...</p>
      <div class="w-screen  flex h-screen">
        <div class="flex-1 h-full">
          
<videoCall/>

        </div>
        <div class="flex-1 bg-gray-500 h-full"> <template v-if="users.length == 2">
          <!-- <template> -->
            <div v-if="player1 === null">
              <h2 class="text-xl py-10">Who want to start?</h2>
              <button  @click="player1 = users[0]; player2 = users[1]; start='true'" class="mx-2">{{ users[0].name }}</button>
              <button @click="player1 = users[1]; player2 = users[0]; start='true'" class="mx-2">{{ users[1].name }}</button>
            </div>
            <Game
              :player1="player1?.id || ''"
              :player2="player2?.id || ''"
              :gameId="roomId"
              @resetGame="resetGame"
            />
          </template>
        </div>
      </div>
     
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { database, auth } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { useRoute } from 'vue-router';
import Game from '../components/GameGuess.vue';
import videoCall from '../components/videoCall.vue';
// Define a type for user
interface User {
  id: string;
  name: string;
}

const route = useRoute();
const roomId = route.params.id as string; // Ensure roomId is a string
const users = ref<User[]>([]); // Explicitly type the users ref
const player1= ref<User | null>(null);
const player2= ref<User | null>(null);
const start= ref<string | null>(null);

async function joinRoom(userId: string, userName: string) {
  const roomRef = doc(database, 'rooms', roomId);
  await setDoc(doc(roomRef, 'users', userId), {
    name: userName,
  });
}

function resetGame({val1, val2}: {val1: string | null, val2: string | null}){
  debugger;
  if(val1 !== null){
    player1.value = users.value.filter(user => user.id === val1)[0];
    player2.value = users.value.filter(user => user.id === val2)[0];
  }else{
    player1.value = null;
    player2.value = null;
    start.value = null
  }
} 

// Function to leave the room
async function leaveRoom() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    await deleteDoc(
      doc(database, `rooms/${roomId}/users`, currentUser.uid),
    );
    console.log(`User ${currentUser.uid} left room ${roomId}`);
  } catch (error) {
    console.error('Error leaving room: ', error);
  }
}

// Listen for users in the room
const usersRef = collection(database, 'rooms', roomId, 'users');

onSnapshot(usersRef, snapshot => {
  users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
});

onMounted(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(user => {
    if (user) {
      joinRoom(user.uid, user.displayName || 'Anonymous'); // Handle displayName possibly being null
    }
  });

  // Ensure cleanup of the auth listener
  onUnmounted(() => {
    unsubscribeAuth();
  });
});

onUnmounted(() => {
  leaveRoom();
});
</script>