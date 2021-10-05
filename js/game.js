'use strict'


const BOOM = '💥'
const FLAG = '🏴'
var gBoard;
var gInterval
var gIdxBooms = []
var gSize
var gBoardCopy 
var gUndo



var gLevel = {
    size: 4,
    mines: 2
};
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}




function init() {
    gBoard = []
    gBoardCopy = [[]]
    gCountHelpHit = 3
    gLives = 3
    gSize = gLevel.mines
    gCreateBooms = gLevel.mines
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gSafeClickCount = 3
    gUndo = 0
    gGame.isOn = true
    gIsHelpHit = false
    gIsFlickering = false
    isManuallyCreate = false
    gModelManually = false
    buildBoard()
    livesCount()
}







function creatBoom() {
    gIdxBooms = []
    for (var i = 0; i < gLevel.mines; i++) {
        var emptyCells = getEmptyCells()
        var boomCell = getRandomInt(0, emptyCells.length - 1)
        var cellIdx = emptyCells[boomCell]
        console.log(cellIdx);
        gBoard[cellIdx.i][cellIdx.j].minesAroundCount = BOOM
        gBoard[cellIdx.i][cellIdx.j].isMine = true
        gIdxBooms.push(cellIdx)
    }
    setMinesNegsCount()
}


function showBoom() {

    for (var i = 0; i < gIdxBooms.length; i++) {
        var currCell = gBoard[gIdxBooms[i].i][gIdxBooms[i].j]
        var elBoom = document.querySelector(`.cell${gIdxBooms[i].i}-${gIdxBooms[i].j}`);
        elBoom.classList.add('mine')
        elBoom.innerText = currCell.minesAroundCount
    }

}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            var negs = countNegsBoom(i, j)
            if (cell.minesAroundCount === BOOM) continue
            if (negs) {
                gBoard[i][j].minesAroundCount = negs
            }
        }
    }
}




function cellClicked(elBtn, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (isManuallyCreate) {
        manuallyCreate(i, j)
        return
    }
    if (gIsHelpHit) {
        if (!gGame.shownCount) {
            gIsHelpHit = false
            return
        }
        openNegsHint(elBtn, i, j)
        setTimeout(() => {
            closeNegsHint(elBtn, i, j)
        }, 1000);
        return
    }
    if (!gGame.shownCount) {
        if (!gGame.markedCount) {
            expandShown(elBtn, i, j)
            renderBoard(gBoard, '.board-container')
            gTime = Date.now()
            gInterval = setInterval(stoper, 10);
        } else creatBoom()
    }
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isShown = true
    elBtn.innerText = gBoard[i][j].minesAroundCount
    if (gBoard[i][j].isMine) {
        elBtn.classList.add('mine')
        gGame.shownCount++
        gSize--
        gLives--
        if (gLives) {
            livesCount()
            isWin()
        }
        if (!gLives || !gSize) {
            //loser
            clearInterval(gInterval)
            showBoom()
            livesCount()
            var elMessage = document.querySelector('.end-message');
            elMessage.style.visibility = 'visible';
            elMessage.innerText = 'You loser'
            gGame.isOn = false
        }
    } else {
        elBtn.classList.add('clicked')
        gGame.shownCount++
        gBoard[i][j].isShown = true
        if (isWin()) {
            clearInterval(gInterval)
            var elMessage = document.querySelector('.end-message');
            elMessage.innerText = 'You win'
            gGame.isOn = false
        }
    }

    var mat = []
    for (var i = 0; i < gLevel.size; i++) {
        mat[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            mat[i][j] = gBoard[i][j]
        }
    }
    // gUndo++
    // gBoardCopy[gUndo]= mat.slice()
    // console.log(gBoardCopy);
}


function expandShown(elBtn, i, j) {
    gBoard[i][j].isShown = true
    if (!gGame.shownCount && !gModelManually) { creatBoom() }
    elBtn.innerText = gBoard[i][j].minesAroundCount
    gGame.shownCount++
    if (!gBoard[i][j].minesAroundCount) {
        var rowIdx = i
        var colIdx = j
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
                expandShown(elCell, i, j)

            }
        }

    }
}

function cellMarked(elBtn, i, j) {
    if (!gGame.isOn) return
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        if (!gGame.markedCount && !gGame.shownCount) {
            gTime = Date.now()
            gInterval = setInterval(stoper, 10);
        }
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        renderCell(i, j, FLAG)
        if (isWin()) {
            clearInterval(gInterval)
            var elMessage = document.querySelector('.end-message');
            elMessage.innerText = 'You win'
            gGame.isOn = false
        }
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        renderCell(i, j, '')
        if (!gGame.markedCount && !gGame.shownCount) { clearInterval(gInterval) }
    }

}

function isWin() {
    return ((!(gGame.markedCount - gSize)) && ((gLevel.size * gLevel.size) - gSize === gGame.shownCount + (gGame.markedCount - gSize)))

}

function endGame() {
    clearInterval(gInterval)
    gGame.isOn = true
    init()
    var elHint = document.querySelector('.hint');
    elHint.innerText = `🔍X ${gCountHelpHit}`
    var elTimer = document.querySelector('.btn-level p');
    elTimer.innerText = '00:00'

    var elBtn = document.querySelector('.safe-click');
    elBtn.innerText = `${gSafeClickCount}  Safe Click`
    console.log('end game');
}


// function backStep() {
//     // console.log('gBoard',gBoard);
//     // console.log('gBoardCopy',gBoardCopy);
//     gBoard = []
//     gBoard = gBoardCopy.pop()
//     console.log('gBoard', gBoard);
//     console.log('gBoardCopy',gBoardCopy);
//     // console.log('x',x);
//     // console.log(gBoard);
//     renderBoard(gBoard, '.board-container')
// }


