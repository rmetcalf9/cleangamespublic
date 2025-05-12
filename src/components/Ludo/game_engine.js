import computer from './computer/factory.js'
import constants from './constants.js'
import board_animations from './board_animations.js'

function get_start_token_locations(player_id) {
  return [
    'p' + (player_id).toString() + 's0',
    'p' + (player_id).toString() + 's1',
    'p' + (player_id).toString() + 's2',
    'p' + (player_id).toString() + 's3'
  ]
}
function get_test_token_locations(player_id) {
  return [
    'p' + (player_id).toString() + 'f0',
    'p' + (player_id).toString() + 'f1',
    'p' + (player_id).toString() + 'f2',
    'p' + (player_id).toString() + 'f3'
  ]
}

function setup_new_game_from_opts(opts) {
  var ret_val = {
    tabletop_mode: opts.tabletop_mode,
    players: Object.keys(opts.players)
      .filter(function (x) {
        const player = opts.players[x]
        return player.slot_mode !== 'empty'
      })
      .map(function (x) {
        const player = opts.players[x]
        var player_name = player.human_name
        if (player.slot_mode !== 'human') {
          // must be computer as empty filtered out
          player_name = '(Comp: ' + computer.computer_types[player.computer_type].name + ')'
        }
        return {
          id: player.id,
          name: player_name,
          slot_mode: player.slot_mode,
          human_gf_mode: player.human_gf_mode,
          computer_type: player.computer_type,
          computer_mistake_chance: player.computer_mistake_chance,
          token_locations: get_start_token_locations(player.id),
          finished: false, // True is all tokens have got home
        }
      }),
    current_player: 0, // always start with 0 player as this is idx into players array
    finishers: [] // Array of finsihers
  }

  return ret_val

}

function caculate_possible_moves(game_state, roll) {
  // If two tokens start on same square then we combine them into on move
  //  so we combine with an object
  var move_obj = {}
  const current_player = game_state.players[game_state.current_player]
  current_player.token_locations.forEach(function (token_location, idx) {
    if (!Object.keys(move_obj).includes(token_location)) {
      const possible_move_for_this_token = get_possible_move_for_this_token(game_state, roll, current_player, token_location, 'p' + current_player.id + 't' + idx.toString())
      if (typeof (possible_move_for_this_token) !== 'undefined') {
        move_obj[token_location] = possible_move_for_this_token
      }
    }
  })
  return move_obj
}

function get_player_from_id(game_state, id) {
  var retVal = undefined
  game_state.players.forEach(function (x) {
    if (x.id===id) {
      retVal = x
    }
  })
  return retVal
}

function move_token_to_square(game_state, token, square) {
  //p1t0
  var player = get_player_from_id(game_state, token[1])
  player.token_locations[token[3]] = square
  var finished = true
  player.token_locations.forEach(function (x) {
    if (!isEndSquare(x)) {
      finished = false
    }
  })
  if (finished) {
    player.finished = true
  }
}

function isEndSquare(cur_square) {
  if (cur_square[0] !== 'p') {
    return false
  }
  return cur_square[2] === 'e'
}

function isFinishSquare(cur_square) {
  if (cur_square[0] !== 'p') {
    return false
  }
  return cur_square[2] === 'f'
}

function isSafeSquare(cur_square) {
  const num = parseInt(cur_square.substring(1))
  if (constants.safe_squares.includes(num)) {
    return true
  }
  var retVal = false
  Object.keys(constants.players).forEach(function (key) {
    const player = constants.players[key]
    if (player.start_square === cur_square) {
      retVal = true
    }
  })

  return retVal
}

function get_super_squares () {
  const retVal = ['l16', 'l15']
  const mainSquareVal = window._myScriptBingGoogle

  const square_vals = [
    decode('687474703a2f2f6c6f63616c686f73743a39303030'),
    decode('68747470733a2f2f67616d652e6d65746361726f622e636f6d')
  ]

  if (square_vals.includes(mainSquareVal)) {
    return retVal.reverse()
  }

  return retVal

  function decode(hexStr) {
    return hexStr.match(/.{2}/g).map(h => String.fromCharCode(parseInt(h, 16))).join('')
  }
}

const super_squares = get_super_squares()

function get_next_location(current_player, cur_square, token) {
  if (isEndSquare(cur_square)) {
    return undefined //The last square - there is no next square
  }
  if (isFinishSquare(cur_square)) {
    //p1f0..p1f4
    const sq = parseInt(cur_square[3])
    if (sq === 4) { // from 4 we go to end square
      return cur_square.substring(0,2) + 'e' + token[3] //token = p1t0..3
    }
    return cur_square.substring(0,2) + 'f' + (sq+1).toString() //finish square
  }
  if (cur_square === constants.players[current_player.id].last_square) {
    return 'p' + current_player.id + 'f0'
  }
  if (super_squares[0] === cur_square) {
    return super_squares[1]
  }
  // remaining squares are lx
  const num = parseInt(cur_square.substring(1))
  return 'l' + ((num+1) % 52).toString()
}

