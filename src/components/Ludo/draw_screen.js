import * as d3 from 'd3'
import draw_board from './draw_board.js'

const aspect_ratio = 20 / 10

export default function draw_screen (viewObj, tabletop_mode) {

  var width = 800
  var height = width * aspect_ratio // Using pixel 8a ratio

  viewObj.svg = d3.create('svg')
    .attr('style', 'border: 1px solid black; height: calc(100vh - 60px); width: 100%;')
    .attr('viewBox', [-width / 2, -height / 2, width, height])
    .attr('oncontextmenu', 'return false;') // Not sure this line does anything

  const phone_ratio_border_rect = viewObj.svg
    .append('rect')
    .attr('width', 800)
    .attr('height', 800 * aspect_ratio)
    .attr('x', -400)
    .attr('y', -(800 * aspect_ratio)/2)
    .attr('style', 'fill: white;stroke-width:10;stroke:rgb(0,0,0)')

  const title_text = viewObj.svg
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .attr('x', 0)
    .attr('y', -(700 * aspect_ratio)/2)
    .attr('style', 'font-size: 180px; font-weight: 800;')
    .text(d => 'Ludo')

  var disp_str = 'none'
  if (tabletop_mode) {
    disp_str = 'unset'
  }

  const title_text2 = viewObj.svg
    .append('text')
    .attr('id', 'tabletoptitletext')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'central')
    .attr('x', 0)
    .attr('y', (700 * aspect_ratio)/2)
    .attr('style', 'font-size: 180px; font-weight: 800;')
    .text(d => 'Ludo')
    .attr('transform', 'rotate( 180 ' + (0).toString() + ' ' + ((700 * aspect_ratio)/2).toString() + ' )')
    .style('display', disp_str)

  const circle = viewObj.svg
    .append('circle')
    .attr('r', 30)
    .attr('cx', 350)
    .attr('cy', (-(750 * aspect_ratio)/2))
    .attr('style', 'fill: black;stroke-width:1;stroke:rgb(0,0,0)')
    .on('click', viewObj.restart_game)

  const board_world = viewObj.svg.append('g')
    .attr('transform', 'scale( 0.5 0.5 ) translate( 0 0)')
  draw_board(board_world, viewObj.clickBoardItem, tabletop_mode)

  return viewObj.svg.node()
}
