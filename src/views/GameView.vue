<template>
  <div v-if="user" class="h-screen p-8 main">
    <Card title="Create a New Room" @clickEvent="createRoom"/>
    <Card title="Join a Room" @clickEvent="modalJoinRoom"/>
    <ModalRoom v-if="showModal" @closeModal="modalJoinRoom"/>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { database, auth } from '../config/firebase'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { User } from '../types/user'
import ModalRoom from '../components/ModalRoom.vue'
import Card from '../components/Card.vue'

const user = ref<User | null>()
const router = useRouter()
const showModal = ref<boolean>(false);

async function generateUniqueRoomId(): Promise<string> {
  let roomId = '';
  let isUnique = false
  while (!isUnique) {
    // Generate a random 4-digit number
    roomId = Math.floor(1000 + Math.random() * 9000).toString()
    // Check if this roomId already exists
    const roomDoc = doc(database, 'rooms', roomId);
    const docSnapshot = await getDoc(roomDoc);
    if (!docSnapshot.exists()) {
      isUnique = true;
    }
  }
  return roomId
}

const createRoom = async () => {
  try {
    const customRoomId: string = await generateUniqueRoomId()
    await setDoc(doc(database, 'rooms', customRoomId), {
      createdAt: serverTimestamp(),
      createdBy: user.value?.uid,
    })
    router.push(`/room/${customRoomId}`) // Navigate using the custom room ID
  } catch (error) {
    console.error('Error creating room: ', error)
  }
}

const modalJoinRoom = async () => {
  showModal.value = !showModal.value;
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
onMounted(() => {
  fetchUser()
});
</script>