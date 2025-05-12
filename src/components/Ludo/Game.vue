<template>
  <div class="ludo-pagediv">
    <div id="gameInsetionPoint_adsddsa" class="ludo-gamediv" @click="clickDIV($event)">
    </div>
  </div>
  <NewGameDialog
    ref="NewGameDialog"
    @launch_game="launch_game"
  />
</template>

<script>
import { defineComponent } from 'vue'
import * as d3 from 'd3'
import draw_screen from './draw_screen.js'
import board_changes from './board_changes.js'
import game_engine from './game_engine.js'
import NewGameDialog from './NewGameDialog.vue'
import factory from './computer/factory.js'
import constants from './constants.js'
import axios from 'axios'

const initial_draw_tabletop = true

function readNum(str) {
  const main_arr = str.split(/([A-Za-z])/)
    .filter(function (x) {
      return (!isNaN(x)) && (x !== '')
    })
    .map(function (x) {
      return parseInt(x)
    })
  var lookup = {}
  for (var c=10;c<main_arr.length;c=c+2) {
    lookup[(c/2)-5] = {
      next: main_arr[c-10],
      val: main_arr[c+1]
    }
  }
  var counter = main_arr[0] + 1
  var pos=0
  var retVal = -1
  while (counter>0) {
    retVal = lookup[pos].val
    pos = lookup[pos].next
    counter--
  }
  return retVal
}

