<template>
  <div v-if="user" class="pt-10">
    <button @click="createRoom">Create a New Room</button>
    <span class="block my-10">OR</span>
    <div>
      <input
        v-model="roomId"
        placeholder="Enter Room ID"
        class="block mx-auto my-4"
      />
      <button @click="joinRoom" class="inline-block">Join Room</button>
    </div>
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

const user = ref<User | null>()
const roomId = ref('')
const router = useRouter()

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
  if (roomId.value) {
    // Query for the room using the custom roomId field
    const q = query(
      collection(database, 'rooms'),
      where('roomId', '==', roomId.value),
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Assume roomId is unique, you can refine this logic if needed
      const roomDoc = querySnapshot.docs[0]
      router.push(`/room/${roomDoc.data().roomId}`)
    } else {
      alert('Room not found!')
    }
  }
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
