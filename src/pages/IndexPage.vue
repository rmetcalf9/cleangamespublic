<template>
  <q-page class="flex flex-center">
    <q-btn color="primary" label="Ludo" @click="$router.push('/ludo')" />
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage'
})
</script>
