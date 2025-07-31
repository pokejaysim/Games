// Game State
let gameState = {
    currentScreen: 'welcome',
    playerName: '',
    roomCode: '',
    isHost: false,
    players: [],
    currentQuestion: 0,
    score: 0,
    correctAnswers: 0,
    totalResponseTime: 0,
    powerUps: {
        skip: 1,
        fifty: 1,
        time: 1
    },
    selectedCategories: ['general'],
    gameStarted: false,
    currentQuestionData: null,
    answeredQuestions: [],
    timeRemaining: 15,
    timerInterval: null
};

// Simulated multiplayer state (in real app, this would be WebSocket/Firebase)
let multiplayerState = {
    players: {},
    currentAnswers: {},
    scores: {}
};

// Question Database
const questions = {
    general: [
        {
            question: "What is the capital of France?",
            answers: ["London", "Berlin", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "Which planet is known as the Red Planet?",
            answers: ["Venus", "Mars", "Jupiter", "Saturn"],
            correct: 1
        },
        {
            question: "Who painted the Mona Lisa?",
            answers: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
            correct: 1
        },
        {
            question: "What is the largest ocean on Earth?",
            answers: ["Atlantic", "Indian", "Arctic", "Pacific"],
            correct: 3
        },
        {
            question: "In what year did World War II end?",
            answers: ["1943", "1944", "1945", "1946"],
            correct: 2
        }
    ],
    movies: [
        {
            question: "Who directed the movie 'Inception'?",
            answers: ["Steven Spielberg", "Christopher Nolan", "Martin Scorsese", "James Cameron"],
            correct: 1
        },
        {
            question: "Which movie won the Academy Award for Best Picture in 2020?",
            answers: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"],
            correct: 2
        },
        {
            question: "Who played Iron Man in the Marvel Cinematic Universe?",
            answers: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
            correct: 1
        },
        {
            question: "What is the highest-grossing film of all time?",
            answers: ["Avengers: Endgame", "Avatar", "Titanic", "Star Wars: The Force Awakens"],
            correct: 1
        },
        {
            question: "Which film features the quote 'May the Force be with you'?",
            answers: ["Star Trek", "Star Wars", "Guardians of the Galaxy", "Interstellar"],
            correct: 1
        }
    ],
    sports: [
        {
            question: "How many players are on a basketball team?",
            answers: ["4", "5", "6", "7"],
            correct: 1
        },
        {
            question: "In which sport would you perform a slam dunk?",
            answers: ["Tennis", "Basketball", "Volleyball", "Baseball"],
            correct: 1
        },
        {
            question: "Which country won the 2018 FIFA World Cup?",
            answers: ["Brazil", "Germany", "France", "Spain"],
            correct: 2
        },
        {
            question: "How many Grand Slam tennis tournaments are there?",
            answers: ["3", "4", "5", "6"],
            correct: 1
        },
        {
            question: "What is the maximum score in ten-pin bowling?",
            answers: ["200", "250", "300", "350"],
            correct: 2
        }
    ],
    tech: [
        {
            question: "Who founded Microsoft?",
            answers: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Elon Musk"],
            correct: 1
        },
        {
            question: "What does 'HTTP' stand for?",
            answers: ["HyperText Transfer Protocol", "High Tech Transfer Protocol", "Home Tool Transfer Protocol", "HyperText Transaction Protocol"],
            correct: 0
        },
        {
            question: "Which programming language is known as the 'language of the web'?",
            answers: ["Python", "Java", "JavaScript", "C++"],
            correct: 2
        },
        {
            question: "What year was the iPhone first released?",
            answers: ["2005", "2006", "2007", "2008"],
            correct: 2
        },
        {
            question: "What does 'AI' stand for?",
            answers: ["Automated Intelligence", "Artificial Intelligence", "Advanced Interface", "Analytical Intelligence"],
            correct: 1
        }
    ],
    music: [
        {
            question: "Who is known as the 'King of Pop'?",
            answers: ["Elvis Presley", "Michael Jackson", "Prince", "Freddie Mercury"],
            correct: 1
        },
        {
            question: "Which band released the album 'Abbey Road'?",
            answers: ["The Rolling Stones", "The Beatles", "Led Zeppelin", "Pink Floyd"],
            correct: 1
        },
        {
            question: "How many strings does a standard guitar have?",
            answers: ["4", "5", "6", "7"],
            correct: 2
        },
        {
            question: "Which classical composer was deaf?",
            answers: ["Mozart", "Bach", "Beethoven", "Chopin"],
            correct: 2
        },
        {
            question: "What is the best-selling album of all time?",
            answers: ["Thriller", "Back in Black", "The Dark Side of the Moon", "Rumours"],
            correct: 0
        }
    ],
    science: [
        {
            question: "What is the chemical symbol for gold?",
            answers: ["Go", "Gd", "Au", "Ag"],
            correct: 2
        },
        {
            question: "How many bones are in the human body?",
            answers: ["186", "206", "226", "246"],
            correct: 1
        },
        {
            question: "What is the speed of light?",
            answers: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
            correct: 0
        },
        {
            question: "What is the powerhouse of the cell?",
            answers: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
            correct: 2
        },
        {
            question: "What is the smallest unit of matter?",
            answers: ["Molecule", "Atom", "Electron", "Quark"],
            correct: 3
        }
    ]
};

// Avatar emojis for players
const avatarEmojis = ['🦊', '🐸', '🦁', '🐻', '🐼', '🐨', '🐯', '🦄', '🐷', '🐵'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showScreen('welcome');
});

