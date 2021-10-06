'use strict'


function buildBoard() {
    var board = []
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.size; j++) {
            board[i][j] = {
                minesAroundCount: '',
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    gBoard = board
    renderBoard(gBoard, '.board-container')
}


function renderBoard(mat, selector) {
    //המספר זה עובי דפנות התא  cellpadding="3"
    var strHTML = '<table class="boardGame" border="1"  ><tbody>';
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            var className = `cell cell${i}-${j}`;
            var show = ''
            if (cell.isMarked) show = FLAG
            if (cell.isShown) {
                if (cell.isMine) {
                    show = cell.minesAroundCount
                    className += ' mine'
                } else {
                    show = cell.minesAroundCount
                    className += ' clicked'
                }
            }
            strHTML += `<td oncontextmenu ="cellMarked(this,${i},${j})" onclick="cellClicked(this,${i},${j})" class="${className}">${show}  </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}





//פונקצית שכנים
function countNegsBoom(rowIdx, colIdx) {
    var count = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // not outside mat
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // not outside mat
            if (j < 0 || j > gBoard[0].length - 1) continue;
            // not on selected pos
            if (i === rowIdx && j === colIdx) continue;
            if (gBoard[i][j].minesAroundCount === BOOM) count++;
        }
    }
    return count;
}



function getEmptyCells() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if ((!gBoard[i][j].isShown) && (!gBoard[i][j].isMine)) {
                emptyCells.push({ i: i, j: j })
            }
        }
    }
    return emptyCells
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}



// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(i, j, value) {
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.innerHTML = value;
}

