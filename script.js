// Настройки игры
let gameSettings = {
    difficulty: 'medium', // easy, medium, hard
    boardSize: 3, // 3 или 4
    theme: 'light', // light или dark
    soundEnabled: true,
    timerEnabled: false // таймер включен/выключен
};

// Таймер
let timer = {
    interval: null,
    timeLeft: 10,
    totalTime: 10
};

// Игровое поле
let board = Array(9).fill(null);
let currentPlayer = 'X'; // X - игрок, O - компьютер
let gameActive = true;

// Элементы DOM
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset-btn');
const themeToggle = document.getElementById('theme-toggle');
const difficultySelect = document.getElementById('difficulty');
const boardSizeSelect = document.getElementById('board-size');
const timerToggle = document.getElementById('timer-toggle');
const timerContainer = document.getElementById('timer-container');
const timerProgress = document.getElementById('timer-progress');
const timerText = document.getElementById('timer-text');
const gameBoard = document.querySelector('.game-board');

// Счет игры
let scores = {
    player: 0,
    computer: 0,
    draws: 0
};

// Выигрышные комбинации для разных размеров поля
const winningCombinations = {
    3: [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтальные
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикальные
        [0, 4, 8], [2, 4, 6] // диагональные
    ],
    4: [
        [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15], // горизонтальные
        [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15], // вертикальные
        [0, 5, 10, 15], [3, 6, 9, 12] // диагональные
    ]
};

// Создание игрового поля нужного размера
function createBoard(size) {
    const totalCells = size * size;
    board = Array(totalCells).fill(null);

    // Очищаем существующее поле
    gameBoard.innerHTML = '';

    // Создаем новые ячейки
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }

    // Обновляем класс поля для правильного отображения
    gameBoard.classList.remove('size-3', 'size-4');
    gameBoard.classList.add(`size-${size}`);
}

// Инициализация игры
function initGame() {
    const size = gameSettings.boardSize;
    if (board.length !== size * size) {
        createBoard(size);
    }

    board.fill(null);
    currentPlayer = 'X';
    gameActive = true;

    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'filled', 'winner-animation', 'draw-animation');
    });

    // Управление таймером
    if (gameSettings.timerEnabled) {
        timerContainer.style.display = 'flex';
        resetTimer();
    } else {
        timerContainer.style.display = 'none';
        stopTimer();
    }

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
    const cell = document.querySelector(`[data-index="${index}"]`);

    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'filled');

    playSound('move');

    if (checkWinner(player)) {
        endGame(player === 'X' ? 'player' : 'computer');
        return;
    }

    if (checkDraw()) {
        endGame('draw');
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    // Управление таймером при смене игрока
    if (gameSettings.timerEnabled) {
        if (currentPlayer === 'X') {
            // Ход игрока - запускаем таймер
            startTimer();
        } else {
            // Ход компьютера - останавливаем таймер
            stopTimer();
        }
    }

    updateStatusDisplay();
}