// Screen Navigation
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');
    gameState.currentScreen = screenName;
}

function showWelcomeScreen() {
    showScreen('welcome');
}

function showJoinScreen() {
    showScreen('join');
}

// Room Management
function createRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    
    if (!playerName) {
        showToast('Please enter your name');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.roomCode = generateRoomCode();
    gameState.isHost = true;
    
    // Add host to players
    const hostPlayer = {
        id: Date.now(),
        name: playerName,
        avatar: avatarEmojis[0],
        score: 0,
        isHost: true
    };
    
    gameState.players = [hostPlayer];
    multiplayerState.players[hostPlayer.id] = hostPlayer;
    multiplayerState.scores[hostPlayer.id] = 0;
    
    showScreen('lobby');
    updateLobbyDisplay();
}

function joinRoom() {
    const playerName = document.getElementById('player-name').value.trim();
    const roomCode = document.getElementById('room-code').value.trim().toUpperCase();
    
    if (!playerName) {
        showToast('Please enter your name');
        return;
    }
    
    if (!roomCode) {
        showToast('Please enter a room code');
        return;
    }
    
    gameState.playerName = playerName;
    gameState.roomCode = roomCode;
    gameState.isHost = false;
    
    // Add player to room
    const newPlayer = {
        id: Date.now(),
        name: playerName,
        avatar: avatarEmojis[gameState.players.length % avatarEmojis.length],
        score: 0,
        isHost: false
    };
    
    gameState.players.push(newPlayer);
    multiplayerState.players[newPlayer.id] = newPlayer;
    multiplayerState.scores[newPlayer.id] = 0;
    
    showScreen('lobby');
    updateLobbyDisplay();
    
    // Simulate other players joining
    setTimeout(() => {
        simulatePlayerJoin();
    }, 2000);
}

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function copyRoomCode() {
    const roomCode = gameState.roomCode;
    navigator.clipboard.writeText(roomCode).then(() => {
        showToast('Room code copied!');
    });
}

