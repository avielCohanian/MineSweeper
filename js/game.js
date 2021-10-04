'use strict'


const BOOM = '💥'
const FLAG = '🏴‍☠️'
var gBoard;
var gBoom;
var gLevel = {
    size: 4,
    mines: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}




function init() {
    gBoard = []
    buildBoard()
    gBoom = 0
}





function buildBoard() {
    var mat = []
    for (var i = 0; i < gLevel.size; i++) {
        mat[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            mat[i][j] = {
                minesAroundCount: '',
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    gBoard = mat
    renderBoard(gBoard, '.board-container')
}

function creatBoom() {
    // gBoard[1][1].minesAroundCount = BOOM
    // gBoard[1][1].isMine = true

    for (var i = 0; i < gLevel.mines; i++) {
        var emptyCells = getEmptyCells()
        var boomCell = getRandomInt(0, emptyCells.length - 1)
        var cellIdx = emptyCells[boomCell]
        gBoard[cellIdx.i][cellIdx.j].minesAroundCount = BOOM
        console.log(cellIdx);
        gBoard[cellIdx.i][cellIdx.j].isMine = true
        //    console.log(gBoard[cellIdx.i][cellIdx.j]);
    }
    setMinesNegsCount()
}


function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            var negs = countNegsBoom(i, j)
            if (cell.minesAroundCount === BOOM) continue
            // console.log(negs);
            if (negs) {
                gBoard[i][j].minesAroundCount = negs
            }
        }
    }
}




function cellClicked(elBtn, i, j) {

    if (!gGame.shownCount) {
        expandShown(elBtn, i, j)
    }
    if (gBoard[i][j].isShown) return
    gBoard[i][j].isShown = true
    elBtn.innerText = gBoard[i][j].minesAroundCount
    if (gBoard[i][j].isMine) {
        elBtn.classList.add('mine')
    } else {
        elBtn.classList.add('clicked')
        gGame.shownCount++
        gBoard[i][j].isShown = true
    }
}


function expandShown(elBtn, i, j) {

    gBoard[i][j].isShown = true
    creatBoom()
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
                gBoard[i][j].isShown = true
                elBtn.innerText = gBoard[i][j].minesAroundCount
                gGame.shownCount++
            }
        }
    }
    renderBoard(gBoard, '.board-container')
}


function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        renderCell(i, j, FLAG)
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        renderCell(i, j, '')
    }

}


function changeSize(size , mines){

    gLevel.size = size
    gLevel.mines = mines
        init()
}