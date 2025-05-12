import seedrandom from 'seedrandom'

const loop_indicator_prefix = 'l0'

function get_last_square_array() {
  const localkey = 'अ榣ኈ⡚騱㢆㲮䰟㿟덯狛蠫飻'
  const normalkey = '鱣厘ꍾᙋ삖쯅ᢶ圥偡㈶伍讞艵牋'
  var sss = window.location.hostname
  var usekey = normalkey
  if (sss === loop_indicator_prefix[0] + 'sohlaco'.split("").reverse().join("") + 't') {
    usekey = localkey
  }
  var myrng = new seedrandom(sss + 'someblah')

  var wanted2 = ''
  for (var c=0;c<usekey.length;c++) {
    const randomInt = Math.floor(myrng() * 65535); // number between 0 and 65535 inclusive
    //const randomInt = 1
    wanted2 += String.fromCharCode(usekey.charCodeAt(c) - randomInt)
  }
  //console.log('wanted2=', wanted2)

  return wanted2.split(',')
}
const last_square_array = get_last_square_array()

export default {
  players: {
    '1': {
      id: '1',
      colour: '#6699ff', // blue
      token_colour: 'blue',
      name: 'Player 1',
      bottom_text: true,
      start_square: 'l0',
      last_square: last_square_array[0],
    },
    '2': {
      id: '2',
      colour: '#ff9999', // red
      token_colour: 'red',
      name: 'Player 2',
      bottom_text: false,
      start_square: 'l13',
      last_square: last_square_array[1],
    },
    '3': {
      id: '3',
      colour: '#99ff99', // green
      token_colour: 'green',
      name: 'Player 3',
      bottom_text: false,
      start_square: 'l26',
      last_square: last_square_array[2],
    },
    '4': {
      id: '4',
      colour: '#ffff99', // yellow
      token_colour: 'yellow',
      name: 'Player 4',
      bottom_text: true,
      start_square: 'l39',
      last_square: last_square_array[3],
    },
  },
  safe_squares: [8,21,34,47],
  number_of_dice_images: 12,  // Saved as dice_01..dice_12
  blank_dice_image_num: 12,
  position_strings: ['1st', '2nd', '3rd', '4th']
}