// Проверка победителя
function checkWinner(player) {
    const combinations = winningCombinations[gameSettings.boardSize];
    return combinations.some(combination => {
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
    stopTimer(); // Останавливаем таймер при завершении игры

    if (result === 'player') {
        scores.player++;
        statusDisplay.textContent = '🎉 Вы победили!';
        highlightWinningCells('X');
        createConfetti();
        playSound('win');
    } else if (result === 'computer') {
        scores.computer++;
        statusDisplay.textContent = '💻 Компьютер победил!';
        highlightWinningCells('O');
    } else {
        scores.draws++;
        statusDisplay.textContent = '🤝 Ничья!';
        document.querySelectorAll('.cell').forEach(cell => cell.classList.add('draw-animation'));
    }

    updateScoreDisplay();
}

// Подсветка выигрышных клеток
function highlightWinningCells(player) {
    const combinations = winningCombinations[gameSettings.boardSize];
    const winningCombination = combinations.find(combination => {
        return combination.every(index => board[index] === player);
    });

    if (winningCombination) {
        winningCombination.forEach(index => {
            const cell = document.querySelector(`[data-index="${index}"]`);
            if (cell) {
                cell.classList.add('winner-animation');
            }
        });
    }
}

// Обновление статуса игры
function updateStatusDisplay() {
    const size = gameSettings.boardSize;
    const winCondition = size === 3 ? '3 в ряд' : '4 в ряд';

    if (currentPlayer === 'X') {
        statusDisplay.textContent = `Ваш ход! Соберите ${winCondition} крестиками (X)`;
    } else {
        statusDisplay.textContent = `Ход компьютера... Соберёт ${winCondition} ноликами (O)`;
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

// Получение лучшего хода для компьютера в зависимости от сложности
function getBestMove() {
    const difficulty = gameSettings.difficulty;

    switch (difficulty) {
        case 'easy':
            return getRandomMove();

        case 'medium':
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

        case 'hard':
            return getBestMoveMinimax();

        default:
            return getRandomMove();
    }
}

// Поиск выигрышного хода
function findWinningMove(player) {
    const boardSize = gameSettings.boardSize;
    const totalCells = boardSize * boardSize;

    for (let i = 0; i < totalCells; i++) {
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
    const boardSize = gameSettings.boardSize;
    const totalCells = boardSize * boardSize;
    const availableMoves = [];

    for (let i = 0; i < totalCells; i++) {
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

// Мини-макс алгоритм для сложного уровня
function minimax(depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
    if (checkWinner('O')) return 10 - depth;
    if (checkWinner('X')) return depth - 10;
    if (checkDraw()) return 0;

    const boardSize = gameSettings.boardSize;
    const totalCells = boardSize * boardSize;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < totalCells; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                const score = minimax(depth + 1, false, alpha, beta);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < totalCells; i++) {
            if (board[i] === null) {
                board[i] = 'X';
                const score = minimax(depth + 1, true, alpha, beta);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

// Получение лучшего хода для мини-макс
function getBestMoveMinimax() {
    const boardSize = gameSettings.boardSize;
    const totalCells = boardSize * boardSize;
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < totalCells; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            const score = minimax(0, false);
            board[i] = null;

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

// Переключение темы
function toggleTheme() {
    gameSettings.theme = gameSettings.theme === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = gameSettings.theme;

    const themeButton = document.getElementById('theme-toggle');
    if (gameSettings.theme === 'dark') {
        themeButton.textContent = '☀️ Светлая тема';
        themeButton.classList.add('dark');
    } else {
        themeButton.textContent = '🌙 Тёмная тема';
        themeButton.classList.remove('dark');
    }

    playSound('theme');
}

// Обработка изменения сложности
function handleDifficultyChange(event) {
    gameSettings.difficulty = event.target.value;
    playSound('setting');
}

// Обработка изменения размера поля
function handleBoardSizeChange(event) {
    gameSettings.boardSize = parseInt(event.target.value);
    initGame();
    playSound('setting');
}

// Обработка включения/выключения таймера
function handleTimerToggle(event) {
    gameSettings.timerEnabled = event.target.checked;
    if (gameSettings.timerEnabled) {
        timerContainer.style.display = 'flex';
        startTimer();
    } else {
        timerContainer.style.display = 'none';
        stopTimer();
    }
    playSound('setting');
}

// Запуск таймера
function startTimer() {
    if (!gameSettings.timerEnabled || currentPlayer !== 'X') return;

    stopTimer(); // Останавливаем предыдущий таймер
    timer.timeLeft = timer.totalTime;
    updateTimerDisplay();

    timer.interval = setInterval(() => {
        timer.timeLeft--;
        updateTimerDisplay();

        if (timer.timeLeft <= 0) {
            stopTimer();
            // Автоматический ход компьютера
            setTimeout(() => {
                makeComputerMove();
            }, 500);
        }
    }, 1000);
}

// Остановка таймера
function stopTimer() {
    if (timer.interval) {
        clearInterval(timer.interval);
        timer.interval = null;
    }
}

// Сброс таймера
function resetTimer() {
    stopTimer();
    timer.timeLeft = timer.totalTime;
    updateTimerDisplay();

    if (gameSettings.timerEnabled && currentPlayer === 'X') {
        startTimer();
    }
}

// Обновление отображения таймера
function updateTimerDisplay() {
    const progress = (timer.timeLeft / timer.totalTime) * 100;
    timerProgress.style.width = progress + '%';
    timerText.textContent = timer.timeLeft;

    // Добавляем класс urgent для последних 3 секунд
    if (timer.timeLeft <= 3) {
        timerContainer.classList.add('timer-urgent');
    } else {
        timerContainer.classList.remove('timer-urgent');
    }
}

// Эффекты частиц при победе
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);

        // Удаляем частицы через 3 секунды
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 3000);
    }
}

// Звуковые эффекты
function playSound(type) {
    if (!gameSettings.soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
        case 'move':
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;

        case 'win':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
            break;

        case 'theme':
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;

        case 'setting':
            oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
    }
}

// Сброс игры
function resetGame() {
    initGame();
    playSound('setting');
}

// События
document.addEventListener('DOMContentLoaded', () => {
    // Создаем начальное поле
    createBoard(gameSettings.boardSize);

    // Обработчики событий
    resetButton.addEventListener('click', resetGame);
    themeToggle.addEventListener('click', toggleTheme);
    difficultySelect.addEventListener('change', handleDifficultyChange);
    boardSizeSelect.addEventListener('change', handleBoardSizeChange);
    timerToggle.addEventListener('change', handleTimerToggle);

    // Устанавливаем начальную тему
    document.body.dataset.theme = gameSettings.theme;

    // Запуск игры
    initGame();
});
