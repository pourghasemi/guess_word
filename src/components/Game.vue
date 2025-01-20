<template>
    <div>
        <div v-if="player1 === null">
          <h2 class="text-xl py-10">Who want to start?</h2>
          <Player :username="users[0].name" @clickEvent="player1 = users[0]; player2 = users[1]; start=true "/>
          <Player :username="users[1].name" @clickEvent="player1 = users[1]; player2 = users[0]; start=true "/>
        </div>
        <GameGuess
          :player1="player1"
          :player2="player2"
          :gameId="roomId"
          @resetGame="resetGame"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GameGuess from '../components/GameGuess.vue';
import Player from './Player.vue';
import type { User } from '../types/types';

const props = defineProps<{
    users: Array<User>,
    roomId: string
}>()

const player1= ref<User | null>(null);
const player2= ref<User | null>(null);
const start= ref<boolean | null>(null);

function resetGame({user1, user2}: {user1: User | null, user2: User | null}){
  if(user1 && user2){
    player1.value = props.users.filter(user => user.id === user1.id)?.[0] || null;
    player2.value = props.users.filter(user => user.id === user2.id)?.[0] || null;
  } else {
    player1.value = null;
    player2.value = null;
    start.value = null
  }
}
</script>