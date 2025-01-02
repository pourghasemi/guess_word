<template>
  <header>
    <nav
      class="px-4 lg:px-6 py-2.5 bg-opacity-80 bg-gray-900 w-full"
    >
      <div
        class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl"
      >
        <a href="https://flowbite.com" class="flex items-center">
          <span
            class="self-center text-xl font-semibold whitespace-nowrap text-white"
            >Guess word</span
          >
        </a>
        <div class="flex items-center lg:order-2 text-white">
          <span
            v-if="user?.email"
            class="hover:bg-green-800 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 cursor-pointer"
            @click="logout"
          >
            Sign out
          </span>
          <span class="px-2">Hello {{ user?.name }}</span>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../config/firebase'
import { User } from '../types/user'

const router = useRouter()
const user = ref<User | null>()

const fetchUser = async () => {
  auth.onAuthStateChanged(res => {
    if (res) {
      user.value = {
        email: res.email,
        uid: res.uid,
        name: res.displayName,
      } as User
    } else {
      router.push('/login')
    }
  })
}
fetchUser()

function logout() {
  auth.signOut()
  user.value = null
}
</script>
