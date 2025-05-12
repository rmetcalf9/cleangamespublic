import * as d3 from 'd3'

function draw_token(root, colour, tid, transform, style = 'cylinder') {
  const counter_group = root.append('g')
    .attr('id', tid)
    .attr('transform', transform)
    .attr('pointer-events', 'none')

  const rx = 40;
  const ry = 30;

  switch (style) {
    case 'cylinder': {
      // Side wall path
      counter_group.append('path')
        .attr('d', `
          M ${-rx},-10
          A ${rx},${ry} 0 0 1 ${rx},-10
          L ${rx},10
          A ${rx},${ry} 0 0 1 ${-rx},10
          Z
        `)
        .attr('fill', d3.color(colour).darker(0.5))
        .attr('stroke', 'black')
        .attr('stroke-width', 1);

      // Bottom ellipse
      counter_group.append('ellipse')
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('cx', 0)
        .attr('cy', 10)
        .attr('fill', d3.color(colour).darker(0.8))
        .attr('stroke', 'black');

      // Top ellipse
      counter_group.append('ellipse')
        .attr('rx', rx)
        .attr('ry', ry)
        .attr('cx', 0)
        .attr('cy', -10)
        .attr('fill', colour)
        .attr('stroke', 'black');
      break;
    }

    case 'gem': {
      const points = [
        [0, -40], [28, -28], [40, 0],
        [28, 28], [0, 40], [-28, 28],
        [-40, 0], [-28, -28]
      ].map(p => p.join(',')).join(' ');

      counter_group.append('polygon')
        .attr('points', points)
        .attr('fill', colour)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
      break;
    }

    case 'pawn': {
      // Body
      counter_group.append('ellipse')
        .attr('rx', 25)
        .attr('ry', 35)
        .attr('cy', -10)
        .attr('fill', colour)
        .attr('stroke', 'black');

      // Head
      counter_group.append('circle')
        .attr('r', 15)
        .attr('cy', -50)
        .attr('fill', d3.color(colour).darker(2.9))
        .attr('stroke', 'black');
      break;
    }

    case 'coin': {
      counter_group.append('circle')
        .attr('r', 40)
        .attr('fill', colour)
        .attr('stroke', 'black');

      counter_group.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '24px')
        .attr('fill', 'white')
        .text('★');
      break;
    }

    case 'stacked': {
      const layers = 3;
      for (let i = 0; i < layers; i++) {
        counter_group.append('ellipse')
          .attr('rx', 40)
          .attr('ry', 15)
          .attr('cy', i * -5)
          .attr('fill', d3.color(colour).darker(i * 0.3))
          .attr('stroke', 'black');
      }
      break;
    }

    default:
      console.warn(`Unknown token style: ${style}`);
  }
}

export default {
  draw_token: draw_token
}