function updateLobbyDisplay() {
    document.getElementById('room-code-display').textContent = gameState.roomCode;
    
    const playersGrid = document.getElementById('players-grid');
    playersGrid.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="player-avatar">${player.avatar}</div>
            <div class="player-name">${player.name}</div>
            <div class="player-status">${player.isHost ? 'Host' : 'Ready'}</div>
        `;
        playersGrid.appendChild(playerCard);
    });
}

// Simulate multiplayer
function simulatePlayerJoin() {
    const botNames = ['QuizMaster', 'BrainStorm', 'Genius', 'Einstein'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)] + Math.floor(Math.random() * 100);
    
    const botPlayer = {
        id: Date.now(),
        name: botName,
        avatar: avatarEmojis[gameState.players.length % avatarEmojis.length],
        score: 0,
        isHost: false,
        isBot: true
    };
    
    gameState.players.push(botPlayer);
    multiplayerState.players[botPlayer.id] = botPlayer;
    multiplayerState.scores[botPlayer.id] = 0;
    
    updateLobbyDisplay();
    showToast(`${botName} joined the game!`);
}

// Game Logic
function startGame() {
    const selectedCategories = Array.from(document.querySelectorAll('.category-option input:checked'))
        .map(input => input.value);
    
    if (selectedCategories.length === 0) {
        showToast('Please select at least one category');
        return;
    }
    
    if (!gameState.isHost) {
        showToast('Only the host can start the game');
        return;
    }
    
    gameState.selectedCategories = selectedCategories;
    gameState.gameStarted = true;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.totalResponseTime = 0;
    
    showScreen('game');
    loadQuestion();
}

function loadQuestion() {
    if (gameState.currentQuestion >= 10) {
        endGame();
        return;
    }
    
    // Reset UI
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'wrong', 'disabled', 'eliminated');
    });
    
    // Get random question from selected categories
    const allQuestions = [];
    gameState.selectedCategories.forEach(category => {
        if (questions[category]) {
            allQuestions.push(...questions[category].map(q => ({...q, category})));
        }
    });
    
    const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
    gameState.currentQuestionData = randomQuestion;
    gameState.questionStartTime = Date.now();
    
    // Update UI
    document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
    document.getElementById('progress-fill').style.width = `${(gameState.currentQuestion + 1) * 10}%`;
    document.getElementById('category-badge').textContent = getCategoryName(randomQuestion.category);
    document.getElementById('question-text').textContent = randomQuestion.question;
    
    // Display answers
    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';
    
    randomQuestion.answers.forEach((answer, index) => {
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-btn';
        answerBtn.textContent = answer;
        answerBtn.onclick = () => selectAnswer(index);
        answersGrid.appendChild(answerBtn);
    });
    
    // Update live scores
    updateLiveScores();
    
    // Start timer
    startTimer();
    
    // Simulate other players answering
    simulateOtherPlayers();
}

function getCategoryName(category) {
    const names = {
        general: 'General Knowledge',
        movies: 'Movies',
        sports: 'Sports',
        tech: 'Technology',
        music: 'Music',
        science: 'Science'
    };
    return names[category] || category;
}

function startTimer() {
    gameState.timeRemaining = 15;
    updateTimerDisplay();
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        updateTimerDisplay();
        
        if (gameState.timeRemaining <= 0) {
            clearInterval(gameState.timerInterval);
            timeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerText = document.getElementById('timer-text');
    const timerCircle = document.getElementById('timer-circle');
    
    timerText.textContent = gameState.timeRemaining;
    
    const dashoffset = 157 - (157 * gameState.timeRemaining / 15);
    timerCircle.style.strokeDashoffset = dashoffset;
    
    if (gameState.timeRemaining <= 5) {
        timerCircle.style.stroke = '#ef4444';
    } else {
        timerCircle.style.stroke = '#667eea';
    }
}

function selectAnswer(answerIndex) {
    if (gameState.currentQuestionData.answered) return;
    
    clearInterval(gameState.timerInterval);
    
    const responseTime = Date.now() - gameState.questionStartTime;
    gameState.totalResponseTime += responseTime;
    gameState.currentQuestionData.answered = true;
    
    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns[answerIndex].classList.add('selected');
    
    // Disable all buttons
    answerBtns.forEach(btn => btn.classList.add('disabled'));
    
    // Show correct/wrong answer
    setTimeout(() => {
        const correctIndex = gameState.currentQuestionData.correct;
        answerBtns[correctIndex].classList.add('correct');
        
        if (answerIndex === correctIndex) {
            // Correct answer
            gameState.correctAnswers++;
            const points = calculatePoints(responseTime);
            gameState.score += points;
            
            showToast(`+${points} points!`);
            celebrateCorrect();
            
            // Update player status in live scores
            updatePlayerStatus('correct');
        } else {
            // Wrong answer
            answerBtns[answerIndex].classList.add('wrong');
            updatePlayerStatus('wrong');
        }
        
        // Next question after delay
        setTimeout(() => {
            gameState.currentQuestion++;
            loadQuestion();
        }, 2000);
    }, 500);
}

function calculatePoints(responseTime) {
    const basePoints = 100;
    const timeBonus = Math.max(0, 100 - Math.floor(responseTime / 100));
    return basePoints + timeBonus;
}

function timeUp() {
    if (gameState.currentQuestionData.answered) return;
    
    gameState.currentQuestionData.answered = true;
    
    const answerBtns = document.querySelectorAll('.answer-btn');
    answerBtns.forEach(btn => btn.classList.add('disabled'));
    
    // Show correct answer
    const correctIndex = gameState.currentQuestionData.correct;
    answerBtns[correctIndex].classList.add('correct');
    
    showToast('Time\'s up!');
    
    setTimeout(() => {
        gameState.currentQuestion++;
        loadQuestion();
    }, 2000);
}

// Power-ups
function usePowerUp(type) {
    if (!gameState.powerUps[type] || gameState.currentQuestionData.answered) return;
    
    const btn = document.getElementById(`${type}-btn`);
    if (btn.classList.contains('used')) return;
    
    gameState.powerUps[type]--;
    btn.classList.add('used');
    
    switch(type) {
        case 'skip':
            skipQuestion();
            break;
        case 'fifty':
            useFiftyFifty();
            break;
        case 'time':
            addExtraTime();
            break;
    }
}

function skipQuestion() {
    clearInterval(gameState.timerInterval);
    showToast('Question skipped!');
    gameState.currentQuestion++;
    loadQuestion();
}

function useFiftyFifty() {
    const correctIndex = gameState.currentQuestionData.correct;
    const answerBtns = document.querySelectorAll('.answer-btn');
    
    // Get wrong answers
    const wrongIndices = [];
    for (let i = 0; i < answerBtns.length; i++) {
        if (i !== correctIndex) {
            wrongIndices.push(i);
        }
    }
    
    // Eliminate 2 wrong answers
    const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    toEliminate.forEach(index => {
        answerBtns[index].classList.add('eliminated');
        answerBtns[index].onclick = null;
    });
    
    showToast('50/50 activated!');
}

function addExtraTime() {
    gameState.timeRemaining = Math.min(gameState.timeRemaining + 10, 25);
    updateTimerDisplay();
    showToast('+10 seconds!');
}

// Live Scores
function updateLiveScores() {
    const liveScores = document.getElementById('live-scores');
    liveScores.innerHTML = '';
    
    gameState.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'live-player';
        playerDiv.id = `live-player-${player.id}`;
        playerDiv.innerHTML = `
            <div class="mini-avatar">${player.avatar}</div>
            <div class="live-player-info">
                <div class="live-player-name">${player.name}</div>
                <div class="live-player-score">${multiplayerState.scores[player.id] || 0} pts</div>
            </div>
        `;
        liveScores.appendChild(playerDiv);
    });
}

function updatePlayerStatus(status) {
    const playerId = gameState.players[0].id; // Current player
    const playerDiv = document.getElementById(`live-player-${playerId}`);
    if (playerDiv) {
        playerDiv.classList.remove('answering', 'correct', 'wrong');
        playerDiv.classList.add(status);
        
        // Update score display
        multiplayerState.scores[playerId] = gameState.score;
        playerDiv.querySelector('.live-player-score').textContent = `${gameState.score} pts`;
    }
}

function simulateOtherPlayers() {
    gameState.players.forEach((player, index) => {
        if (index === 0 || !player.isBot) return; // Skip current player
        
        const playerDiv = document.getElementById(`live-player-${player.id}`);
        if (!playerDiv) return;
        
        // Simulate thinking
        setTimeout(() => {
            playerDiv.classList.add('answering');
        }, Math.random() * 3000 + 1000);
        
        // Simulate answer
        setTimeout(() => {
            playerDiv.classList.remove('answering');
            const isCorrect = Math.random() > 0.4;
            playerDiv.classList.add(isCorrect ? 'correct' : 'wrong');
            
            if (isCorrect) {
                const responseTime = Math.random() * 10000 + 2000;
                const points = calculatePoints(responseTime);
                multiplayerState.scores[player.id] += points;
                playerDiv.querySelector('.live-player-score').textContent = `${multiplayerState.scores[player.id]} pts`;
            }
            
            setTimeout(() => {
                playerDiv.classList.remove('correct', 'wrong');
            }, 1500);
        }, Math.random() * 5000 + 3000);
    });
}

// End Game
function endGame() {
    clearInterval(gameState.timerInterval);
    
    // Calculate final stats
    const avgResponseTime = gameState.correctAnswers > 0 
        ? (gameState.totalResponseTime / gameState.correctAnswers / 1000).toFixed(1)
        : 0;
    
    document.getElementById('correct-answers').textContent = gameState.correctAnswers;
    document.getElementById('total-score').textContent = gameState.score;
    document.getElementById('avg-time').textContent = `${avgResponseTime}s`;
    
    // Determine winner
    const sortedPlayers = Object.entries(multiplayerState.scores)
        .sort((a, b) => b[1] - a[1]);
    
    const winnerId = parseInt(sortedPlayers[0][0]);
    const winner = multiplayerState.players[winnerId];
    
    // Display winner
    const winnerAnnouncement = document.getElementById('winner-announcement');
    winnerAnnouncement.innerHTML = `
        <div class="winner-card">
            <div class="winner-emoji">${winner.avatar}</div>
            <div class="winner-name">${winner.name}</div>
            <div class="winner-score">${sortedPlayers[0][1]} points</div>
        </div>
    `;
    
    // Display leaderboard
    const leaderboard = document.getElementById('final-leaderboard');
    leaderboard.innerHTML = '';
    
    sortedPlayers.forEach((entry, index) => {
        const playerId = parseInt(entry[0]);
        const player = multiplayerState.players[playerId];
        const score = entry[1];
        
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        if (index === 0) item.classList.add('gold');
        else if (index === 1) item.classList.add('silver');
        else if (index === 2) item.classList.add('bronze');
        
        item.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="mini-avatar">${player.avatar}</div>
            <div class="leaderboard-player-info">
                <div class="player-name">${player.name}</div>
            </div>
            <div class="leaderboard-score">${score}</div>
        `;
        
        leaderboard.appendChild(item);
    });
    
    showScreen('results');
    
    if (winnerId === gameState.players[0].id) {
        celebrateWin();
    }
}

function playAgain() {
    // Reset game state
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.totalResponseTime = 0;
    gameState.powerUps = {
        skip: 1,
        fifty: 1,
        time: 1
    };
    
    // Reset power-up buttons
    document.querySelectorAll('.power-up-btn').forEach(btn => {
        btn.classList.remove('used');
    });
    
    // Reset scores
    Object.keys(multiplayerState.scores).forEach(playerId => {
        multiplayerState.scores[playerId] = 0;
    });
    
    showScreen('lobby');
}

function backToLobby() {
    showScreen('lobby');
}

// Celebration Effects
function celebrateCorrect() {
    const celebration = document.getElementById('celebration');
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        celebration.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function celebrateWin() {
    const celebration = document.getElementById('celebration');
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.animationDelay = Math.random() * 1 + 's';
        celebration.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Toast Notifications
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}