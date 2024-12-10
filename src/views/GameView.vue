<template>
  <div v-if="user" class="h-screen p-8 main">
    <!-- <button @click="createRoom">Create a New Room</button>
    <span class="block my-10">OR</span>
    <div>
      <input
        v-model="roomId"
        placeholder="Enter Room ID"
        class="block mx-auto my-4"
      />
      <button @click="joinRoom" class="inline-block">Join Room</button>
    </div> -->
    <div class="card" @click="createRoom">
      Create a New Room
    </div>
    <div class="card" @click="joinRoom">
      Join a Room
    </div>
    <ModalRoom v-if="showModal" @closeModal="joinRoom"/>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { database } from '../config/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { auth } from '../config/firebase'
import { User } from '../types/user'
import ModalRoom from '../components/ModalRoom.vue'

const user = ref<User | null>()
const roomId = ref('')
const router = useRouter()
const showModal = ref(false);

async function generateUniqueRoomId() {
  let roomId
  let isUnique = false

  while (!isUnique) {
    // Generate a random 4-digit number
    roomId = Math.floor(1000 + Math.random() * 9000).toString()

    // Check if this roomId already exists
    const q = query(
      collection(database, 'rooms'),
      where('roomId', '==', roomId),
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      isUnique = true
    }
  }

  return roomId
}

const createRoom = async () => {
  try {
    const customRoomId = await generateUniqueRoomId()
    console.log(customRoomId)
    await addDoc(collection(database, 'rooms'), {
      roomId: customRoomId, // Store the custom room ID in the document
      createdAt: serverTimestamp(),
      createdBy: user.value?.uid,
    })
    router.push(`/room/${customRoomId}`) // Navigate using the custom room ID
  } catch (error) {
    console.error('Error creating room: ', error)
  }
}

const joinRoom = async () => {
  showModal.value = !showModal.value;
  // if (roomId.value) {
  //   // Query for the room using the custom roomId field
  //   const q = query(
  //     collection(database, 'rooms'),
  //     where('roomId', '==', roomId.value),
  //   )
  //   const querySnapshot = await getDocs(q)

  //   if (!querySnapshot.empty) {
  //     // Assume roomId is unique, you can refine this logic if needed
  //     const roomDoc = querySnapshot.docs[0]
  //     router.push(`/room/${roomDoc.data().roomId}`)
  //   } else {
  //     alert('Room not found!')
  //   }
  // }
}

const fetchUser = async () => {
  auth.onAuthStateChanged(res => {
    if (res) {
      user.value = {
        email: res.email,
        uid: res.uid,
        name: res.displayName,
      } as User
    }
  })
}
fetchUser()
</script>

<style scoped>
.card {
  background: #191c29;
  width: var(--card-width);
  height: var(--card-height);
  padding: 3px;
  position: relative;
  border-radius: 6px;
  justify-content: center;
  align-items: center;
  text-align: center;
  display: inline-flex;
  font-size: 1.5em;
  color: rgb(88 199 250 / 100%);
  cursor: pointer;
  transition: color 1s;
  margin: 30px;
}

.card::before {
  content: "";
  width: 104%;
  height: 102%;
  border-radius: 8px;
  background-image: linear-gradient(var(--rotate), #5ddcff, #3c67e3 43%, #4e00c2);
  position: absolute;
  z-index: -1;
  top: -1%;
  left: -2%;
  animation: spin 2.5s linear infinite;
}

.card::after {
  position: absolute;
  content: "";
  top: calc(var(--card-height) / 6);
  left: 0;
  right: 0;
  z-index: -1;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  transform: scale(0.8);
  filter: blur(calc(var(--card-height) / 6));
  background-image: linear-gradient(var(--rotate), #5ddcff, #3c67e3 43%, #4e00c2);
  opacity: 1;
  transition: opacity 0.5s;
  animation: spin 2.5s linear infinite;
}

@keyframes spin {
  0% { --rotate: 0deg; }
  100% { --rotate: 360deg; }
}
</style>