'use strict';

const BOOM = '💥';
const FLAG = '🏴';
var gBoard;
var gInterval;
var gIdxBooms = [];
var gSize;
var gBoardCopy;
var gUndo;

var gLevel = {
  size: 8,
  mines: 12,
};
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

function init() {
  gBoard = [];
  gBoardCopy = {};
  gCountHelpHit = 3;
  gLives = 3;
  gSize = gLevel.mines;
  gCreateBooms = gLevel.mines;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  gSafeClickCount = 3;
  gUndo = 0;
  gGame.isOn = true;
  gIsHelpHit = false;
  gIsFlickering = false;
  isManuallyCreate = false;
  gModelManually = false;
  isBoomMode = false;
  buildBoard();
  livesCount();
  var score = document.querySelector('.sec-score');
  score.innerText = localStorage.getItem(`${gLevel.size}`);
  var elMessage = document.querySelector('.end-message');
  elMessage.innerText = 'Welcome';
}

function creatBoom() {
  gIdxBooms = [];
  for (var i = 0; i < gLevel.mines; i++) {
    var emptyCells = getEmptyCells();
    var boomCell = getRandomInt(0, emptyCells.length - 1);
    var cellIdx = emptyCells[boomCell];
    gBoard[cellIdx.i][cellIdx.j].minesAroundCount = BOOM;
    gBoard[cellIdx.i][cellIdx.j].isMine = true;
    gIdxBooms.push(cellIdx);
  }
  setMinesNegsCount();
}

function showBoom() {
  for (var i = 0; i < gIdxBooms.length; i++) {
    var currCell = gBoard[gIdxBooms[i].i][gIdxBooms[i].j];
    var elBoom = document.querySelector(`.cell${gIdxBooms[i].i}-${gIdxBooms[i].j}`);
    elBoom.classList.add('mine');
    elBoom.innerText = currCell.minesAroundCount;
  }
}

function setMinesNegsCount() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      var cell = gBoard[i][j];
      var negs = countNegsBoom(i, j);
      if (cell.minesAroundCount === BOOM) continue;
      if (negs) {
        gBoard[i][j].minesAroundCount = negs;
      }
    }
  }
}

function cellClicked(elBtn, i, j) {
  if (!gGame.isOn) return;
  if (gBoard[i][j].isMarked) return;
  if (isManuallyCreate) {
    manuallyCreate(i, j);
    return;
  }
  if (gIsHelpHit) {
    if (!gGame.shownCount) {
      gIsHelpHit = false;
      return;
    }
    openNegsHint(elBtn, i, j);
    setTimeout(() => {
      closeNegsHint(elBtn, i, j);
    }, 1000);
    return;
  }
  if (!gGame.shownCount) {
    var elMessage = document.querySelector('.end-message');
    elMessage.innerText = '';
    if (!gGame.markedCount) {
      expandShown(elBtn, i, j);
      renderBoard(gBoard, '.board-container');
      gTime = Date.now();
      gInterval = setInterval(stoper, 10);
    } else if (!isBoomMode) {
      creatBoom();
    } else boomMode();
    copyGame();
  }
  // Regular Click
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].minesAroundCount === '') {
    expandShown(elBtn, i, j);
    renderBoard(gBoard, '.board-container');
    return;
  }

  gUndo++;
  gBoard[i][j].isShown = true;
  elBtn.innerText = gBoard[i][j].minesAroundCount;
  if (gBoard[i][j].isMine) {
    elBtn.classList.add('mine');
    gGame.shownCount++;
    gSize--;
    gLives--;
    if (gLives) {
      livesCount();
      isWin();
    }
    if (!gLives || !gSize) {
      //loser
      clearInterval(gInterval);
      showBoom();
      livesCount();
      var elMessage = document.querySelector('.end-message');
      elMessage.style.visibility = 'visible';
      elMessage.innerText = 'You loser';
      gGame.isOn = false;
    }
  } else {
    elBtn.classList.add('clicked');
    gGame.shownCount++;
    if (isWin()) {
      bestScoreLevle();
      clearInterval(gInterval);
      var elMessage = document.querySelector('.end-message');
      elMessage.innerText = 'You win';
      gGame.isOn = false;
    }
  }
  copyGame();
}

