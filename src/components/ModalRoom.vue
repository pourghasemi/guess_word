<template>
    <!-- Main modal -->
    <div data-modal-backdrop="static" tabindex="-1" aria-hidden="true" class="flex bg-neutral-900/90 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
      <div class="relative p-4 w-full max-w-2xl">
        <!-- Modal content -->
        <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <!-- Modal body -->
          <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <input
              required
              v-model="roomId"
              @input="validateInput"
              :class="{'border-red-500': !isValid}"
              placeholder="Enter Room ID"
              class="block mx-auto my-4 p-4 bg-neutral-900/100 w-full rounded text-white bold text-xl"
            />
          </div>
          <!-- Modal footer -->
          <div class="flex items-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button @click="joinRoom" class="inline-block grow text-lg">Join Room</button>
            <button @click="emit('closeModal')" type="button" class="grow py-2.5 px-5 ms-3 text-lg font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Close</button>
          </div>
        </div>
      </div>
      <div v-if="showMessage" class=" absolute top-8 p-4 mb-4 text-lg text-red-800 text-l rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
        <span class="font-medium">Room not found!</span>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { database } from '../config/firebase'
  import {
    getDoc,
    doc,
  } from 'firebase/firestore'
  
  const emit = defineEmits(['closeModal']);
  const router = useRouter();

  const roomId = ref('')
  const isValid = ref(true)
  const showMessage = ref(false)
  
  const validateInput = () => {
    isValid.value = roomId.value.trim() !== '';
  }
  
  const joinRoom = async () => {
    validateInput(); // Ensure validation runs on join attempt
    if (!isValid.value) {
      return; // Prevent joining if input is invalid
    }
  
    const roomDoc = doc(database, 'rooms', roomId.value);
    const docSnapshot = await getDoc(roomDoc);
    // Query for the room using the custom roomId field
  
    if (docSnapshot.exists()) {
      // Assume roomId is unique, you can refine this logic if needed
      router.push(`/room/${roomId.value}`);
    } else {
      showMessage.value = true;
      setTimeout(() => {
        showMessage.value = false;
        roomId.value = '';
      }, 5000);
    }
  }
  </script>
  
  <style lang="css" scoped>
  input.border-red-500 {
    border: 2px solid #f56565; /* Tailwind's red-500 color */
  }
  button {
   background: rgb(22,9,240); background: linear-gradient(0deg, rgba(22,9,240,1) 0%, rgba(49,110,244,1) 100%); color: #fff; border: none; transition: all 0.3s ease; overflow: hidden; } .btn-10:after { position: absolute; content: " "; top: 0; left: 0; z-index: -1; width: 100%; height: 100%; transition: all 0.3s ease; -webkit-transform: scale(.1); transform: scale(.1); } .btn-10:hover { color: #fff; border: none; background: transparent; } .btn-10:hover:after { background: rgb(0,3,255); background: linear-gradient(0deg, rgba(2,126,251,1) 0%, rgba(0,3,255,1)100%); -webkit-transform: scale(1); transform: scale(1);
  }
  </style>