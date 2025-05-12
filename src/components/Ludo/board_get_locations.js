// Functions to return loactions on the board

function get_square_coords_from_id(id) {
  // p1s1...p4s4 the circles in players zones
  // l0..l51 main loop of squares
  // p1f0..p4f4
  if (id.startsWith('l')) {
    return get_circle_square_coords(parseInt(id.substring(1)))
  }
  if (id.startsWith('p')) {
    if (id[2] === 's') {
      // Sinish space
      const player_id = id.substring(1).split('s')[0]
      const square_num = parseInt(id.substring(1).split('s')[1])
      return get_start_square_cords(player_id, square_num)
    }
    if (id[2] === 'f') {
      // Sinish space
      const player_id = id.substring(1).split('f')[0]
      const tile_num = parseInt(id.substring(1).split('f')[1])
      return get_finish_square_cords(player_id, tile_num)
    }
    if (id[2] === 'e') {
      // Sinish space
      const player_id = id.substring(1).split('e')[0]
      const square_num = parseInt(id.substring(1).split('e')[1])
      return get_end_square_cords(player_id, square_num)
    }
  }
  console.log('ERROR - unrecognised space id', id)
  return [0, 0]
}

function adjust_square_coords_for_slot(cords, slot, of) {
  // For multiple tokens on same squares
  // e.g. for 3 on same square we get slot/of
  // 0/3
  // 1/3
  // 2/3
  // 3/3
  if (of === 2) {
    if (slot === 0) {
      return [cords[0] - 25, cords[1]]
    }
    return [cords[0] + 25, cords[1]]
  }
  if (of === 3) {
    if (slot === 0) {
      return [cords[0] - 25, cords[1]]
    }
    if (slot === 1) {
      return [cords[0] + 25, cords[1]]
    }
    return [cords[0], cords[1] + 25]
  }
  if (of === 4) {
    if (slot === 0) {
      return [cords[0] - 25, cords[1]-10]
    }
    if (slot === 1) {
      return [cords[0] + 25, cords[1]-10]
    }
    if (slot === 2) {
      return [cords[0] - 25, cords[1] + 20]
    }
    return [cords[0] + 25, cords[1] + 20]
  }
  if (of === 5) {
    if (slot === 0) {
      return [cords[0] - 25, cords[1]-10]
    }
    if (slot === 1) {
      return [cords[0] + 25, cords[1]-10]
    }
    if (slot === 2) {
      return [cords[0] - 25, cords[1] + 20]
    }
    if (slot === 3) {
      return [cords[0] + 25, cords[1] + 20]
    }
    return [cords[0], cords[1]]
  }
  if (of === 6) {
    if (slot === 0) {
      return [cords[0] - 25, cords[1]-10]
    }
    if (slot === 1) {
      return [cords[0] + 25, cords[1]-10]
    }
    if (slot === 2) {
      return [cords[0] - 25, cords[1] + 20]
    }
    if (slot === 3) {
      return [cords[0] + 25, cords[1] + 20]
    }
    if (slot === 4) {
      return [cords[0], cords[1] - 10]
    }
    return [cords[0], cords[1] + 20]
  }

  function getRandomInt(min = -10, max = 25) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // Max is 16!
  // If we have more than 6 counters on a square, place them all randomly

  return [cords[0] + getRandomInt(-25, 25), cords[1] + getRandomInt(-10, 25)]
}

function coords_to_translate(coords) {
  return 'translate(' + coords[0].toString() + ',' + coords[1].toString() + ')'
}

function get_start_square_cords(player_id, square_num) {
  var x_offset = 0
  var y_offset = 0
  if ([1,3].includes(square_num)) {
    y_offset = 200
  }
  if ([2,3].includes(square_num)) {
    x_offset = 200
  }
  if (player_id === '1') {
    return [x_offset-550, y_offset+350]
  }
  if (player_id === '2') {
    return [x_offset-550, y_offset-550]
  }
  if (player_id === '3') {
    return [x_offset+350, y_offset-550]
  }
  return [x_offset+350, y_offset+350]
}

function get_finish_square_cords(player_id, tile_num) {
  if (player_id === '1') {
    return [0, ((4-tile_num) * 100) + 200]
  }
  if (player_id === '2') {
    return [-1 * ((4-tile_num) * 100) - 200, 0]
  }
  if (player_id === '3') {
    return [0, -1 * (((4-tile_num) * 100) + 200)]
  }
  return [((4-tile_num) * 100) + 200, 0]
}

function get_end_square_cords(player_id, tile_num) {
    if (player_id === '1') {
      return [(tile_num * 50) - 75, 110]
    }
    if (player_id === '3') {
      return [(tile_num * 50) - 75, -110]
    }
    if (player_id === '2') {
      // 0 100 200 300  (* 50)
      // -150 -50 50 150 (- 75)
      return [-110, (tile_num * 50) - 75]
    }
    return [110, (tile_num * 50) - 75]
}

function get_circle_square_coords(square_num) {
  // Top left coord returned
  var left = -150
  var top = 650
  if (square_num < 5) {
    top = 150 + (100 * (4-square_num))
  } else if (square_num < 11) {
    top = 50
    left = (100 * (10-square_num) - 750)
  } else if (square_num < 12) {
    top = -50
    left = -750
  } else if (square_num < 18) {
    top = -150
    left = (100 * square_num) - 1950
  } else if (square_num < 24) {
    top = (100 * (24-square_num)) - 850
    left = -150
  } else if (square_num < 25) {
    top = -750
    left = -50
  } else if (square_num < 31) {
    left = 50
    top = (100*(square_num-31))-150
  } else if (square_num < 37) {
    left = 750 + ((square_num-37)*100)
    top = -150
  } else if (square_num < 38) {
    top = -50
    left = 650
  } else if (square_num < 44) {
    top = 50
    left = 50 + ((44-square_num)*100)
  } else if (square_num < 50) {
    top = 750 + ((square_num - 50) * 100)
    left = 50
  } else if (square_num < 51) {
    top = 650
    left = -50
  }
  return [left + 50, top+50]
  //return (left + 50).toString() + ',' + (top + 50).toString()
}

export default {
  get_square_coords_from_id: get_square_coords_from_id,
  coords_to_translate: coords_to_translate,
  get_circle_square_coords: get_circle_square_coords,
  adjust_square_coords_for_slot: adjust_square_coords_for_slot
}
