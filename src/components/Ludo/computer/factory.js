

function computer_types () {
  return {
    random: {
      id: 'random',
      name: 'Random'
    }
  }
}

function get_computer_move (current_player, game_state, possible_moves) {
  // TODO implement mistake modifier

  // If we can get a piece out then we should
  var selectedMove = undefined
  Object.keys(possible_moves).forEach(function (move_key) {
    const move = possible_moves[move_key]
    if (move.isTokenStartMove) {
      selectedMove = move
    }
  })
  if (typeof (selectedMove) !== 'undefined') {
    return selectedMove.squareToMoveFrom
  }
  // If we get another go, do that move
  Object.keys(possible_moves).forEach(function (move_key) {
    const move = possible_moves[move_key]
    if (move.getAnotherGo) {
      selectedMove = move
    }
  })
  if (typeof (selectedMove) !== 'undefined') {
    return selectedMove.squareToMoveFrom
  }
  return possible_moves[Object.keys(possible_moves)[0]].squareToMoveFrom
}

export default {
  computer_types: computer_types(),
  computer_waits: {
    before_roll_dice: 250, // 1/4 a second
    before_move: 500
  },
  get_computer_move: get_computer_move
}
