import constants from './constants.js'
import * as d3 from 'd3'
import draw_token from './draw_token.js'
import board_get_locations from './board_get_locations.js'

const show_debug = false

export default function draw_board(root, clickBoardItem, tabletop_mode) {
  const group = root.append('g')

  const phone_ratio_border_rect = root
    .append('rect')
    .attr('width', 1500)
    .attr('height', 1500)
    .attr('x', -750)
    .attr('y', -750)
    .attr('style', 'fill: lightgrey;stroke-width:5;stroke:rgb(0,0,0)')

    player_base(root, -750, 150, constants.players['1'], clickBoardItem, tabletop_mode)
    player_base(root, -750, -750, constants.players['2'], clickBoardItem, tabletop_mode)
    player_base(root, 150, -750, constants.players['3'], clickBoardItem, tabletop_mode)
    player_base(root, 150, 150, constants.players['4'], clickBoardItem, tabletop_mode)

    middle_box(root)

    player_zone(root, constants.players['1'], 'rotate(0)', clickBoardItem, 44)
    player_zone(root, constants.players['2'], 'rotate(90)', clickBoardItem, 5)
    player_zone(root, constants.players['3'], 'rotate(180)', clickBoardItem, 18)
    player_zone(root, constants.players['4'], 'rotate(270)', clickBoardItem, 31)

    //Stars can not be rotated - so add them seperatly
    add_stars(root)

    player_dice(root, constants.players['1'], clickBoardItem)
    player_dice(root, constants.players['2'], clickBoardItem)
    player_dice(root, constants.players['3'], clickBoardItem)
    player_dice(root, constants.players['4'], clickBoardItem)

    draw_tokens(root)

    draw_player_finished(root, -750, 150, constants.players['1'], tabletop_mode)
    draw_player_finished(root, -750, -750, constants.players['2'], tabletop_mode)
    draw_player_finished(root, 150, -750, constants.players['3'], tabletop_mode)
    draw_player_finished(root, 150, 150, constants.players['4'], tabletop_mode)

    //optional
    if (show_debug) {
      draw_square_ids(root)
      draw_start_space_ids(root)
      draw_finish_space_ids(root)
      draw_end_space_ids(root, true)
    }
}

function player_base(root, left, top, player_data, clickBoardItem, tabletop_mode) {
  const big_rect = root
    .append('rect')
    .attr('width', 600)
    .attr('height', 600)
    .attr('x', left)
    .attr('y', top)
    .attr('style', 'fill: ' + player_data.colour + ';stroke-width:1;stroke:rgb(0,0,0)')

    const big_rect2 = root
      .append('rect')
      .attr('width', 500)
      .attr('height', 500)
      .attr('x', left + 50)
      .attr('y', top + 50)
      .attr('style', 'fill: none;stroke-width:25;stroke:rgb(0,0,0); display: none')
      .attr('id', 'p' + player_data.id + 'bigrect')


  const little_rect = root
    .append('rect')
    .attr('width', 400)
    .attr('height', 400)
    .attr('x', left + 100)
    .attr('y', top + 100)
    .attr('style', 'fill: white;stroke-width:1;stroke:rgb(0,0,0)')

  function piece_spot(cx, cy, id, clickBoardItem) {
    const clickBoardItemLocal = function () {
      clickBoardItem(id)
    }
    const circle = root
      .append('circle')
      .attr('r', 60)
      .attr('cx', left + cx)
      .attr('cy', top + cy)
      .attr('style', 'fill: ' + player_data.colour + ';stroke-width:1;stroke:rgb(0,0,0)')
      .on('click', clickBoardItemLocal)
      .attr('id', id)

  }
  piece_spot(200, 200, 'p' + player_data.id + 's0', clickBoardItem)
  piece_spot(200, 400, 'p' + player_data.id + 's1', clickBoardItem)
  piece_spot(400, 200, 'p' + player_data.id + 's2', clickBoardItem)
  piece_spot(400, 400, 'p' + player_data.id + 's3', clickBoardItem)

  var text_y = top + 50
  if (player_data.bottom_text) {
    text_y += 500
  }
  const behindtextrect = root
    .append('rect')
    .attr('width', 600 - 200)
    .attr('height', 80)
    .attr('x', left + 100)
    .attr('y', text_y - 50 + 10)
    .attr('style', 'fill: ' + player_data.colour + ';stroke-width:0;stroke:rgb(0,0,0)')
  const text = root
    .append('text')
    .attr('id', 'p' + player_data.id + 'name')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .attr('x', left + 300)
    .attr('y', text_y)
    .attr('style', 'font-size: 60px; font-weight: 400;')
    .text(d => (player_data.name).toString())

  if (tabletop_mode && !player_data.bottom_text) {
    text.attr('transform', 'rotate( 180 ' + (left+300).toString() + ' ' + text_y.toString() + ' )')
  }

}

