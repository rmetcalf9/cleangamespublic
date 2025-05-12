// Board animnations
import board_get_locations from './board_get_locations.js'
import constants from './constants.js'

function ensure_all_pieces_on_square_are_visible (square, game_state) {
  var pieces_on_square = []
  game_state.players.forEach(function (x) {
    x.token_locations.forEach(function (location, token_id) {
      if (square === location) {
        pieces_on_square.push('p' + x.id + 't' + token_id.toString())
      }
    })
  })
  if (pieces_on_square.length < 2) {
    // single occupancy - no need to change pieces
    return []
  }
  var square_slot = -1
  return pieces_on_square.map(function (tokenid) {
    square_slot += 1
    return {
      token: tokenid,
      animation_points: [
        [
          board_get_locations.coords_to_translate(
            board_get_locations.adjust_square_coords_for_slot(
              board_get_locations.get_square_coords_from_id(square),
              square_slot,
              pieces_on_square.length
            )
          ),
          10 // Speed of animation
        ],
        [
          board_get_locations.coords_to_translate(
            board_get_locations.adjust_square_coords_for_slot(
              board_get_locations.get_square_coords_from_id(square),
              square_slot,
              pieces_on_square.length
            )
          ),
          10 // Speed of animation
        ]
      ]
    }
  })
}

function start_piece(tokenid, startSquare, endSquare) {
  return function (game_state) {
    let move_animations = [{
      token: tokenid,
      animation_points: [
        [board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(startSquare)), 600],
        [board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(endSquare)), 600]
      ]
    }]
    move_animations = move_animations.concat(ensure_all_pieces_on_square_are_visible(endSquare, game_state))
    return move_animations
  }
}

function move_piece(tokenid, squares_to_move_through) {
  return function (game_state) {
    const last_square = squares_to_move_through.slice(-1)[0]
    let move_animations = [{
      token: tokenid,
      animation_points: squares_to_move_through.map(function (squareid) {
        return   [board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(squareid)), 250]
      })
    }]
    move_animations = move_animations.concat(ensure_all_pieces_on_square_are_visible(last_square, game_state))
    return move_animations
  }
}

function send_piece_home(tokenid, square_token_is_on, get_next_location) {
  return function (game_state) {
    const token_num = tokenid[3]
    const player_id = tokenid[1]

    // make route from start to token, then reverse it
    var cur_square = constants.players[tokenid[1]].start_square
    var squares_to_move_through = [
      'p' + player_id + 's' + token_num.toString(),
      cur_square,
    ]
    while (cur_square != square_token_is_on) {
      cur_square = get_next_location({id: player_id}, cur_square, tokenid)
      squares_to_move_through.push(cur_square)
    }
    squares_to_move_through.reverse()

    let move_animations = [{
      token: tokenid,
      animation_points: squares_to_move_through.map(function (squareid) {
        return   [board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(squareid)), 50]
      })
    }]
    return move_animations
  }
}


export default {
  start_piece: start_piece,
  move_piece: move_piece,
  send_piece_home: send_piece_home
}
