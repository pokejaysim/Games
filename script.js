function loadGame(gameName) {
    const gameContainer = document.getElementById('game-container');
    const gameContent = document.getElementById('game-content');
    const gamesGrid = document.querySelector('.games-grid');
    
    gamesGrid.style.display = 'none';
    gameContainer.classList.remove('hidden');
    
    gameContent.innerHTML = '';
    
    switch(gameName) {
        case 'snake':
            loadSnakeGame();
            break;
        case '2048':
            load2048Game();
            break;
        case 'memory':
            loadMemoryGame();
            break;
        case 'breakout':
            loadBreakoutGame();
            break;
        case 'wordchain':
            loadWordChainGame();
            break;
        case 'colorswitch':
            loadColorSwitchGame();
            break;
    }
}

function backToMenu() {
    const gameContainer = document.getElementById('game-container');
    const gamesGrid = document.querySelector('.games-grid');
    
    gameContainer.classList.add('hidden');
    gamesGrid.style.display = 'grid';
    
    // Clear any game intervals/timeouts
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    if (window.gameTimeout) {
        clearTimeout(window.gameTimeout);
    }
}

// Snake Game
function loadSnakeGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>Snake</h2>
            <div class="score">Score: <span id="snake-score">0</span></div>
        </div>
        <canvas id="snake-canvas" width="400" height="400"></canvas>
        <div class="game-controls">
            <p>Use Arrow Keys or WASD to move</p>
            <button onclick="startSnake()">Start Game</button>
        </div>
    `;
    
    startSnake();
}

function startSnake() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [
        {x: 10, y: 10}
    ];
    let dx = 0;
    let dy = 0;
    let foodX = 15;
    let foodY = 15;
    let score = 0;
    
    document.addEventListener('keydown', changeDirection);
    
    function changeDirection(e) {
        if (e.keyCode === 37 || e.keyCode === 65) { // Left/A
            if (dx === 0) {
                dx = -1;
                dy = 0;
            }
        } else if (e.keyCode === 38 || e.keyCode === 87) { // Up/W
            if (dy === 0) {
                dx = 0;
                dy = -1;
            }
        } else if (e.keyCode === 39 || e.keyCode === 68) { // Right/D
            if (dx === 0) {
                dx = 1;
                dy = 0;
            }
        } else if (e.keyCode === 40 || e.keyCode === 83) { // Down/S
            if (dy === 0) {
                dx = 0;
                dy = 1;
            }
        }
    }
    
    function drawGame() {
        clearScreen();
        moveSnake();
        drawSnake();
        drawFood();
        checkCollision();
        document.getElementById('snake-score').textContent = score;
    }
    
    function clearScreen() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function moveSnake() {
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        snake.unshift(head);
        
        if (head.x === foodX && head.y === foodY) {
            score += 10;
            generateFood();
        } else {
            snake.pop();
        }
    }
    
    function drawSnake() {
        ctx.fillStyle = '#4ade80';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#4ade80';
        snake.forEach((segment, index) => {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });
        ctx.shadowBlur = 0;
    }
    
    function drawFood() {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f43f5e';
        ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize - 2, gridSize - 2);
        ctx.shadowBlur = 0;
    }
    
    function generateFood() {
        foodX = Math.floor(Math.random() * tileCount);
        foodY = Math.floor(Math.random() * tileCount);
        
        snake.forEach(segment => {
            if (segment.x === foodX && segment.y === foodY) {
                generateFood();
            }
        });
    }
    
    function checkCollision() {
        const head = snake[0];
        
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
        }
        
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
            }
        }
    }
    
    function gameOver() {
        clearInterval(window.gameInterval);
        alert(`Game Over! Your score: ${score}`);
        startSnake();
    }
    
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    window.gameInterval = setInterval(drawGame, 100);
}

// 2048 Game
function load2048Game() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>2048</h2>
            <div class="score">Score: <span id="2048-score">0</span></div>
        </div>
        <div id="game-2048" class="game-2048">
            <div class="grid-2048"></div>
        </div>
        <div class="game-controls">
            <p>Use Arrow Keys or WASD to move tiles</p>
            <button onclick="init2048()">New Game</button>
        </div>
    `;
    
    init2048();
}