function middle_box(root) {
  const tmp = root
    .append('rect')
    .attr('width', 300)
    .attr('height', 300)
    .attr('x', -150)
    .attr('y', -150)
    .attr('style', 'fill: white;stroke-width:1;stroke:rgb(0,0,0)')

    const p1_sector = root
      .append('polygon')
      .attr('points', '0,0 150,150 -150,150')
      .attr('style', 'fill: ' + constants.players['1'].colour + ';stroke-width:1;stroke:rgb(0,0,0)')
    const p2_sector = root
      .append('polygon')
      .attr('points', '0,0 -150,150 -150,-150')
      .attr('style', 'fill: ' + constants.players['2'].colour + ';stroke-width:1;stroke:rgb(0,0,0)')
    const p3_sector = root
      .append('polygon')
      .attr('points', '0,0 -150,-150 150,-150')
      .attr('style', 'fill: ' + constants.players['3'].colour + ';stroke-width:1;stroke:rgb(0,0,0)')
    const p4_sector = root
      .append('polygon')
      .attr('points', '0,0 150,-150 150,150')
      .attr('style', 'fill: ' + constants.players['4'].colour + ';stroke-width:1;stroke:rgb(0,0,0)')
}

function player_zone(root, player_data, transform, clickBoardItem, start_id_num) {
    const group = root.append('g')
      .attr('transform', transform)

    function square(x, y, filled, arrow, id) {
      const clickBoardItemLocal = function () {
        clickBoardItem(id)
      }

      let squarecolor = 'white'
      if (filled) {
        squarecolor = player_data.colour
      }
      const square_top = (y * 100) + 150
      const square_left = (x * 100) - 150
      const square_group = group.append('g')
        .attr('transform', 'translate( ' + square_left.toString() + ' ' + square_top.toString() + ')')
        .on('click', clickBoardItemLocal)
        .attr('id', id)

      const rect = square_group
        .append('rect')
        .attr('width', 100)
        .attr('height', 100)
        .attr('x', 0)
        .attr('y', 0)
        .attr('style', 'fill: ' + squarecolor + ';stroke-width:1;stroke:rgb(0,0,0)')
      if (arrow) {
        const arrow = square_group
          .append('polygon')
          .attr('points', '50,10 90,50 65,50 65,90 35,90 35,50 10,50')
          .attr('style', 'fill: ' + player_data.colour + ';stroke-width:1;stroke:rgb(0,0,0)')

      }
    }
    for (var y=0; y<6; y++) {
      for (var x=0; x<3; x++) {
        var filled = x===1
        if ((y==4) && (x!==2)) {
          filled = true
        }
        if (y===5) {
          filled = false
        }
        square(x,y, filled, (x===1 && y===5), get_square_id(x, y, start_id_num, player_data.id))
      }
    }
}

function get_square_id (x, y, start_id_num, player_id) {
  if (x==1) {
    if (y<5) {
      return 'p' + player_id + 'f' + (4-y).toString()
    }
    return 'l' + (start_id_num+6).toString()
  }
  if (x==2) {
    return 'l' + (start_id_num + y).toString()
  }
  if (x==0) {
    return 'l' + ((start_id_num + (5-y) + 7) % 52).toString()
  }
  console.log('Warning square id not returned', player_id, start_id_num)
  return 'ERROR'
}

function add_stars(root) {

  constants.safe_squares.map(function (num) {
    const coords = board_get_locations.get_circle_square_coords(num)
    const group = root.append('g')
      .attr('transform', 'translate(' + (coords[0]-50).toString() + ',' + (coords[1]-50).toString() + ')')
      .attr('pointer-events', 'none')

    const star = group
      .append('polygon')
      .attr('points', '50,5 61.8,35.1 95.1,35.1 67.6,57.6 78.5,90.5 50,70 21.5,90.5 32.4,57.6 4.9,35.1 38.2,35.1')
      .attr('style', 'fill: white;stroke-width:1;stroke:rgb(0,0,0)')
  })
}

function draw_square_ids(root) {
  for (var c=0; c<52; c++) {
    const id = 'l' + c.toString()
    const group = root.append('g')
      .attr('transform', board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(id)))
      .attr('pointer-events', 'none')

    const text = group
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('x', 0)
      .attr('y', 0)
      .attr('style', 'font-size: 70px; font-weight: 200;')
      .text(d => id)
  }
}

function draw_start_space_ids(root) {
  for (var p=1; p<5; p++) {
    for (var num=0;num<4;num++) {
      const id = 'p' + p.toString() + 's' + num.toString()

      const group = root.append('g')
        .attr('transform', board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(id)))
        .attr('pointer-events', 'none')

      const text = group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('x', 0)
        .attr('y', 0)
        .attr('style', 'font-size: 70px; font-weight: 200;')
        .text(d => id)
    }
  }
}