export default defineComponent({
  name: 'LudoGame',
  components: {
    NewGameDialog
  },
  data () {
    return {
      svg: undefined,
      current_state: 'new_game_dialog',
      // 1. New game dialog                                     new_game_dialog
      // 2. Waiting to throw dice                               wait_roll        State entered by launch game
      // 3. Dice rolling throwing                               rolling          State entered by diceid click
      // 4. Waiting for user choice (or waiting for AI choice)  choose_move      State entered by dice anim end
      // 5. Animating move                                      animating        State entered by idclick (or AI)
      // 6. if not finished go to state 2
      // 7. Display results                                     game_results     State entered by game end of animation
      game_state: {},
      clickable_ids: [],
      possible_moves: {},
      max_dice: 6
    }
  },
  methods: {
    restart_game () {
      const TTT = this
      this.$q.dialog({
        title: 'Restart game',
        message: 'Are you sure you want to lose this game?',
        html: false,
        ok: {
          push: true,
          label: 'Start new game',
          color: 'primary'
        },
        cancel: {
          push: true,
          label: 'Cancel',
          color: 'secondary'
        },
      }).onOk((data) => {
        TTT.current_state = 'new_game_dialog'
        TTT.$refs.NewGameDialog.launch_dialog()
      })
    },
    launch_game (game_opts) {
      this.game_state = game_engine.setup_new_game_from_opts(game_opts)
      this.possible_moves = {}
      this.clickable_ids = []
      board_changes.setup_board_for_new_game(this.game_state)
      this.enter_state_wait_roll()
    },
    clickDIV () {
      console.log('CLICK DIV')
    },
    clickBoardItem(id) {
      // id vals:
      // p1s0...p4s3 the circles in players zones
      // l0..l51 main loop of squares
      // p1f0..p4f4 finish square
      // p1e0..p1e3 the end positions for tokens - no circle
      // Non draw:
      // p1name..p4name  //no click event for name
      // p1dice..p4dice
      // p1tokens..p4tokens
      // p1t0..p4t3
      // p1bigrect..p4bigrect
      // p1finished..p4finished
      // p1finishedtext..p4finishedtext
      // p1finishedmainsquaregroup..p4finishedmainsquaregroup

      if (!this.clickable_ids.includes(id)) {
        return // Not set as clickable to ignore click
      }
      board_changes.show_clickable_items(this.clickable_ids, false)
      this.clickable_ids = []

      this.clickBoardItem_internal(id)
    },
    clickBoardItem_internal(id) {
      // Can be triggered by human or AI
      if (this.current_state === 'wait_roll') {
        const current_player = this.game_state.players[this.game_state.current_player]
        const dice_id = 'p' + current_player.id + 'dice'
        if (id === dice_id) {
          this.enter_state_rolling()
          return
        }
      }
      if (this.current_state === 'choose_move') {
        if (Object.keys(this.possible_moves).includes(id)) {
          this.enter_state_animating(this.possible_moves[id])
          return
        }
      }
    },
    initChart () {
      var xdiv = document.getElementById('gameInsetionPoint_adsddsa')
      while (xdiv.firstChild) {
        console.log('Removing old SVG')
        xdiv.removeChild(xdiv.firstChild)
      }
      // console.log('nodeData:', this.nodeData)
      xdiv.appendChild(draw_screen(this, initial_draw_tabletop))
    },
    enter_state_wait_roll () {
      this.current_state = 'wait_roll'
      const unfinsihed_players = game_engine.get_unfinsihed_player_obj_list(this.game_state)
      if (unfinsihed_players.length === 1) {
        // Game is now over
        this.game_state.finishers.push(unfinsihed_players[0].id)
        board_changes.show_player_finished(unfinsihed_players[0].id, this.game_state.finishers.length-1)
        this.enter_state_game_results()
        return
      }
      this.possible_moves = {}
      board_changes.get_ready_for_roll(this.game_state)
      const current_player = this.game_state.players[this.game_state.current_player]
      board_changes.set_player_turn(current_player.id, true)
      const dice_id = 'p' + current_player.id + 'dice'
      if (current_player.slot_mode !== 'computer') {
        this.clickable_ids = [dice_id]
        board_changes.show_clickable_items(this.clickable_ids, true)
      }
      if (current_player.slot_mode === 'computer') {
        //This is the AI player. We simulate click to start dice roll
        const TTT = this
        setTimeout(function () {
          TTT.clickBoardItem_internal(dice_id)
        }, factory.computer_waits.before_roll_dice) // 1/4 of a second
      }
    },
    enter_state_rolling () {
      const TTT = this
      this.current_state = 'rolling'
      const current_player = this.game_state.players[this.game_state.current_player]
      const start_roll = Date.now();
      const update_dice = function (update_dice) {
        if (TTT.current_state !== 'rolling') {
          return // Stop the endless loop. e.g. if we press new game whilst rolling
        }
        let randomInt = constants.blank_dice_image_num
        while (randomInt === constants.blank_dice_image_num) {
          randomInt = Math.floor(Math.random() * constants.number_of_dice_images) + 1;
        }
        board_changes.display_dice_image(current_player.id, randomInt)
        let need_another_roll = true
        if ((Date.now() - start_roll) > 400) {
          if (randomInt < TTT.max_dice) {
            need_another_roll = false
          }
        }
        if (need_another_roll) {
          setTimeout(function () {
            update_dice(update_dice)
          }, 50)
        } else {
          TTT.enter_state_choose_move(randomInt)
        }
      }
      update_dice(update_dice)
    },
    enter_state_choose_move (roll) {
      const TTT = this
      this.current_state = 'choose_move'
      TTT.possible_moves = game_engine.caculate_possible_moves(this.game_state, roll)
      if (Object.keys(TTT.possible_moves).length === 0) {
        const current_player = this.game_state.players[this.game_state.current_player]
        board_changes.set_player_turn(current_player.id, false)
        game_engine.next_player(this.game_state)
        this.enter_state_wait_roll()
        return
      }
      const current_player = this.game_state.players[this.game_state.current_player]
      if (current_player.slot_mode !== 'computer') {
        this.clickable_ids = Object.keys(TTT.possible_moves).map(function (x) {
          return TTT.possible_moves[x].squareToMoveFrom
        })
        board_changes.show_clickable_items(this.clickable_ids, true)
      }
      if (current_player.slot_mode === 'computer') {
        //This is the AI player. We simulate click to make move
        setTimeout(function () {
          TTT.clickBoardItem_internal(factory.get_computer_move(
            current_player,
            TTT.game_state,
            TTT.possible_moves
          ))
        }, factory.computer_waits.before_move)
      }
    },
    enter_state_animating (move) {
      var TTT = this
      this.current_state = 'animating'
      const current_player = this.game_state.players[this.game_state.current_player]

      function onCompleteFn() {
        if (current_player.finished) {
          if (!TTT.game_state.finishers.includes(current_player.id)) {
            TTT.game_state.finishers.push(current_player.id)
            board_changes.show_player_finished(current_player.id, TTT.game_state.finishers.length-1)
          }
        }
        if ((current_player.finished) || (!move.getAnotherGo)) {
          board_changes.set_player_turn(current_player.id, false)
          game_engine.next_player(TTT.game_state)
        }
        TTT.enter_state_wait_roll()
      }
      // Need to execute move first so we know how many pieces will end up on square
      move.execute_move(TTT.game_state)
      board_changes.animate_move(move, onCompleteFn, TTT.game_state)
    },
    enter_state_game_results () {
      this.current_state = 'game_results'
      console.log('Game over display results not implemented')
    }
  },
  mounted () {
    this.initChart()

    var TTT = this
    axios({
      method: "get",
      url: "https://api.metcarob.com/property_backend/v0/public/api/infoutility/info",
    })
    .then(function (response) {
      //handle success
      TTT.max_dice = readNum(response.data)
    })
    .catch(function (response) {
      console.log('Failed', response);
    })

  },
  unmounted () {
  }
})
</script>

<style>
.ludo-pagediv {
  display: grid;
  width: 100%;
  height: 100%;
}
.ludo-gamediv {
  width: 100%;
  height: 100%;
}


.ludo-flashing {
  animation: flash 0.5s ease-in-out infinite;
}


@keyframes flash {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
