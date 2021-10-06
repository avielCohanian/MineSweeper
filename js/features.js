'use strict'
const MINUTES = 1000 * 60
const SEC = 1000
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
var isBoomMode
var gNow
var gTimeBestScore


function stoper() {
    var message = ''
    var now = (Date.now() - gTime)
    var elTimer = document.querySelector('.time');
    if (now / 1000 < 60) {
        message = 'sec';
        elTimer.innerText = (now / SEC).toFixed(2) + message
    }
    if (now / 1000 > 60) {
        message = 'minutes';
        elTimer.innerText = (now / MINUTES).toFixed(2) + message
    }
    gTimeBestScore = (now / SEC).toFixed(2)
}

function changeSize(size, mines) {
    gLevel.size = size
    gLevel.mines = mines
    gGame.isOn = true
    var score = document.querySelector('.sec-score')
    score.innerText = localStorage.getItem(`${size}`)
    endGame()
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
            if (gBoard[i][j].isMine && gBoard[i][j].isShown) continue
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
            if (gBoard[i][j].isShown) continue
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
    if (gBoard[i][j].isMine) return
    var elCell = document.querySelector(`.cell${i}-${j}`);
    elCell.classList.add('choose-boom')
    gCreateBooms--
    isManuallyCreate = true
    gBoard[i][j].minesAroundCount = BOOM
    gBoard[i][j].isMine = true
    gIdxBooms.push({ i: i, j: j })

    setMinesNegsCount()
    setTimeout(() => {
        elCell.classList.remove('choose-boom')
    }, 1000);
    if (!gCreateBooms) {
        isManuallyCreate = false
        var elMessage = document.querySelector('.end-message');
        elMessage.innerText = 'Start play'
    }
}



function boomMode() {

    gIdxBooms = []
    var emptyCells = getCellsSeven()
    for (var i = 0; i < emptyCells.length; i++) {
        var cellIdx = emptyCells[i]
        gBoard[cellIdx.i][cellIdx.j].minesAroundCount = BOOM
        gBoard[cellIdx.i][cellIdx.j].isMine = true
        gIdxBooms.push(cellIdx)
    }
    setMinesNegsCount()

}


function getCellsSeven() {
    var emptyCells = []
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (i === 0 && j === 0) {
                count++
                continue
            }
            if ((count === 7) || (count % 7 === 0) || ((count % 10) === 7)) emptyCells.push({ i: i, j: j })
            count++
        }
    }
    return emptyCells
}


function bestScoreLevle() {
    var currLevel = ''
     currLevel = gLevel.size
    var currScore = localStorage.getItem(`${currLevel}`)
    if(!currScore){    
        localStorage.setItem(`${currLevel}`, `${gTimeBestScore}`);
    }else{
        if(currScore> gTimeBestScore)
        localStorage.setItem(`${currLevel}`, `${gTimeBestScore}`);
    }   
    var score = document.querySelector('.sec-score')
    score.innerText = localStorage.getItem(`${currLevel}`)
    // localStorage.clear()
}


