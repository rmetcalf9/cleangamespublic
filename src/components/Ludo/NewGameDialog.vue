<template>
  <q-dialog v-model="dialog_visible">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Start new game</div>
      </q-card-section>

      <q-card-section>
        <div v-for="player in players" :key="player.id">
          <div :style="'background: ' + player.colour + ';'" class="newgamedialog-playoptbox">
            <q-option-group
              inline
              v-model="player.slot_mode"
              :options="slot_mode_options"
              color="primary"
            />
            <div v-if="player.slot_mode === 'human'">
              <div class="row">
              Name: <q-input filled v-model="player.human_name" dense></q-input>
              </div>
              <div>
                <q-checkbox v-model="player.human_gf_mode" label="Girlfriend mode" />
                <q-btn round dense flat icon="info" @click="helpgfmode" />
              </div>
            </div>
            <div v-if="player.slot_mode === 'computer'">
              <q-select v-model="player.computer_type" :options="computer_types" label="Type" emit-value map-options />
              <div class="row">
                Mistake Chance:
                <q-input
                  v-model.number="player.computer_mistake_chance"
                  type="number"
                  filled
                  style="max-width: 100px"
                  dense
                  min="0"
                  max="100"
                  step="5"
                />
                <q-btn round dense flat icon="info" @click="helpmistagechance" />
              </div>
            </div>
          </div>
        </div>
        <q-checkbox v-model="tabletop_mode" label="Tabletop Mode" />
        <q-card-actions align="right" class="text-primary">
        <q-btn color="primary" :label="btn_text" @click="launch_game" :disable="isDisabled" />
        </q-card-actions>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import constants from './constants.js'
import computer from './computer/factory.js'

export default defineComponent({
  name: 'LudoNewGameDialog',
  emits: ['launch_game'],
  data () {
    return {
      dialog_visible: true,
      players: [],
      slot_mode_options: [
        {
          label: 'Empty',
          value: 'empty'
        },
        {
          label: 'Human',
          value: 'human'
        },
        {
          label: 'Computer',
          value: 'computer'
        }
      ],
      tabletop_mode: false
    }
  },
  computed: {
    isDisabled () {
      return this.num_players < 2
    },
    computer_types () {
      return Object.keys(computer.computer_types).map(function (x) {
        const type = computer.computer_types[x]
        return {
          value: type.id,
          label: type.name
        }
      })
    },
    num_players () {
      return this.players.filter(function (x) {
        return x.slot_mode !== 'empty'
      }).length
    },
    btn_text () {
      if (this.isDisabled) {
        return 'Need at least 2 players'
      }
      return 'Start ' + this.num_players.toString() + ' player game'
    }
  },
  methods: {
    launch_dialog () {
      this.tabletop_mode = false
      this.players = Object.keys(constants.players).map(function (player_key) {
        const x = constants.players[player_key]
        var slot_mode = 'empty'
        if (x.id==='1') {
          slot_mode = 'human'
        }
        if (x.id==='3') {
          slot_mode = 'computer'
        }
        return {
          id: x.id,
          slot_mode: slot_mode,
          colour: x.colour,
          human_name: x.name,
          human_gf_mode: false,
          computer_type: 'random',
          computer_mistake_chance: '50'
        }
      })
      this.dialog_visible = true
    },
    launch_game () {
      const game_start_opts = {
        players: this.players,
        tabletop_mode: this.tabletop_mode
      }
      this.dialog_visible = false
      this.$emit('launch_game', game_start_opts)
    },
    helpgfmode () {
      this.$q.dialog({
        title: 'Girlfriend Mode',
        message: 'When playing with your girlfriend she gets angry when the dice doesn’t give her the number she wants. Use this mode for your girlfriend to allow her to select from two possible results for each dice throw. This will reduce the chance she will be angry with you.',
        html: true
      }).onOk(() => {
        // console.log('OK')
      })
    },
    helpmistagechance () {
      this.$q.dialog({
        title: 'Computer Mistake Chance',
        message: 'The chance that the computer player will forget to evaluate one of its possible moves.',
        html: true
      }).onOk(() => {
        // console.log('OK')
      })
    }
  },
  mounted () {
    this.launch_dialog()
  }
})

</script>

<style>
.newgamedialog-playoptbox {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
