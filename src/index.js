import './styles.css';
const tileDisplay = document.querySelector('.tile-container');
const keyboard = document.querySelector('.key-container');
const messageDisplay = document.querySelector('.message-container');
const elMsg = document.querySelector('.message-clue-container');

console.log('keyboard', keyboard);

let wordle;

async function getWordle() {
  try {
    let response = await fetch('/word');
    let singleWord = await response.json();

    wordle = singleWord.toUpperCase();
    console.log('wordle', response);
    getDefinition(wordle);
  } catch (error) {
    console.log('messgae error', error);
  }
}

getWordle();

async function getDefinition(searchingWord) {
  console.log('searchingWord', searchingWord.toLowerCase());
  let meddilware = searchingWord.toLowerCase();
  try {
    let response = await fetch(`/definition/?word=${searchingWord}`);
    let definition = await response.json();

    console.log('definition', response);
    const result = definition.replaceAll('(nou)', '&&').toUpperCase();
    addMessageClue(result);
  } catch (error) {
    console.log(error);
  }
}

const keys = [
  'Q',
  'W',
  'E',
  'R',
  'T',
  'Y',
  'U',
  'I',
  'O',
  'P',
  'A',
  'S',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'ENTER',
  'Z',
  'X',
  'C',
  'V',
  'B',
  'N',
  'M',
  '<<',
];

const guessRows = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
];
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

guessRows.forEach((guessRow, guessRowIndex) => {
  const rowElement = document.createElement('div');
  rowElement.setAttribute('id', 'guessRow-' + guessRowIndex);

  guessRow.forEach((guess, guessIndex) => {
    const tileElement = document.createElement('div');
    tileElement.setAttribute('id', 'guessRow-' + guessRowIndex + '-tile-' + guessIndex);
    tileElement.classList.add('tile');
    rowElement.append(tileElement);
  });

  tileDisplay.append(rowElement);
});

keys.forEach(key => {
  const buttonElement = document.createElement('button');
  buttonElement.textContent = key;
  buttonElement.setAttribute('id', key);
  buttonElement.addEventListener('click', () => handleClick(key));
  keyboard.append(buttonElement);
});
const handleClick = letter => {
  if (!isGameOver) {
    if (letter === '<<') {
      deleteLetter();

      return;
    }

    if (letter === 'ENTER') {
      checkRow();

      return;
    }
    addLetter(letter);
  }
};

const addLetter = letter => {
  if (currentTile < 5 && currentRow < 6) {
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);

    tile.textContent = letter;
    guessRows[currentRow][currentTile] = letter;
    tile.setAttribute('data', letter);
    currentTile++;
  }
};

const deleteLetter = () => {
  if (currentTile > 0) {
    currentTile--;
    const tile = document.getElementById('guessRow-' + currentRow + '-tile-' + currentTile);

    tile.textContent = '';
    guessRows[currentRow][currentTile] = '';
    tile.setAttribute('data', '');
  }
};

const checkRow = () => {
  const guess = guessRows[currentRow].join('');

  if (currentTile > 4) {
    fetch(`/check/?word=${guess}`)
      .then(response => response.json())
      .then(json => {
        if (json == 'Entry word not found') {
          showMessage('word not in list');
          return;
        }
      });

    flipTitle();

    if (wordle === guess) {
      showMessage('Magnificent!');
      elMsg.parentNode.removeChild(elMsg);
      isGameOver = true;
      return;
    } else {
      if (currentRow >= 5) {
        isGameOver = true;
        showMessage('Game Over');
        return;
      }

      if (currentRow < 5) {
        currentRow++;
        currentTile = 0;
        return;
      }
    }
  }
};

const showMessage = message => {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageElement.style.marginBottom = '50px';

  messageDisplay.append(messageElement);
  messageDisplay.style.marginTop = '25px';
  messageDisplay.style.marginBottom = '25px';

  setTimeout(() => {
    messageDisplay.removeChild(messageElement);
    messageDisplay.style.marginTop = '0px';
    messageDisplay.style.marginBottom = '0px';
  }, 2000);
};

const addColorToKey = (keyLetter, color) => {
  const key = document.getElementById(keyLetter);

  key.classList.add(color);
};

const flipTitle = () => {
  const rowTiles = document.querySelector('#guessRow-' + currentRow).childNodes;
  let checkWordle = wordle;
  const guess = [];

  rowTiles.forEach(tile => {
    guess.push({ letter: tile.getAttribute('data'), color: 'grey-overlay' });
  });

  guess.forEach((guess, index) => {
    if (guess.letter === wordle[index]) {
      guess.color = 'green-overlay';
      checkWordle = checkWordle.replace(guess.letter, '');
    }
  });

  guess.forEach(guess => {
    if (checkWordle.includes(guess.letter)) {
      guess.color = 'yellow-overlay';
      checkWordle = checkWordle.replace(guess.letter, '');
    }
  });

  rowTiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add('flip');
      tile.classList.add(guess[index].color);
      addColorToKey(guess[index].letter, guess[index].color);
    }, 500 * index);
  });
};

// ADD CLUES
function addMessageClue(message) {
  const cretEl = document.createElement('p');
  const imgEl = document.createElement('img');

  cretEl.style.color = '#b59f3a';

  if (Boolean(message)) {
    cretEl.textContent = message;
    elMsg.append(cretEl);
  } else {
    imgEl.src = './img/dog-photo.png';
    elMsg.style.width = '180px';
    elMsg.append(imgEl);
  }
}