function draw_finish_space_ids(root) {
  for (var p=1; p<5; p++) {
    for (var num=0;num<5;num++) {
      const id = 'p' + p.toString() + 'f' + num.toString()

      const group = root.append('g')
        .attr('transform', board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(id)))
        .attr('pointer-events', 'none')

      const text = group
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
        .attr('x', 0)
        .attr('y', 0)
        .attr('style', 'font-size: 70px; font-weight: 200;')
        .text(d => id)
    }
  }
}

function draw_end_space_ids(root, use_circles) {
  for (var p=1; p<5; p++) {
    for (var num=0;num<4;num++) {
      const id = 'p' + p.toString() + 'e' + num.toString()

      const group = root.append('g')
        .attr('transform', board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id(id)))
        .attr('pointer-events', 'none')

      if (use_circles) {
        const circle = group
          .append('circle')
          .attr('r', 30)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('style', 'fill: black;stroke-width:1;stroke:rgb(0,0,0)')

      } else {
        const text = group
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .attr('x', 0)
          .attr('y', 0)
          .attr('style', 'font-size: 70px; font-weight: 200;')
          .text(d => id)
      }

    }
  }
}

function player_dice(root, player_data, clickBoardItem) {
  const id = 'p' + player_data.id + 'dice'
  const clickBoardItemLocal = function () {
    clickBoardItem(id)
  }
  var x_cord = -450
  var y_cord = 1010
  if (['2', '3'].includes(player_data.id)) {
    y_cord = -1010
  }
  if (['3', '4'].includes(player_data.id)) {
    x_cord = 450
  }

  const group = root.append('g')
    .on('click', clickBoardItemLocal)
    .attr('transform', 'translate( ' + x_cord.toString() + ' ' + y_cord.toString() + ' )')

    const big_rect_border = group
      .append('rect')
      .attr('width', 350)
      .attr('height', 350)
      .attr('x', -175)
      .attr('y', -175)
      .attr('style', 'fill: none;stroke-width:5;stroke:rgb(0,0,0)')

      const big_rect = group
        .append('rect')
        .attr('width', 350)
        .attr('height', 350)
        .attr('x', -175)
        .attr('y', -175)
        .attr('style', 'fill: ' + player_data.colour + ';stroke-width:0;stroke:rgb(0,0,0)')
        .attr('id', id)

    function pad(num, size) {
        var s = "000000000" + num.toString();
        return s.substr(s.length-size);
    }

    for (var imgnum =1; imgnum<(constants.number_of_dice_images+1); imgnum++) {
      const img = group
        .append('svg:image')
        .attr('x', -100)
        .attr('y', -100)
        .attr('width', 200)
        .attr('height', 200)
        .attr('xlink:href', '/dice_' + pad(imgnum,2) + '.png')
        .attr('id', id + '_' + pad(imgnum,2))
        .style('display', 'none')
    }

    // const blank_dice = d3.select('#' + id + '_12')
    // blank_dice.style('display', 'unset')

}

function draw_tokens (root) {
  const token_group = root.append('g')
  Object.keys(constants.players).map(function (player_key) {
    draw_player_tokens (token_group, constants.players[player_key])
  })
}

function draw_player_tokens (root, player_data) {
  const player_token_group = root.append('g')
    .attr('id', 'p' + player_data.id + 'tokens')

  const styles = ['cylinder', 'gem', 'pawn', 'coin', 'stacked']
  for (var t=0;t<4;t++) {
    const transform = board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id('p' + player_data.id + 's' + t.toString()))
    draw_token.draw_token(player_token_group, player_data.token_colour, 'p' + player_data.id + 't' + t.toString(), transform, styles[2])
    // const transform2 = board_get_locations.coords_to_translate(board_get_locations.get_square_coords_from_id('l' + (t+31).toString()))
    // draw_token.draw_token(player_token_group, player_data.token_colour, 'p' + player_data.id + 't' + t.toString(), transform2, styles[2])
  }
}

function draw_player_finished(root, left, top, player_data, tabletop_mode) {
  const id = 'p' + player_data.id + 'finished'
  const group = root.append('g')
    .attr('id', id)
    .style('display', 'none')

  const main_square_group = group.append('g')
    .attr('id', id + 'mainsquaregroup')
  if (tabletop_mode && !player_data.bottom_text) {
    main_square_group.attr('transform', 'rotate( 180 ' + (left+300).toString() + ' ' + (top+300).toString() + ' )')
  }

  const little_rect = main_square_group
    .append('rect')
    .attr('width', 400)
    .attr('height', 400)
    .attr('x', left + 100)
    .attr('y', top + 100)
    .attr('style', 'fill: white;stroke-width:1;stroke:rgb(0,0,0); opacity: 0.5;')

    const text = main_square_group
      .append('text')
      .attr('id', id + 'text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'central')
      .attr('x', left + 300)
      .attr('y', top + 300)
      .attr('style', 'font-size: 260px; font-weight: 400;')
      .text(d => (constants.position_strings[0]).toString())

}