function init2048() {
    const grid = document.querySelector('.grid-2048');
    let board = Array(4).fill().map(() => Array(4).fill(0));
    let score = 0;
    
    function createBoard() {
        grid.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.classList.add('tile-2048');
                tile.id = `tile-${i}-${j}`;
                grid.appendChild(tile);
            }
        }
    }
    
    function updateDisplay() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.getElementById(`tile-${i}-${j}`);
                const value = board[i][j];
                tile.textContent = value > 0 ? value : '';
                tile.className = 'tile-2048';
                if (value > 0) {
                    tile.classList.add(`tile-${value}`);
                }
            }
        }
        document.getElementById('2048-score').textContent = score;
    }
    
    function addNewTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    function move(direction) {
        let moved = false;
        const newBoard = board.map(row => [...row]);
        
        if (direction === 'left' || direction === 'right') {
            for (let i = 0; i < 4; i++) {
                let row = newBoard[i];
                if (direction === 'right') row = row.reverse();
                
                row = row.filter(val => val !== 0);
                for (let j = 0; j < row.length - 1; j++) {
                    if (row[j] === row[j + 1]) {
                        row[j] *= 2;
                        score += row[j];
                        row.splice(j + 1, 1);
                    }
                }
                while (row.length < 4) row.push(0);
                
                if (direction === 'right') row = row.reverse();
                newBoard[i] = row;
            }
        } else {
            for (let j = 0; j < 4; j++) {
                let column = [];
                for (let i = 0; i < 4; i++) {
                    column.push(newBoard[i][j]);
                }
                
                if (direction === 'down') column = column.reverse();
                
                column = column.filter(val => val !== 0);
                for (let i = 0; i < column.length - 1; i++) {
                    if (column[i] === column[i + 1]) {
                        column[i] *= 2;
                        score += column[i];
                        column.splice(i + 1, 1);
                    }
                }
                while (column.length < 4) column.push(0);
                
                if (direction === 'down') column = column.reverse();
                
                for (let i = 0; i < 4; i++) {
                    newBoard[i][j] = column[i];
                }
            }
        }
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] !== newBoard[i][j]) {
                    moved = true;
                    break;
                }
            }
        }
        
        if (moved) {
            board = newBoard;
            addNewTile();
            updateDisplay();
            
            if (checkGameOver()) {
                alert(`Game Over! Your score: ${score}`);
            }
        }
    }
    
    function checkGameOver() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (board[i][j] === 0) return false;
                if (j < 3 && board[i][j] === board[i][j + 1]) return false;
                if (i < 3 && board[i][j] === board[i + 1][j]) return false;
            }
        }
        return true;
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 37 || e.keyCode === 65) move('left');
        else if (e.keyCode === 38 || e.keyCode === 87) move('up');
        else if (e.keyCode === 39 || e.keyCode === 68) move('right');
        else if (e.keyCode === 40 || e.keyCode === 83) move('down');
    });
    
    createBoard();
    addNewTile();
    addNewTile();
    updateDisplay();
}

