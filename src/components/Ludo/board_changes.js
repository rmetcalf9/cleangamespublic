import * as d3 from 'd3'
import constants from './constants.js'
import board_get_locations from './board_get_locations.js'

// File contains all the changes to the board
// e.g. moves, setting up game etc.

function isIdIn(arr, id) {
  var found = false
  arr.map(function (x) {
    if (x.id === id) {
      found = true
    }
  })
  return found
}

function setup_board_for_new_game(game_state) {
  const tabletoptitletext = d3.select('#tabletoptitletext')
  const p2name = d3.select('#p2name')
  const p3name = d3.select('#p3name')
  const p2finishedmainsquaregroup = d3.select('#p2finishedmainsquaregroup')
  const p3finishedmainsquaregroup = d3.select('#p3finishedmainsquaregroup')


  if (game_state.tabletop_mode) {
    tabletoptitletext.style('display', 'unset')
    p2name.attr('transform', 'rotate( 180 -450 -700)')
    p3name.attr('transform', 'rotate( 180 450 -700 )')

    //Set player finsihed items for p2 and p3 to rotated
    p2finishedmainsquaregroup.attr('transform', 'rotate( 180 -450 -450 )')
    p3finishedmainsquaregroup.attr('transform', 'rotate( 180 450 -450 )')
  } else {
    tabletoptitletext.style('display', 'none')
    p2name.attr('transform', 'rotate( 0 -450 -700)')
    p3name.attr('transform', 'rotate( 0 450 -700 )')

    //Set player finsihed items for p2 and p3 to rotated
    p2finishedmainsquaregroup.attr('transform', 'rotate( 0 -450 -450 )')
    p3finishedmainsquaregroup.attr('transform', 'rotate( 0 450 -450 )')
  }

  Object.keys(constants.players).map(function (player_key) {
    const player = constants.players[player_key]
    const pname = d3.select('#p' + player.id + 'name')
    const ptokens = d3.select('#p' + player.id + 'tokens')

    if (isIdIn(game_state.players, player.id)) {
      pname.style('display', 'unset')
      ptokens.style('display', 'unset')
    } else {
      pname.style('display', 'none')
      ptokens.style('display', 'none')
    }
  })

  // finally reset all tokens and dice to the starting position
  game_state.players.map(function (player) {
    const pname = d3.select('#p' + player.id + 'name')
    pname.text(d => (player.name).toString())
    player.token_locations.map(function (location, token_idx) {
      const token = d3.select('#p' + player.id + 't' + token_idx.toString())
      token.attr('transform', board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(location)))
    })
    display_dice_image(player.id, 6)
    // display_dice_image(player.id, constants.blank_dice_image_num)
  })

  // Remove flashing class from all items in case it is there
  const flashing_items = d3.selectAll('.ludo-flashing')
  flashing_items.classed('ludo-flashing', false)

  // hide_all_player_finished_items
  for (let n=1; n<5; n++) {
    const id = 'p' + n.toString() + 'finished'
    const ite = d3.select('#' + id)
    ite.style('display', 'none')
  }
}

function pad(num, size) {
    var s = "000000000" + num.toString();
    return s.substr(s.length-size);
}

function display_dice_image(player_id, img_to_display) {
  for (var imgnum =1; imgnum<(constants.number_of_dice_images+1); imgnum++) {
    const img = d3.select('#p' + player_id + 'dice_' + pad(imgnum,2))
    if (imgnum === img_to_display) {
      img.style('display', 'unset')
    } else {
      img.style('display', 'none')
    }
  }
}

function get_ready_for_roll (game_state) {
  const current_player = game_state.players[game_state.current_player]
  // display_dice_image(current_player.id, 6)
}

function show_clickable_items(item_list, clickon) {
  item_list.map(function (x) {
    const ite = d3.select('#' + x)
    if (clickon) {
      ite.attr('class', 'ludo-flashing')
    } else {
      ite.attr('class', '')
    }
  })
}

function set_player_turn(player_id, turn) {
  const ite = d3.select('#p' + player_id + 'bigrect')
  if (turn) {
    ite.style('display', 'unset')
  } else {
    ite.style('display', 'none')
  }
}

function animate_move(move, onCompleteFn, game_state) {
  var move_animations = []
  move.animation_gen_functions.forEach(function (animation_gen_function) {
    move_animations.push(...animation_gen_function(game_state))
  })

  var cur_animation = 0

  function animate(animation) {
    var transition = d3.select('#' + animation.token)
    for (let i = 1; i < animation.animation_points.length; i++) {
      transition = transition.transition()
        .duration(animation.animation_points[i][1])
        .attr("transform", animation.animation_points[i][0]);
    }
    // Add callback for when final transition finishes
    transition.on("end", () => {
      cur_animation += 1
      if (cur_animation >= move_animations.length) {
        onCompleteFn()
      } else {
        animate(move_animations[cur_animation])
      }
    });
  }
  animate(move_animations[cur_animation])
}

function show_player_finished (player_id, position) {
  // position can be 0..3
  const text = d3.select('#p' + player_id + 'finishedtext')
  text.text(d => (constants.position_strings[position]).toString())

  const maingroup = d3.select('#p' + player_id + 'finished')
  maingroup.style('display', 'unset')

  // make sure turn indicator is turned off
  set_player_turn(player_id, false)
  display_dice_image(player_id, -1) // turn off all dice images
}

export default {
  setup_board_for_new_game: setup_board_for_new_game,
  get_ready_for_roll: get_ready_for_roll,
  show_clickable_items: show_clickable_items,
  display_dice_image: display_dice_image,
  set_player_turn: set_player_turn,
  animate_move: animate_move,
  show_player_finished: show_player_finished
}
