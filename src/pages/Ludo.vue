<template>
  <q-page class="flex flex-center ludopage">
    <LudoGame />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import LudoGame from '../components/Ludo/Game.vue'


export default defineComponent({
  name: 'LudoPage',
  components: {
    LudoGame
  }
})
</script>

<style>
  .ludopage {
    height: calc(100vh - 50px);
  }
</style>