// Memory Match Game
function loadMemoryGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>Memory Match</h2>
            <div class="score">Moves: <span id="memory-moves">0</span></div>
        </div>
        <div id="memory-grid" class="memory-grid"></div>
        <div class="game-controls">
            <button onclick="initMemoryGame()">New Game</button>
        </div>
    `;
    
    initMemoryGame();
}

function initMemoryGame() {
    const grid = document.getElementById('memory-grid');
    const emojis = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎰', '🎲', '🎸'];
    const cards = [...emojis, ...emojis];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function createBoard() {
        grid.innerHTML = '';
        shuffle(cards);
        
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('memory-card');
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.addEventListener('click', flipCard);
            
            const front = document.createElement('div');
            front.classList.add('card-front');
            front.textContent = '?';
            
            const back = document.createElement('div');
            back.classList.add('card-back');
            back.textContent = emoji;
            
            card.appendChild(front);
            card.appendChild(back);
            grid.appendChild(card);
        });
    }
    
    function flipCard() {
        if (flippedCards.length >= 2) return;
        if (this.classList.contains('flipped')) return;
        
        this.classList.add('flipped');
        flippedCards.push(this);
        
        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('memory-moves').textContent = moves;
            checkMatch();
        }
    }
    
    function checkMatch() {
        const [card1, card2] = flippedCards;
        const match = card1.dataset.emoji === card2.dataset.emoji;
        
        if (match) {
            matchedPairs++;
            flippedCards = [];
            
            if (matchedPairs === emojis.length) {
                setTimeout(() => {
                    alert(`Congratulations! You won in ${moves} moves!`);
                    initMemoryGame();
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
            }, 1000);
        }
    }
    
    createBoard();
}

// Breakout Game
function loadBreakoutGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>Breakout</h2>
            <div class="score">Score: <span id="breakout-score">0</span></div>
        </div>
        <canvas id="breakout-canvas" width="480" height="320"></canvas>
        <div class="game-controls">
            <p>Use Arrow Keys or Mouse to move paddle</p>
            <button onclick="initBreakout()">Start Game</button>
        </div>
    `;
    
    initBreakout();
}

function initBreakout() {
    const canvas = document.getElementById('breakout-canvas');
    const ctx = canvas.getContext('2d');
    
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let ballDX = 2;
    let ballDY = -2;
    const ballRadius = 10;
    
    const paddleHeight = 10;
    const paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    let rightPressed = false;
    let leftPressed = false;
    
    const brickRowCount = 3;
    const brickColumnCount = 5;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    
    let score = 0;
    let bricks = [];
    
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    
    function keyDownHandler(e) {
        if (e.keyCode === 39) rightPressed = true;
        else if (e.keyCode === 37) leftPressed = true;
    }
    
    function keyUpHandler(e) {
        if (e.keyCode === 39) rightPressed = false;
        else if (e.keyCode === 37) leftPressed = false;
    }
    
    function mouseMoveHandler(e) {
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }
    
    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                        ballDY = -ballDY;
                        b.status = 0;
                        score++;
                        document.getElementById('breakout-score').textContent = score;
                        
                        if (score === brickRowCount * brickColumnCount) {
                            alert('You win! Congratulations!');
                            initBreakout();
                        }
                    }
                }
            }
        }
    }
    
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.closePath();
    }
    
    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.closePath();
    }
    
    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = '#f59e0b';
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();
        
        if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
            ballDX = -ballDX;
        }
        if (ballY + ballDY < ballRadius) {
            ballDY = -ballDY;
        } else if (ballY + ballDY > canvas.height - ballRadius) {
            if (ballX > paddleX && ballX < paddleX + paddleWidth) {
                ballDY = -ballDY;
            } else {
                alert('Game Over!');
                initBreakout();
                return;
            }
        }
        
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
        
        ballX += ballDX;
        ballY += ballDY;
    }
    
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    window.gameInterval = setInterval(draw, 10);
}

