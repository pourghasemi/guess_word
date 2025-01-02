<template>
  <div class="text-white">
    <span @click="leaveRoom" class="mx-2 cursor-pointer text-red-500 absolute bottom-0 right-0 m-8 p-4 hover:bg-red-700 hover:text-white rounded">leave room</span>

    <div v-if="users.length" class="border-double border-8 border-black bg-white m-auto mt-4 w-11/12 h-[calc(100vh-100px)] text-black">
      <h2 v-if="users.length < 2" class="pt-8">Room number: {{ roomId }}</h2>
      <span v-if="users.length < 2">Share this number with your friend so they can join this room.</span>
      <div v-if="users.length < 2" class=" absolute top-0 left-0 right-0 bottom-0 my-auto h-4">
        <div role="status">
          <svg aria-hidden="true" class=" inline-block w-8 h-8 text-blue-200 animate-spin dark:text-blue-600 fill-blue-100" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          Waiting for another player to join
        </div>
       </div>
      <div>
        <!-- <div class="flex-1 h-full">
          
        <videoCall/>

        </div> -->
        <div> <template v-if="users.length == 2">
          <!-- <template> -->
            <div v-if="player1 === null">
              <h2 class="text-xl py-10">Who want to start?</h2>
              <button 
                @click="player1 = users[0]; player2 = users[1]; start='true'"
                class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  {{ users[0].name }}
                </span>
              </button>
              <button 
                @click="player1 = users[1]; player2 = users[0]; start='true'"
                class="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                  {{ users[1].name }}
                </span>
              </button>
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
import { useRoute, useRouter } from 'vue-router';
import Game from '../components/GameGuess.vue';
// import videoCall from '../components/videoCall.vue';
// Define a type for user
interface User {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
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
    router.push({path:'/'});
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