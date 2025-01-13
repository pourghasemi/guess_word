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
              <BaseInput
                label="Your Name"
                type="text"
                name="name"
                id="name"
                placeholder="Your Name"
                v-model="name"
                required
              />
            </div>
            <BaseInput
              label="Your email"
              type="email"
              name="email"
              id="email"
              placeholder="name@company.com"
              v-model="email"
              :error="emailError"
              required
            />
            <BaseInput
              label="Password"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              v-model="password"
              required
            />
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import BaseInput from './BaseInput.vue';

const userAction = ref<'login' | 'register'>('login');
const name = ref('');
const email = ref('');
const password = ref('');
const errorMsg = ref('');
const router = useRouter();

const PASSWORD_ERROR_MESSAGE = 'Password must be at least 6 characters long and include both letters and numbers';

const emailError = computed(() => !isValidEmail(email.value));

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!regex.test(password)) {
    errorMsg.value = PASSWORD_ERROR_MESSAGE;
    return false;
  }
  return true;
};

const register = async () => {
  try {
    errorMsg.value = '';
    if (name.value && isValidEmail(email.value) && isValidPassword(password.value)) {
      const res = await createUserWithEmailAndPassword(auth, email.value, password.value);
      console.log('User registered:', res.user);
    }
  } catch (error) {
    console.log('Error during registration:', error);
    handleError(error as { code: string })
  }
};

onAuthStateChanged(auth, user => {
  if (user) {
    if (userAction.value === 'register') {
      updateProfile(user, { displayName: name.value })
        .then(() => {
          console.log('Display name updated successfully!');
          router.push('/');
        })
        .catch(error => {
          console.error('Error updating display name:', error);
          handleError(error);
        });
    } else {
      router.push('/');
    }
  } else {
    console.log('No user is signed in.');
  }
});

const login = async () => {
  try {
    errorMsg.value = '';
    const res = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log('User logged in:', res.user);
  } catch (error) {
    console.log('Error during login:', error);
    handleError(error as { code: string });
  }
};

const errorMessages: Record<string, string> = {
  'auth/invalid-email': 'Invalid email',
  'auth/user-not-found': 'No account with that email was found',
  'auth/wrong-password': 'Incorrect password',
  'auth/email-already-in-use': 'This email is already in use. Please use a different email or sign in.',
  default: 'Email or password was incorrect',
};

function handleError(error: { code: string }) {
  errorMsg.value = errorMessages[error.code] || errorMessages.default;
}

const actionsObj = { login, register };
</script>
