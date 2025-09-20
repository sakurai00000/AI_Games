// カードの種類と強弱を定義
const CARDS = {
    KING: { name: '皇帝', value: 3, beats: ['市民'] },
    CITIZEN: { name: '市民', value: 2, beats: ['奴隷'] },
    SLAVE: { name: '奴隷', value: 1, beats: ['皇帝'] }
};

// DOM要素への参照
const playerStarsEl = document.getElementById('player-stars');
const aiStarsEl = document.getElementById('ai-stars');
const playerHandEl = document.getElementById('player-hand');
const aiHandEl = document.getElementById('ai-hand');
const playerChosenCardEl = document.getElementById('player-chosen-card');
const aiChosenCardEl = document.getElementById('ai-chosen-card');
const roundResultEl = document.getElementById('round-result');
const playButton = document.getElementById('play-button');
const gameOverScreen = document.getElementById('game-over-screen');
const finalMessageEl = document.getElementById('final-message');
const restartButton = document.getElementById('restart-button');

// ゲームの状態
let playerStars = 4;
let aiStars = 4;
let playerHand = [];
let aiHand = [];
let playerSelectedCard = null;
let aiSelectedCard = null;
let gameActive = false;

// ゲーム初期化
function initGame() {
    playerStars = 4;
    aiStars = 4;
    playerStarsEl.textContent = playerStars;
    aiStarsEl.textContent = aiStars;

    playerHand = createInitialHand();
    aiHand = createInitialHand();

    playerSelectedCard = null;
    aiSelectedCard = null;
    roundResultEl.textContent = '';
    playerChosenCardEl.textContent = '';
    aiChosenCardEl.textContent = '';
    playButton.disabled = true;
    gameOverScreen.classList.add('hidden');

    renderHands();
    gameActive = true;
}

// 初期手札の作成
function createInitialHand() {
    return [
        CARDS.KING,
        CARDS.CITIZEN, CARDS.CITIZEN, CARDS.CITIZEN, CARDS.CITIZEN,
        CARDS.SLAVE
    ];
}

// 手札の表示を更新
function renderHands() {
    playerHandEl.innerHTML = '';
    aiHandEl.innerHTML = '';

    playerHand.forEach((card, index) => {
        const cardEl = createCardElement(card, index, 'player');
        playerHandEl.appendChild(cardEl);
    });

    aiHand.forEach((card, index) => {
        const cardEl = createCardElement(card, index, 'ai', true);
        aiHandEl.appendChild(cardEl);
    });
}

// カード要素の作成
function createCardElement(card, index, owner, hidden = false) {
    const cardEl = document.createElement('div');
    cardEl.classList.add('card');
    cardEl.dataset.index = index;
    cardEl.dataset.owner = owner;
    cardEl.textContent = hidden ? '?' : card.name;

    if (owner === 'player') {
        cardEl.addEventListener('click', () => selectPlayerCard(card, index));
    }
    if (hidden) {
        cardEl.classList.add('ai-hidden');
    }
    return cardEl;
}

// プレイヤーがカードを選択
function selectPlayerCard(card, index) {
    if (!gameActive) return;

    const currentSelected = playerHandEl.querySelector('.card.selected');
    if (currentSelected) {
        currentSelected.classList.remove('selected');
    }

    const newSelected = Array.from(playerHandEl.children).find(el => parseInt(el.dataset.index) === index);
    if (newSelected) {
        newSelected.classList.add('selected');
    }
    
    playerSelectedCard = { card, index };
    playerChosenCardEl.textContent = card.name;
    playButton.disabled = false;
}

// AIがカードを選択
function selectAICard() {
    const availableCards = aiHand.map((card, index) => ({ card, index })).filter(item => item.card !== null);
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    aiSelectedCard = availableCards[randomIndex];
    aiChosenCardEl.textContent = '?';
}

// カードを出すボタンが押された時
playButton.addEventListener('click', playRound);

function playRound() {
    if (!playerSelectedCard || !gameActive) return;

    playButton.disabled = true;
    selectAICard();

    const playerCard = playerSelectedCard.card;
    const aiCard = aiSelectedCard.card;

    aiChosenCardEl.textContent = aiCard.name;

    let result = '';
    let winner = null;

    if (playerCard.beats.includes(aiCard.name)) {
        result = 'プレイヤーの勝ち！';
        winner = 'player';
    } else if (aiCard.beats.includes(playerCard.name)) {
        result = 'AIの勝ち！';
        winner = 'ai';
    } else {
        result = '引き分け！';
    }

    roundResultEl.textContent = result;

    setTimeout(() => {
        if (winner === 'player') {
            aiHand[aiSelectedCard.index] = null;
            playerHand.push(aiCard);
            aiStars--;
        } else if (winner === 'ai') {
            playerHand[playerSelectedCard.index] = null;
            aiHand.push(playerCard);
            playerStars--;
        }

        playerHand = playerHand.filter(card => card !== null);
        aiHand = aiHand.filter(card => card !== null);

        playerStarsEl.textContent = playerStars;
        aiStarsEl.textContent = aiStars;

        playerChosenCardEl.textContent = '';
        aiChosenCardEl.textContent = '';
        playerSelectedCard = null;
        aiSelectedCard = null;

        renderHands();
        checkGameOver();
    }, 2000);
}

// ゲーム終了判定
function checkGameOver() {
    const playerHasKing = playerHand.some(card => card === CARDS.KING);
    const aiHasKing = aiHand.some(card => card === CARDS.KING);

    if (!playerHasKing) {
        endGame('AIの勝利！ (皇帝を失った)');
        return;
    }
    if (!aiHasKing) {
        endGame('プレイヤーの勝利！ (AIが皇帝を失った)');
        return;
    }

    if (playerStars <= 0 || playerHand.length === 0) {
        endGame('AIの勝利！');
    } else if (aiStars <= 0 || aiHand.length === 0) {
        endGame('プレイヤーの勝利！');
    }
}

// ゲーム終了処理
function endGame(message) {
    gameActive = false;
    finalMessageEl.textContent = message;
    gameOverScreen.classList.remove('hidden');
}

// リスタートボタン
restartButton.addEventListener('click', initGame);

// ゲーム開始
initGame();
