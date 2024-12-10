<template>
  <section class="">
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0"
    >
      <div
        class="w-full rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 text-white"
      >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1
            class="text-xl font-bold leading-tight tracking-tight md:text-2xl"
          >
            {{ userAction === 'login' ? 'Sign in to your account' : '' }}
            {{ userAction === 'register' ? 'Create an account' : '' }}
          </h1>
          <form class="space-y-4 md:space-y-6" v-on:submit.prevent="">
            <div v-if="userAction === 'register'">
              <label for="name" class="block mb-2 text-sm font-medium"
                >Your Name</label
              >
              <input
                v-model="name"
                type="text"
                name="name"
                id="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label for="email" class="block mb-2 text-sm font-medium"
                >Your email</label
              >
              <input
                v-model="email"
                type="email"
                name="email"
                id="email"
                class="bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@company.com"
                required
                :class="{
                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500':
                    !emailError,
                  'border-red-500 focus:border-red-500 focus:ring-red-500':
                    emailError,
                }"
              />
            </div>
            <div>
              <label for="password" class="block mb-2 text-sm font-medium"
                >Password</label
              >
              <input
                v-model="password"
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
              />
            </div>
            <button
              @click="actionsObj[userAction]"
              class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              {{ userAction === 'login' ? 'Sign in' : 'Sign up' }}
            </button>
            <p
              class="text-sm font-light text-gray-500 dark:text-gray-400"
              v-if="userAction === 'login'"
            >
              Don’t have an account yet?
              <span
                class="font-medium text-green-600 hover:underline dark:text-primary-500 cursor-pointer"
                @click="userAction = 'register';errorMsg = ''"
                >Sign up</span
              >
            </p>
            <p
              class="text-sm font-light text-gray-500 dark:text-gray-400"
              v-if="userAction === 'register'"
            >
              Already have an account?
              <span
                class="font-medium text-green-600 hover:underline dark:text-primary-500 cursor-pointer"
                @click="userAction = 'login'; errorMsg = ''"
                >Sign in</span
              >
            </p>
            <p class="text-red-500 text-xs italic">{{ errorMsg }}</p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { auth } from '../config/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { useRouter } from 'vue-router'

const userAction = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
// const emailError = ref(false);
const router = useRouter()

const emailError = computed(() => {
  return !isValidEmail(email.value)
})

const isValidEmail = (email: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

const register = async () => {
  try {
    errorMsg.value = ''
    if (name.value && isValidEmail(email.value) && password.value) {
      const res = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value,
      )
      console.log('User registered:', res.user)
    }
  } catch (error) {
    console.log('Error during registration:', error)
  }
}

onAuthStateChanged(auth, user => {
  console.log(user)
  debugger
  if (user) {
    if (userAction.value === 'register') {
      updateProfile(user, {
        displayName: name.value,
      })
        .then(() => {
          console.log('Display name updated successfully!')
          router.push('/')
        })
        .catch(error => {
          console.error('Error updating display name:', error)
          errorHandeling(error)
        })
    } else {
      router.push('/')
    }
  } else {
    console.log('No user is signed in.')
  }
})

const login = async () => {
  try {
    errorMsg.value = ''
    const res = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value,
    )
    console.log('User logged in:', res.user)
  } catch (error) {
    console.log('Error during login:', error)
    errorHandeling(error as {code: string})
  }
}

function errorHandeling(error: {code: string}) {
  switch (error.code) {
    case 'auth/invalid-email':
      errorMsg.value = 'Invalid email'
      break
    case 'auth/user-not-found':
      errorMsg.value = 'No account with that email was found'
      break
    case 'auth/wrong-password':
      errorMsg.value = 'Incorrect password'
      break
    default:
      errorMsg.value = 'Email or password was incorrect'
      break
  }
}

const actionsObj = {
  login,
  register,
}
</script>