// Word Chain Game
function loadWordChainGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>Word Chain</h2>
            <div class="score">Score: <span id="wordchain-score">0</span></div>
        </div>
        <div class="wordchain-game">
            <div class="word-display" id="current-word">CAT</div>
            <input type="text" id="word-input" placeholder="Enter a word starting with 'T'" maxlength="20">
            <button onclick="submitWord()">Submit</button>
            <div class="word-list" id="word-list"></div>
        </div>
        <div class="game-controls">
            <p>Create a chain of words where each word starts with the last letter of the previous word</p>
        </div>
    `;
    
    initWordChain();
}

function initWordChain() {
    let currentWord = 'CAT';
    let score = 0;
    let usedWords = ['CAT'];
    const input = document.getElementById('word-input');
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitWord();
        }
    });
    
    window.submitWord = function() {
        const newWord = input.value.toUpperCase().trim();
        
        if (newWord.length < 2) {
            alert('Word must be at least 2 letters long!');
            return;
        }
        
        const lastLetter = currentWord[currentWord.length - 1];
        
        if (newWord[0] !== lastLetter) {
            alert(`Word must start with '${lastLetter}'!`);
            return;
        }
        
        if (usedWords.includes(newWord)) {
            alert('Word already used!');
            return;
        }
        
        // Add word to chain
        usedWords.push(newWord);
        currentWord = newWord;
        score += newWord.length;
        
        // Update display
        document.getElementById('current-word').textContent = currentWord;
        document.getElementById('wordchain-score').textContent = score;
        
        // Update word list
        const wordList = document.getElementById('word-list');
        const wordElement = document.createElement('div');
        wordElement.classList.add('word-item');
        wordElement.textContent = newWord;
        wordList.appendChild(wordElement);
        
        // Clear input and update placeholder
        input.value = '';
        input.placeholder = `Enter a word starting with '${currentWord[currentWord.length - 1]}'`;
        
        // Scroll word list to bottom
        wordList.scrollTop = wordList.scrollHeight;
    };
}

// Color Switch Game
function loadColorSwitchGame() {
    const gameContent = document.getElementById('game-content');
    gameContent.innerHTML = `
        <div class="game-header">
            <h2>Color Switch</h2>
            <div class="score">Score: <span id="colorswitch-score">0</span></div>
        </div>
        <canvas id="colorswitch-canvas" width="400" height="600"></canvas>
        <div class="game-controls">
            <p>Click or tap to jump through matching colors</p>
            <button onclick="initColorSwitch()">Start Game</button>
        </div>
    `;
    
    initColorSwitch();
}

function initColorSwitch() {
    const canvas = document.getElementById('colorswitch-canvas');
    const ctx = canvas.getContext('2d');
    
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b'];
    let playerY = canvas.height - 100;
    let playerVelocity = 0;
    let playerColor = 0;
    let score = 0;
    let obstacles = [];
    
    class Obstacle {
        constructor(y) {
            this.y = y;
            this.rotation = 0;
            this.passed = false;
        }
        
        draw() {
            ctx.save();
            ctx.translate(canvas.width / 2, this.y);
            ctx.rotate(this.rotation);
            
            const sections = 4;
            const anglePerSection = (Math.PI * 2) / sections;
            
            for (let i = 0; i < sections; i++) {
                ctx.beginPath();
                ctx.arc(0, 0, 60, i * anglePerSection, (i + 1) * anglePerSection);
                ctx.arc(0, 0, 80, (i + 1) * anglePerSection, i * anglePerSection, true);
                ctx.closePath();
                ctx.fillStyle = colors[i];
                ctx.fill();
            }
            
            ctx.restore();
            this.rotation += 0.02;
        }
        
        checkCollision(py, pColor) {
            if (Math.abs(py - this.y) < 20) {
                const angle = Math.atan2(0, 1) + this.rotation;
                const section = Math.floor(((angle % (Math.PI * 2)) + Math.PI * 2) / (Math.PI * 2) * 4) % 4;
                
                if (section !== pColor) {
                    return true;
                }
                
                if (!this.passed) {
                    this.passed = true;
                    score++;
                    document.getElementById('colorswitch-score').textContent = score;
                }
            }
            return false;
        }
    }
    
    function createObstacles() {
        obstacles = [];
        for (let i = 0; i < 5; i++) {
            obstacles.push(new Obstacle(i * 150));
        }
    }
    
    canvas.addEventListener('click', jump);
    
    function jump() {
        playerVelocity = -8;
    }
    
    function drawPlayer() {
        ctx.beginPath();
        ctx.arc(canvas.width / 2, playerY, 10, 0, Math.PI * 2);
        ctx.fillStyle = colors[playerColor];
        ctx.fill();
        ctx.closePath();
    }
    
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update player
        playerVelocity += 0.3;
        playerY += playerVelocity;
        
        // Keep player on screen
        if (playerY > canvas.height - 20) {
            playerY = canvas.height - 20;
            playerVelocity = 0;
        }
        
        // Update and draw obstacles
        obstacles.forEach(obstacle => {
            obstacle.y += 1;
            obstacle.draw();
            
            if (obstacle.checkCollision(playerY, playerColor)) {
                alert(`Game Over! Score: ${score}`);
                initColorSwitch();
                return;
            }
            
            if (obstacle.y > canvas.height + 100) {
                obstacle.y = -100;
                obstacle.passed = false;
            }
        });
        
        // Change player color when passing obstacles
        if (Math.random() < 0.01) {
            playerColor = Math.floor(Math.random() * colors.length);
        }
        
        drawPlayer();
    }
    
    createObstacles();
    
    if (window.gameInterval) {
        clearInterval(window.gameInterval);
    }
    window.gameInterval = setInterval(update, 1000 / 60);
}

// Add game-specific CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
.game-header {
    text-align: center;
    margin-bottom: 20px;
}

.game-header h2 {
    font-size: 2rem;
    margin-bottom: 10px;
}

.score {
    font-size: 1.2rem;
    color: #4ade80;
}

.game-controls {
    text-align: center;
    margin-top: 20px;
}

.game-controls button {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
    margin: 5px;
}

.game-controls button:hover {
    background: rgba(255, 255, 255, 0.3);
}

canvas {
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.3);
    display: block;
    margin: 0 auto;
}

/* 2048 Styles */
.game-2048 {
    display: flex;
    justify-content: center;
    margin: 20px 0;
}

.grid-2048 {
    display: grid;
    grid-template-columns: repeat(4, 80px);
    grid-template-rows: repeat(4, 80px);
    gap: 10px;
    background: rgba(0, 0, 0, 0.3);
    padding: 10px;
    border-radius: 10px;
}

.tile-2048 {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    transition: all 0.15s ease;
}

.tile-2 { background: #eee4da; color: #776e65; }
.tile-4 { background: #ede0c8; color: #776e65; }
.tile-8 { background: #f2b179; color: #f9f6f2; }
.tile-16 { background: #f59563; color: #f9f6f2; }
.tile-32 { background: #f67c5f; color: #f9f6f2; }
.tile-64 { background: #f65e3b; color: #f9f6f2; }
.tile-128 { background: #edcf72; color: #f9f6f2; font-size: 1.2rem; }
.tile-256 { background: #edcc61; color: #f9f6f2; font-size: 1.2rem; }
.tile-512 { background: #edc850; color: #f9f6f2; font-size: 1.2rem; }
.tile-1024 { background: #edc53f; color: #f9f6f2; font-size: 1rem; }
.tile-2048 { background: #edc22e; color: #f9f6f2; font-size: 1rem; }

/* Memory Game Styles */
.memory-grid {
    display: grid;
    grid-template-columns: repeat(4, 100px);
    grid-template-rows: repeat(4, 100px);
    gap: 15px;
    justify-content: center;
    margin: 20px 0;
}

.memory-card {
    position: relative;
    width: 100px;
    height: 100px;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.6s;
}

.memory-card.flipped {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    border-radius: 10px;
    backface-visibility: hidden;
}

.card-front {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.card-back {
    background: rgba(255, 255, 255, 0.2);
    transform: rotateY(180deg);
}

/* Word Chain Styles */
.wordchain-game {
    text-align: center;
    max-width: 400px;
    margin: 0 auto;
}

.word-display {
    font-size: 3rem;
    font-weight: bold;
    margin: 20px 0;
    color: #4ade80;
}

#word-input {
    width: 100%;
    padding: 15px;
    font-size: 1.2rem;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    margin-bottom: 10px;
}

#word-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
}

.word-list {
    max-height: 200px;
    overflow-y: auto;
    margin-top: 20px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
}

.word-item {
    padding: 5px;
    margin: 5px 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
}

/* Mobile Touch Controls */
@media (max-width: 768px) {
    canvas {
        max-width: 100%;
        height: auto;
    }
    
    .grid-2048 {
        grid-template-columns: repeat(4, 70px);
        grid-template-rows: repeat(4, 70px);
        gap: 8px;
    }
    
    .memory-grid {
        grid-template-columns: repeat(4, 80px);
        grid-template-rows: repeat(4, 80px);
        gap: 10px;
    }
    
    .memory-card {
        width: 80px;
        height: 80px;
    }
}
`;
document.head.appendChild(styleSheet);