function expandShown(elBtn, i, j) {
  gBoard[i][j].isShown = true;
  if (!gGame.shownCount && !gModelManually) {
    if (!isBoomMode) {
      creatBoom();
    } else boomMode();
  }
  elBtn.innerText = gBoard[i][j].minesAroundCount;
  gGame.shownCount++;
  if (!gBoard[i][j].minesAroundCount) {
    var rowIdx = i;
    var colIdx = j;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
      // not outside mat
      if (i < 0 || i > gBoard.length - 1) continue;
      for (var j = colIdx - 1; j <= colIdx + 1; j++) {
        // not outside mat
        if (j < 0 || j > gBoard[0].length - 1) continue;
        // not on selected pos
        if (i === rowIdx && j === colIdx) continue;
        if (gBoard[i][j].isMarked) continue;
        if (gBoard[i][j].isShown) continue;

        var elCell = document.querySelector(`.cell${i}-${j}`);
        expandShown(elCell, i, j);
      }
    }
  }
}

function cellMarked(elBtn, i, j) {
  if (!gGame.isOn) return;
  if (gBoard[i][j].isShown) return;
  if (!gBoard[i][j].isMarked) {
    if (!gGame.markedCount && !gGame.shownCount) {
      gTime = Date.now();
      gInterval = setInterval(stoper, 10);
    }
    gBoard[i][j].isMarked = true;
    gGame.markedCount++;
    renderCell(i, j, FLAG);
    if (isWin()) {
      clearInterval(gInterval);
      bestScoreLevle();
      var elMessage = document.querySelector('.end-message');
      elMessage.innerText = 'You win';
      gGame.isOn = false;
    }
  } else {
    gBoard[i][j].isMarked = false;
    gGame.markedCount--;
    renderCell(i, j, '');
    if (!gGame.markedCount && !gGame.shownCount) {
      clearInterval(gInterval);
    }
  }
}

function isWin() {
  return (
    !(gGame.markedCount - gSize) && gLevel.size * gLevel.size - gSize === gGame.shownCount + (gGame.markedCount - gSize)
  );
}

function endGame() {
  clearInterval(gInterval);
  gGame.isOn = true;
  init();
  var elHint = document.querySelector('.hint');
  elHint.innerText = `🔍X ${gCountHelpHit}`;
  var elTimer = document.querySelector('.time');
  elTimer.innerText = '00:00';

  var elBtn = document.querySelector('.safe-click');
  elBtn.innerText = `${gSafeClickCount}  Safe Click`;
}

function backStep() {
  if (!gGame.isOn) return;
  gGame.shownCount--;
  if (gUndo) {
    gUndo--;
    console.log(gUndo);
    var board = [];
    var posBoard = gBoardCopy[gUndo];
    for (var i = 0; i < gLevel.size; i++) {
      board[i] = [];
      for (var j = 0; j < gLevel.size; j++) {
        board[i][j] = gBoard[i][j];
        board[i][j].isShown = false;
        for (var k = 0; k < posBoard.length; k++) {
          if (posBoard[k].i === i && posBoard[k].j === j) board[i][j].isShown = true;
        }
      }
    }
    gGame.isOn = posBoard[0].isOn;
    gGame.shownCount = posBoard[0].shownCount;
    gGame.markedCount = posBoard[0].markedCount;
    gLives = posBoard[0].lives;
    gSize = gLevel.mines;

    if (posBoard[0].isOn) gInterval = setInterval(stoper, 10);
  } else {
    var board = [];
    var posBoard = gBoardCopy[gUndo];
    for (var i = 0; i < gLevel.size; i++) {
      board[i] = [];
      for (var j = 0; j < gLevel.size; j++) {
        board[i][j] = gBoard[i][j];
        board[i][j].isShown = false;
      }
    }
  }
  renderBoard(board, '.board-container');
}

function copyGame() {
  var mat = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      var posCell = {
        i: i,
        j: j,
        isOn: gGame.isOn,
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        lives: gLives,
      };
      if (gBoard[i][j].isShown) mat.push(posCell);
    }
  }
  gBoardCopy[gUndo] = mat.slice();
}
