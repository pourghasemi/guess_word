<template>
    <div>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center">
            <div class="bg-green-600 bg-opacity-90 w-full max-w-md h-48 rounded-lg shadow-xl flex flex-col justify-center items-center text-white px-8 space-y-4">
              <div class="text-4xl font-extrabold tracking-wide">
                🎉 {{ winnerName }} Wins! 🎉
              </div>
              <button
                @click="handelClickEvent"
                class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full transition-transform transform hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
    </div>
</template>


<script setup lang="ts">
defineProps<{
    winnerName: string
}>()

const emit = defineEmits(['clickEvent'])

const handelClickEvent = () => {
    emit('clickEvent');
}
</script>