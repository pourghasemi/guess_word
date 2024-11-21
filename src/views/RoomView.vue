<template>
  <div v-if="users.length">
    <h2>Room: {{ roomId }}</h2>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }}</li>
    </ul>
    <button @click="leaveRoom">leave</button>
    <Game
      v-if="users.length == 2"
      :player1="users[0].id"
      :player2="users[1].id"
      :gameId="`${roomId}`"
    />
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

// Define a type for user
interface User {
  id: string;
  name: string;
}

const route = useRoute();
const roomId = route.params.id as string; // Ensure roomId is a string
const users = ref<User[]>([]); // Explicitly type the users ref

async function joinRoom(userId: string, userName: string) {
  const roomRef = doc(database, 'rooms', roomId);
  await setDoc(doc(roomRef, 'users', userId), {
    name: userName,
  });
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