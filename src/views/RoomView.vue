<template>
  <div class="text-white">
    <button @click="leaveRoom" class="mx-2 cursor-pointer text-red-500 absolute bottom-0 right-0 m-8 p-4 bg-transparent border-0 hover:text-black hover:bg-blue-500 rounded">leave room</button>

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
       <div v-if="users.length === 2">
        <Game :users="users" :roomId="roomId"/>
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
import type { Player } from '../types/game.ts';
import Game from '../components/Game.vue';



const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;
const users = ref<Player[]>([]);
const usersRef = collection(database, 'rooms', roomId, 'users');

async function joinRoom(userId: string, userName: string): Promise<void> {
  const roomRef = doc(database, 'rooms', roomId);
  await setDoc(doc(roomRef, 'users', userId), {
    name: userName,
  });
}

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
onSnapshot(usersRef, snapshot => {
  users.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
});

onMounted(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(user => {
    if (user) {
      joinRoom(user.uid, user.displayName || 'Anonymous');
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