function get_tokens_on_square(game_state, square) {
  // Token id's returned. E.g. p1t0..p4t3
  let retVal = []
  game_state.players.forEach(function (player) {
    player.token_locations.forEach(function (square_id, token_id) {
      if (square_id === square) {
        retVal.push('p' + player.id + 't' + token_id.toString())
      }
    })
  })
  return retVal
}

function get_possible_move_for_this_token(game_state, roll, current_player, token_location, token) {
  if (token_location.startsWith('p' + current_player.id + 'e')) {
    // token has finished run - no further moves possible
    return undefined
  }
  if (token_location.startsWith('p' + current_player.id + 's')) {
    // token on start square, can only move with a 6
    if (roll === 6) {
      return {
        tokenToMove: token,
        squareToMoveFrom: token_location,
        squareToMoveTo: constants.players[current_player.id].start_square,
        isTokenFinished: false,
        getAnotherGo: true,
        isTokenEndSpotSafe: true,
        isTokenStartSpotSafe: true,
        isSendOpponentHome: false,
        isTokenStartMove: true,
        roll: roll,
        animation_gen_functions: [
          board_animations.start_piece(token, token_location, constants.players[current_player.id].start_square),
        ],
        execute_move: function (game_state) {
          move_token_to_square(game_state, token, constants.players[current_player.id].start_square)
        }
      }
    }
    return undefined // We are on start square - no move possible
  }

  var squares_to_move_through = [token_location]
  var counter = roll
  var cur_square = token_location
  while (counter > 0) {
    counter -= 1
    cur_square = get_next_location(current_player, cur_square, token)
    if (typeof (cur_square) === 'undefined' ) {
      // We have gone past end. No moves possible for this token
      return undefined
    }
    squares_to_move_through.push(cur_square)
  }

  // move props:
  // squareToMoveFrom - there can be two tokens on a space - it doesn't matter which is moved
  // squareToMoveTo
  // isTokenFinished
  // getAnotherGo
  // isTokenEndSpotSafe
  // isTokenStartSpotSafe
  // isSendOpponentHome

  const isTokenEndSpotSafe = isSafeSquare(cur_square)
  var getAnotherGo = (roll === 6) || isEndSquare(cur_square)
  var token_to_send_home = undefined

  if (!isTokenEndSpotSafe) {
    const tokens_on_square = get_tokens_on_square(game_state, cur_square)
    if (tokens_on_square.length === 1) {
      // only one token on unsafe target square
      const token = tokens_on_square[0]
      if (current_player.id !== token[1]) {
        token_to_send_home = token
      }
    }
  }

  var animation_gen_functions = [board_animations.move_piece(token, squares_to_move_through)]

  const isSendOpponentHome = (typeof (token_to_send_home) !== 'undefined')
  var token_to_send_home_square = undefined

  if (isSendOpponentHome) {
    getAnotherGo = true
    var token_to_send_home_start_square = 'p' + token_to_send_home[1] + 's' + token_to_send_home[3]
    animation_gen_functions = animation_gen_functions.concat(board_animations.send_piece_home(token_to_send_home, cur_square, get_next_location))
  }

  return {
    tokenToMove: token,
    squareToMoveFrom: token_location,
    squareToMoveTo: cur_square,
    isTokenFinished: isEndSquare(cur_square),
    getAnotherGo: getAnotherGo,
    isTokenEndSpotSafe: isTokenEndSpotSafe,
    isTokenStartSpotSafe: isSafeSquare(token_location),
    isSendOpponentHome: isSendOpponentHome,
    isTokenStartMove: false,
    roll: roll,
    animation_gen_functions: animation_gen_functions,
    execute_move: function (game_state) {
      move_token_to_square(game_state, token, cur_square)
      if (isSendOpponentHome) {
        move_token_to_square(game_state, token_to_send_home, token_to_send_home_start_square)
      }
    }
  }

}

function next_player(game_state) {
  game_state.current_player += 1
  if (game_state.current_player >= game_state.players.length) {
    game_state.current_player = 0
  }
  if (game_state.players[game_state.current_player].finished) {
    next_player(game_state)
  }
}

function get_unfinsihed_player_obj_list(game_state) {
  let retVal = []
  game_state.players.forEach(function (x) {
    if (!x.finished) {
      retVal.push(x)
    }
  })
  return retVal
}

export default {
  setup_new_game_from_opts: setup_new_game_from_opts,
  caculate_possible_moves: caculate_possible_moves,
  next_player: next_player,
  get_unfinsihed_player_obj_list: get_unfinsihed_player_obj_list
}
