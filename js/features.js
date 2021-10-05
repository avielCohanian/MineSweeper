'use strict'
var emoji
var gTime
var gLives
var gCountHelpHit
var gIsHelpHit
var gFlickeringCount
var gSafeClickCount
var gIsFlickering
var isManuallyCreate
var gCreateBooms
var gModelManually 


function stoper() {
    var now = ((Date.now() - gTime) / 1000).toFixed(2)
    var elTimer = document.querySelector('.btn-level p');
    elTimer.innerText = now
}

function changeSize(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
    gGame.isOn = true
    clearInterval(gInterval)
    init()
}


function livesCount() {
    var livesEmoji = ''
    for (var i = 0; i < gLives; i++) {
        livesEmoji += '🍭'
    }
    var elLives = document.querySelector('.lives');
    elLives.innerText = livesEmoji
    // emoji = '🤕🥴🙁'
    if (gLives === 3) emoji = '😜'
    if (gLives === 2) emoji = '🙁'
    if (gLives === 1) emoji = '🥴'
    if (!gLives) emoji = '🤕'
    var elStatus = document.querySelector('.status-game button');
    elStatus.innerText = emoji
}



function openNegsHint(elBtn, i, j) {
    if (!gCountHelpHit) return
    gCountHelpHit--
    var elHint = document.querySelector('.hint');
    elHint.innerText = `🔍X ${gCountHelpHit}`

    var rowIdx = i
    var colIdx = j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // not outside mat
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // not outside mat
            if (j < 0 || j > gBoard[0].length - 1) continue;
            // not on selected pos
            var elBtn = document.querySelector(`.cell${i}-${j}`);
            elBtn.classList.add('clicked')
            elBtn.innerText = gBoard[i][j].minesAroundCount
        }
    }

}

function closeNegsHint(elBtn, i, j) {
    var rowIdx = i
    var colIdx = j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        // not outside mat
        if (i < 0 || i > gBoard.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            // not outside mat
            if (j < 0 || j > gBoard[0].length - 1) continue;
            if (gBoard[i][j].isShown === true) continue
            var elBtn = document.querySelector(`.cell${i}-${j}`);
            elBtn.classList.remove('clicked')
            elBtn.innerText = ''

        }
    }
    gIsHelpHit = false

}


function safeClick(elBtn) {
    if (!gGame.isOn) return
    if (!gSafeClickCount || gIsFlickering) return
    gIsFlickering = true
    var emptyCells = getEmptyCells()
    var randPos = getRandomInt(0, emptyCells.length - 1)
    var currEmptyCell = emptyCells[randPos]
    gSafeClickCount--
    console.log(gSafeClickCount);
    gFlickeringCount = 5
    var elCell = document.querySelector(`.cell${currEmptyCell.i}-${currEmptyCell.j}`);
    elCell.classList.add('safe-click-close')
    flickering(elCell)
    elBtn.innerText = `${gSafeClickCount}  Safe Click`

}





function flickering(elCell) {
    gFlickeringCount--
    setTimeout(() => {
        elCell.classList.remove('safe-click-close')
    }, 500);
    if (!gFlickeringCount) {
        gIsFlickering = false
        return
    }
    setTimeout(() => {
        elCell.classList.add('safe-click-close')
        flickering(elCell)
    }, 1000);
}



function manuallyCreate(i, j) {
    console.log(gModelManually);
    if (gBoard[i][j].isMine)return
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.classList.add('choose-boom')
    gCreateBooms--
    isManuallyCreate = true
    gBoard[i][j].minesAroundCount = BOOM
    gBoard[i][j].isMine = true
    gIdxBooms.push({i:i,j:j})
    
    setMinesNegsCount()
    setTimeout(() => {
        elCell.classList.remove('choose-boom')
    }, 1000);
    if (!gCreateBooms) isManuallyCreate = false
    var elMessage = document.querySelector('.end-message');
    elMessage.innerText = 'Start play'
}