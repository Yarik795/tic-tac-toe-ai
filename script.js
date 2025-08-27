// Игровое поле
const board = Array(9).fill(null);
let currentPlayer = 'X'; // X - игрок, O - компьютер
let gameActive = true;

// Элементы DOM
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const playerScoreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
const drawScoreDisplay = document.getElementById('draw-score');

// Счет игры
let scores = {
    player: 0,
    computer: 0,
    draws: 0
};

// Выигрышные комбинации
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтальные
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикальные
    [0, 4, 8], [2, 4, 6] // диагональные
];

// Инициализация игры
function initGame() {
    board.fill(null);
    currentPlayer = 'X';
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'filled', 'winner-animation');
    });

    updateStatusDisplay();
}

// Обработка клика по клетке
function handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    if (!gameActive || board[index] !== null) {
        return;
    }

    // Ход игрока
    makeMove(index, 'X');

    // Если игра продолжается, ход компьютера
    if (gameActive) {
        setTimeout(() => {
            makeComputerMove();
        }, 500); // Небольшая задержка для реалистичности
    }
}

// Совершение хода
function makeMove(index, player) {
    board[index] = player;
    const cell = cells[index];

    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'filled');

    if (checkWinner(player)) {
        endGame(player === 'X' ? 'player' : 'computer');
        return;
    }

    if (checkDraw()) {
        endGame('draw');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatusDisplay();
}

// Проверка победителя
function checkWinner(player) {
    return winningCombinations.some(combination => {
        return combination.every(index => board[index] === player);
    });
}

// Проверка ничьи
function checkDraw() {
    return board.every(cell => cell !== null);
}

// Завершение игры
function endGame(result) {
    gameActive = false;

    if (result === 'player') {
        scores.player++;
        statusDisplay.textContent = '🎉 Вы победили!';
        highlightWinningCells('X');
    } else if (result === 'computer') {
        scores.computer++;
        statusDisplay.textContent = '💻 Компьютер победил!';
        highlightWinningCells('O');
    } else {
        scores.draws++;
        statusDisplay.textContent = '🤝 Ничья!';
        cells.forEach(cell => cell.classList.add('draw-animation'));
    }

    updateScoreDisplay();
}

// Подсветка выигрышных клеток
function highlightWinningCells(player) {
    const winningCombination = winningCombinations.find(combination => {
        return combination.every(index => board[index] === player);
    });

    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('winner-animation');
        });
    }
}

// Обновление статуса игры
function updateStatusDisplay() {
    if (currentPlayer === 'X') {
        statusDisplay.textContent = 'Ваш ход! Вы играете крестиками (X)';
    } else {
        statusDisplay.textContent = 'Ход компьютера...';
    }
}

// Обновление счета
function updateScoreDisplay() {
    playerScoreDisplay.textContent = scores.player;
    computerScoreDisplay.textContent = scores.computer;
    drawScoreDisplay.textContent = scores.draws;
}

// Ход компьютера
function makeComputerMove() {
    if (!gameActive) return;

    const bestMove = getBestMove();

    if (bestMove !== null) {
        makeMove(bestMove, 'O');
    }
}

// Получение лучшего хода для компьютера
function getBestMove() {
    // Сначала пытаемся выиграть
    const winningMove = findWinningMove('O');
    if (winningMove !== null) {
        return winningMove;
    }

    // Если не можем выиграть, пытаемся блокировать игрока
    const blockingMove = findWinningMove('X');
    if (blockingMove !== null) {
        return blockingMove;
    }

    // Если нет критических ходов, выбираем случайный
    return getRandomMove();
}

// Поиск выигрышного хода
function findWinningMove(player) {
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            // Симулируем ход
            board[i] = player;

            // Проверяем, привел ли этот ход к победе
            if (checkWinner(player)) {
                // Отменяем симуляцию
                board[i] = null;
                return i;
            }

            // Отменяем симуляцию
            board[i] = null;
        }
    }
    return null;
}

// Получение случайного хода
function getRandomMove() {
    const availableMoves = [];

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            availableMoves.push(i);
        }
    }

    if (availableMoves.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
}

// Сброс игры
function resetGame() {
    initGame();
}

// События
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

// Запуск игры
initGame();
