// Game State
let gameState = {
    currentScreen: 'main-menu',
    gameMode: 'classic',
    difficulty: 2,
    aiPersonality: 'casual',
    isPaused: false,
    isPlaying: false,
    
    // Scores
    playerScore: 0,
    aiScore: 0,
    
    // Game Settings
    targetScore: 10,
    timeLimit: 120, // seconds
    gameTimer: 0,
    
    // Game Objects
    ball: null,
    playerPaddle: null,
    aiPaddle: null,
    
    // Power-ups
    activePowerups: [],
    powerupSpawnTimer: 0,
    
    // AI State
    aiTarget: 0,
    aiReactionDelay: 0,
    aiMistakeChance: 0.1,
    aiPredictionAccuracy: 0.7,
    
    // Visual Effects
    particles: [],
    screenShake: 0,
    
    // Performance
    lastFrameTime: 0,
    fps: 0,
    fpsCounter: 0,
    fpsTimer: 0
};

// Game Settings
const settings = {
    soundEnabled: true,
    particlesEnabled: true,
    screenShakeEnabled: true,
    showFPS: false
};

// Canvas and Context
let canvas, ctx, particleCanvas, particleCtx;
let canvasRect;

// Input State
const keys = {
    up: false,
    down: false,
    space: false
};

// Touch State
let touchState = {
    up: false,
    down: false
};

// Game Objects Classes
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 8;
        this.maxSpeed = 12;
        this.baseSpeed = 6;
        this.speedIncrease = 0.5;
        this.trail = [];
        this.glowIntensity = 1;
    }
    
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        
        // Random direction
        const angle = (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        this.vx = Math.cos(angle) * this.baseSpeed * direction;
        this.vy = Math.sin(angle) * this.baseSpeed;
        
        this.trail = [];
    }
    
    update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Add to trail
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        
        // Bounce off top/bottom walls
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.vy = -this.vy;
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
            playSound('wallBounce');
            createImpactParticles(this.x, this.y, '#00ffff');
        }
        
        // Check paddle collisions
        this.checkPaddleCollision(gameState.playerPaddle);
        this.checkPaddleCollision(gameState.aiPaddle);
        
        // Check scoring
        if (this.x < -this.radius) {
            gameState.aiScore++;
            playSound('score');
            createScoreParticles(gameState.aiPaddle.x, gameState.aiPaddle.y + gameState.aiPaddle.height/2);
            this.reset();
            checkGameEnd();
        } else if (this.x > canvas.width + this.radius) {
            gameState.playerScore++;
            playSound('score');
            createScoreParticles(gameState.playerPaddle.x, gameState.playerPaddle.y + gameState.playerPaddle.height/2);
            this.reset();
            checkGameEnd();
        }
        
        // Update glow effect
        this.glowIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
    }
    
    checkPaddleCollision(paddle) {
        if (this.x - this.radius < paddle.x + paddle.width &&
            this.x + this.radius > paddle.x &&
            this.y - this.radius < paddle.y + paddle.height &&
            this.y + this.radius > paddle.y) {
            
            // Calculate relative intersection
            const intersectY = (this.y - (paddle.y + paddle.height/2)) / (paddle.height/2);
            
            // Calculate new velocity
            const bounceAngle = intersectY * Math.PI/4; // Max 45 degrees
            const speed = Math.min(Math.sqrt(this.vx*this.vx + this.vy*this.vy) + this.speedIncrease, this.maxSpeed);
            
            // Apply AI personality effects
            if (paddle === gameState.aiPaddle) {
                const personality = getAIPersonality();
                if (personality.type === 'aggressive') {
                    speed = Math.min(speed * 1.2, this.maxSpeed);
                }
            }
            
            this.vx = Math.cos(bounceAngle) * speed * (paddle === gameState.playerPaddle ? 1 : -1);
            this.vy = Math.sin(bounceAngle) * speed;
            
            // Prevent ball from getting stuck
            if (paddle === gameState.playerPaddle) {
                this.x = paddle.x + paddle.width + this.radius;
            } else {
                this.x = paddle.x - this.radius;
            }
            
            playSound('paddleBounce');
            createImpactParticles(this.x, this.y, paddle.color);
            
            // Screen shake effect
            if (settings.screenShakeEnabled) {
                gameState.screenShake = Math.min(speed / 2, 8);
            }
            
            // Update paddle glow
            paddle.glowIntensity = 1.5;
        }
    }
    
    draw() {
        // Draw trail
        if (settings.particlesEnabled) {
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                const alpha = i / this.trail.length;
                const size = this.radius * alpha;
                
                ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }
        
        // Draw ball with glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${this.glowIntensity})`);
        gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Paddle {
    constructor(x, y, isPlayer = false) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 80;
        this.baseHeight = 80;
        this.speed = 8;
        this.isPlayer = isPlayer;
        this.color = isPlayer ? '#00ff00' : '#ff0080';
        this.glowIntensity = 1;
        this.targetY = y;
    }
    
    update() {
        if (this.isPlayer) {
            this.updatePlayerMovement();
        } else {
            this.updateAIMovement();
        }
        
        // Keep paddle within bounds
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
        
        // Update glow
        this.glowIntensity = Math.max(0.5, this.glowIntensity - 0.02);
    }
    
    updatePlayerMovement() {
        if (keys.up || touchState.up) {
            this.y -= this.speed;
        }
        if (keys.down || touchState.down) {
            this.y += this.speed;
        }
    }
    
    updateAIMovement() {
        const personality = getAIPersonality();
        const difficulty = getDifficultySettings();
        
        // Predict ball position
        let targetY = this.predictBallPosition();
        
        // Add personality-based adjustments
        if (personality.type === 'defensive') {
            // Stay centered when ball is far
            const ballDistance = Math.abs(gameState.ball.x - this.x);
            if (ballDistance > canvas.width * 0.3) {
                targetY = canvas.height / 2;
            }
        } else if (personality.type === 'aggressive') {
            // Add some randomness for aggressive play
            targetY += (Math.random() - 0.5) * 20;
        }
        
        // Apply difficulty-based accuracy
        if (Math.random() < difficulty.mistakeChance) {
            targetY += (Math.random() - 0.5) * 100;
        }
        
        // Add reaction delay
        if (gameState.aiReactionDelay <= 0) {
            this.targetY = targetY - this.height / 2;
            gameState.aiReactionDelay = difficulty.reactionDelay;
        } else {
            gameState.aiReactionDelay--;
        }
        
        // Move towards target with speed limits
        const diff = this.targetY - this.y;
        const moveSpeed = Math.min(Math.abs(diff), this.speed * difficulty.speedMultiplier);
        
        if (Math.abs(diff) > 5) {
            this.y += Math.sign(diff) * moveSpeed;
        }
    }
    
    predictBallPosition() {
        const ball = gameState.ball;
        
        // Simple prediction based on current trajectory
        if (ball.vx === 0) return ball.y;
        
        const timeToReach = (this.x - ball.x) / ball.vx;
        if (timeToReach <= 0) return ball.y;
        
        let predictedY = ball.y + ball.vy * timeToReach;
        
        // Account for wall bounces
        while (predictedY < 0 || predictedY > canvas.height) {
            if (predictedY < 0) {
                predictedY = -predictedY;
            } else if (predictedY > canvas.height) {
                predictedY = 2 * canvas.height - predictedY;
            }
        }
        
        return predictedY;
    }
    
    draw() {
        // Draw glow
        const gradient = ctx.createLinearGradient(this.x - 10, this.y, this.x + this.width + 10, this.y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.2, `rgba(${this.color.slice(1, 3)}, ${this.color.slice(3, 5)}, ${this.color.slice(5, 7)}, ${this.glowIntensity * 0.3})`);
        gradient.addColorStop(0.8, `rgba(${this.color.slice(1, 3)}, ${this.color.slice(3, 5)}, ${this.color.slice(5, 7)}, ${this.glowIntensity * 0.3})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - 10, this.y, this.width + 20, this.height);
        
        // Draw paddle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 15;
        this.rotation = 0;
        this.pulseScale = 1;
        this.lifetime = 300; // 5 seconds at 60fps
        this.maxLifetime = 300;
        
        const types = {
            'speed': { color: '#ff0000', icon: '⚡', name: 'Speed Boost' },
            'size': { color: '#00ff00', icon: '📏', name: 'Bigger Paddle' },
            'multi': { color: '#ffff00', icon: '⚽', name: 'Multi Ball' },
            'slow': { color: '#0080ff', icon: '🐌', name: 'Slow Motion' }
        };
        
        this.config = types[type] || types['speed'];
    }
    
    update() {
        this.rotation += 0.05;
        this.pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        this.lifetime--;
        
        // Check collision with ball
        const ball = gameState.ball;
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + ball.radius) {
            this.activate();
            return false; // Remove this power-up
        }
        
        return this.lifetime > 0;
    }
    
    activate() {
        playSound('powerup');
        showPowerupNotification(this.config.name);
        createPowerupParticles(this.x, this.y, this.config.color);
        
        switch (this.type) {
            case 'speed':
                gameState.ball.maxSpeed += 3;
                setTimeout(() => gameState.ball.maxSpeed -= 3, 5000);
                break;
                
            case 'size':
                gameState.playerPaddle.height = Math.min(gameState.playerPaddle.height * 1.5, 120);
                setTimeout(() => gameState.playerPaddle.height = gameState.playerPaddle.baseHeight, 8000);
                break;
                
            case 'multi':
                // Create additional balls (simplified implementation)
                for (let i = 0; i < 2; i++) {
                    setTimeout(() => {
                        const newBall = new Ball(canvas.width / 2, canvas.height / 2);
                        newBall.reset();
                        // This would require more complex ball management
                    }, i * 1000);
                }
                break;
                
            case 'slow':
                gameState.ball.vx *= 0.5;
                gameState.ball.vy *= 0.5;
                setTimeout(() => {
                    gameState.ball.vx *= 2;
                    gameState.ball.vy *= 2;
                }, 3000);
                break;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        // Draw glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 2);
        gradient.addColorStop(0, this.config.color);
        gradient.addColorStop(0.7, this.config.color + '80');
        gradient.addColorStop(1, this.config.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw icon
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.config.icon, 0, 0);
        
        // Draw lifetime indicator
        const alpha = this.lifetime / this.maxLifetime;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, -Math.PI/2, -Math.PI/2 + (alpha * Math.PI * 2));
        ctx.stroke();
        
        ctx.restore();
    }
}

// AI Personality System
function getAIPersonality() {
    const personalities = {
        casual: {
            type: 'casual',
            name: 'Casual',
            mistakeMultiplier: 1.5,
            speedMultiplier: 0.8,
            reactionMultiplier: 1.2
        },
        aggressive: {
            type: 'aggressive',
            name: 'Aggressive',
            mistakeMultiplier: 1.0,
            speedMultiplier: 1.2,
            reactionMultiplier: 0.9
        },
        defensive: {
            type: 'defensive',
            name: 'Defensive',
            mistakeMultiplier: 0.7,
            speedMultiplier: 0.9,
            reactionMultiplier: 0.8
        }
    };
    
    return personalities[gameState.aiPersonality] || personalities.casual;
}

// Difficulty System
function getDifficultySettings() {
    const personality = getAIPersonality();
    const baseDifficulties = {
        1: { // Beginner
            mistakeChance: 0.3,
            reactionDelay: 15,
            speedMultiplier: 0.6,
            predictionAccuracy: 0.4
        },
        2: { // Intermediate
            mistakeChance: 0.15,
            reactionDelay: 10,
            speedMultiplier: 0.8,
            predictionAccuracy: 0.6
        },
        3: { // Expert
            mistakeChance: 0.05,
            reactionDelay: 5,
            speedMultiplier: 1.0,
            predictionAccuracy: 0.8
        },
        4: { // Impossible
            mistakeChance: 0.01,
            reactionDelay: 2,
            speedMultiplier: 1.2,
            predictionAccuracy: 0.95
        }
    };
    
    const base = baseDifficulties[gameState.difficulty] || baseDifficulties[2];
    
    return {
        mistakeChance: base.mistakeChance * personality.mistakeMultiplier,
        reactionDelay: base.reactionDelay * personality.reactionMultiplier,
        speedMultiplier: base.speedMultiplier * personality.speedMultiplier,
        predictionAccuracy: base.predictionAccuracy
    };
}

// Particle System
class Particle {
    constructor(x, y, vx, vy, color, life = 60) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 1;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.vx *= 0.99; // friction
        this.life--;
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        particleCtx.save();
        particleCtx.globalAlpha = alpha;
        particleCtx.fillStyle = this.color;
        particleCtx.beginPath();
        particleCtx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        particleCtx.fill();
        particleCtx.restore();
    }
}

function createImpactParticles(x, y, color) {
    if (!settings.particlesEnabled) return;
    
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        gameState.particles.push(new Particle(x, y, vx, vy, color, 30));
    }
}

function createScoreParticles(x, y) {
    if (!settings.particlesEnabled) return;
    
    for (let i = 0; i < 15; i++) {
        const vx = (Math.random() - 0.5) * 8;
        const vy = (Math.random() - 0.5) * 8;
        const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        gameState.particles.push(new Particle(x, y, vx, vy, color, 60));
    }
}

function createPowerupParticles(x, y, color) {
    if (!settings.particlesEnabled) return;
    
    for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        gameState.particles.push(new Particle(x, y, vx, vy, color, 45));
    }
}

// Sound System
let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Audio not supported:', e);
        settings.soundEnabled = false;
    }
}

function playSound(type) {
    if (!settings.soundEnabled || !audioContext) return;
    
    try {
        const sounds = {
            paddleBounce: { frequency: 220, duration: 0.1, type: 'square' },
            wallBounce: { frequency: 440, duration: 0.1, type: 'sine' },
            score: { frequency: 880, duration: 0.3, type: 'triangle' },
            powerup: { frequency: 660, duration: 0.2, type: 'sawtooth' }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        oscillator.type = sound.type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
        console.warn('Audio playback failed:', e);
    }
}

// Game Logic
function initGame() {
    console.log('Initializing Modern Pong...');
    
    try {
        canvas = document.getElementById('game-canvas');
        ctx = canvas.getContext('2d');
        particleCanvas = document.getElementById('particle-canvas');
        particleCtx = particleCanvas.getContext('2d');
        
        if (!canvas || !ctx || !particleCanvas || !particleCtx) {
            console.error('Canvas elements not found');
            return;
        }
        
        // Initialize audio
        initAudio();
        
        // Set canvas size
        resizeCanvas();
        
        // Initialize game objects
        gameState.ball = new Ball(canvas.width / 2, canvas.height / 2);
        gameState.playerPaddle = new Paddle(30, canvas.height / 2 - 40, true);
        gameState.aiPaddle = new Paddle(canvas.width - 42, canvas.height / 2 - 40, false);
        
        // Load settings
        loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start game loop
        gameLoop();
        
        console.log('Modern Pong initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const maxWidth = Math.min(window.innerWidth * 0.9, 800);
    const maxHeight = Math.min(window.innerHeight * 0.6, 400);
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    particleCanvas.width = maxWidth;
    particleCanvas.height = maxHeight;
    
    canvasRect = canvas.getBoundingClientRect();
}

function setupEventListeners() {
    try {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.up = true;
                    e.preventDefault();
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.down = true;
                    e.preventDefault();
                    break;
                case 'Space':
                    keys.space = true;
                    if (gameState.isPlaying) {
                        pauseGame();
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW':
                case 'ArrowUp':
                    keys.up = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    keys.down = false;
                    break;
                case 'Space':
                    keys.space = false;
                    break;
            }
        });
        
        // Touch events for mobile
        const touchUp = document.getElementById('touch-up');
        const touchDown = document.getElementById('touch-down');
        
        if (touchUp && touchDown) {
            touchUp.addEventListener('touchstart', (e) => {
                touchState.up = true;
                e.preventDefault();
            });
            
            touchUp.addEventListener('touchend', (e) => {
                touchState.up = false;
                e.preventDefault();
            });
            
            touchDown.addEventListener('touchstart', (e) => {
                touchState.down = true;
                e.preventDefault();
            });
            
            touchDown.addEventListener('touchend', (e) => {
                touchState.down = false;
                e.preventDefault();
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            if (gameState.currentScreen === 'game-screen') {
                resizeCanvas();
            }
        });
        
        // Settings toggles - with error handling
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                settings.soundEnabled = e.target.checked;
                saveSettings();
            });
        }
        
        const particlesToggle = document.getElementById('particles-toggle');
        if (particlesToggle) {
            particlesToggle.addEventListener('change', (e) => {
                settings.particlesEnabled = e.target.checked;
                saveSettings();
            });
        }
        
        const shakeToggle = document.getElementById('shake-toggle');
        if (shakeToggle) {
            shakeToggle.addEventListener('change', (e) => {
                settings.screenShakeEnabled = e.target.checked;
                saveSettings();
            });
        }
        
        const fpsToggle = document.getElementById('fps-toggle');
        if (fpsToggle) {
            fpsToggle.addEventListener('change', (e) => {
                settings.showFPS = e.target.checked;
                const fpsDisplay = document.getElementById('fps-display');
                if (fpsDisplay) {
                    fpsDisplay.style.display = e.target.checked ? 'block' : 'none';
                }
                saveSettings();
            });
        }
        
        console.log('Event listeners setup complete');
    } catch (error) {
        console.error('Error setting up event listeners:', error);
    }
}

function gameLoop(currentTime = 0) {
    // Calculate FPS
    const deltaTime = currentTime - gameState.lastFrameTime;
    gameState.lastFrameTime = currentTime;
    
    if (deltaTime > 0) {
        gameState.fpsCounter++;
        gameState.fpsTimer += deltaTime;
        
        if (gameState.fpsTimer >= 1000) {
            gameState.fps = Math.round(gameState.fpsCounter * 1000 / gameState.fpsTimer);
            gameState.fpsCounter = 0;
            gameState.fpsTimer = 0;
            
            if (settings.showFPS) {
                document.getElementById('fps-display').textContent = `FPS: ${gameState.fps}`;
            }
        }
    }
    
    if (gameState.isPlaying && !gameState.isPaused) {
        update();
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update game timer
    if (gameState.gameMode === 'timeAttack') {
        gameState.gameTimer += 1/60; // Assuming 60fps
        const remaining = Math.max(0, gameState.timeLimit - gameState.gameTimer);
        document.getElementById('timer-display').textContent = `${Math.ceil(remaining)}s`;
        
        if (remaining <= 0) {
            endGame();
            return;
        }
    }
    
    // Update game objects
    gameState.ball.update();
    gameState.playerPaddle.update();
    gameState.aiPaddle.update();
    
    // Update power-ups
    if (gameState.gameMode !== 'practice') {
        gameState.powerupSpawnTimer++;
        if (gameState.powerupSpawnTimer > 600) { // 10 seconds
            spawnPowerUp();
            gameState.powerupSpawnTimer = 0;
        }
        
        gameState.activePowerups = gameState.activePowerups.filter(powerup => powerup.update());
    }
    
    // Update particles
    gameState.particles = gameState.particles.filter(particle => particle.update());
    
    // Update screen shake
    if (gameState.screenShake > 0) {
        gameState.screenShake -= 0.5;
    }
    
    // Update survival mode difficulty
    if (gameState.gameMode === 'survival') {
        const totalScore = gameState.playerScore + gameState.aiScore;
        if (totalScore > 0 && totalScore % 5 === 0) {
            gameState.difficulty = Math.min(4, Math.floor(totalScore / 5) + 1);
            updateAIDisplay();
        }
    }
}

function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    
    // Apply screen shake
    if (gameState.screenShake > 0 && settings.screenShakeEnabled) {
        const shakeX = (Math.random() - 0.5) * gameState.screenShake;
        const shakeY = (Math.random() - 0.5) * gameState.screenShake;
        ctx.translate(shakeX, shakeY);
    }
    
    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw game objects
    gameState.playerPaddle.draw();
    gameState.aiPaddle.draw();
    gameState.ball.draw();
    
    // Draw power-ups
    gameState.activePowerups.forEach(powerup => powerup.draw());
    
    // Draw particles
    gameState.particles.forEach(particle => particle.draw());
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Update HUD
    updateHUD();
}

function spawnPowerUp() {
    const types = ['speed', 'size', 'multi', 'slow'];
    const type = types[Math.floor(Math.random() * types.length)];
    const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.4;
    const y = 50 + Math.random() * (canvas.height - 100);
    
    gameState.activePowerups.push(new PowerUp(x, y, type));
}

function updateHUD() {
    document.getElementById('player-score').textContent = gameState.playerScore;
    document.getElementById('ai-score').textContent = gameState.aiScore;
}

function updateAIDisplay() {
    const personality = getAIPersonality();
    const difficulties = ['Beginner', 'Intermediate', 'Expert', 'Impossible'];
    const difficultyName = difficulties[gameState.difficulty - 1];
    
    document.getElementById('ai-info').textContent = `${personality.name} AI - ${difficultyName}`;
}

function checkGameEnd() {
    let gameEnded = false;
    
    switch (gameState.gameMode) {
        case 'classic':
            if (gameState.playerScore >= gameState.targetScore || gameState.aiScore >= gameState.targetScore) {
                gameEnded = true;
            }
            break;
        case 'timeAttack':
            // Handled in update loop
            break;
        case 'survival':
            if (gameState.aiScore >= 3) { // Player loses after 3 AI points
                gameEnded = true;
            }
            break;
        case 'practice':
            // No end condition
            break;
    }
    
    if (gameEnded) {
        endGame();
    }
}

function endGame() {
    gameState.isPlaying = false;
    
    // Calculate stats
    const totalPoints = gameState.playerScore + gameState.aiScore;
    const winRate = totalPoints > 0 ? (gameState.playerScore / totalPoints * 100).toFixed(1) : 0;
    const gameLength = gameState.gameTimer;
    
    // Update results display
    const isVictory = gameState.playerScore > gameState.aiScore;
    const resultTitle = document.getElementById('result-title');
    resultTitle.textContent = isVictory ? 'Victory!' : 'Defeat!';
    resultTitle.className = isVictory ? 'result-title victory' : 'result-title defeat';
    
    document.getElementById('final-player-score').textContent = gameState.playerScore;
    document.getElementById('final-ai-score').textContent = gameState.aiScore;
    
    // Show stats
    const statsContainer = document.getElementById('game-stats');
    statsContainer.innerHTML = `
        <div class="stat-row">
            <span class="stat-label">Game Mode:</span>
            <span class="stat-value">${gameState.gameMode.charAt(0).toUpperCase() + gameState.gameMode.slice(1)}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">AI Difficulty:</span>
            <span class="stat-value">${['Beginner', 'Intermediate', 'Expert', 'Impossible'][gameState.difficulty - 1]}</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Win Rate:</span>
            <span class="stat-value">${winRate}%</span>
        </div>
        <div class="stat-row">
            <span class="stat-label">Game Length:</span>
            <span class="stat-value">${Math.floor(gameLength)}s</span>
        </div>
    `;
    
    // Save record
    saveRecord();
    
    // Show game over screen
    showScreen('game-over');
}

// Screen Management
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenName).classList.add('active');
    gameState.currentScreen = screenName;
    
    if (screenName === 'game-screen') {
        resizeCanvas();
    }
}

function showMainMenu() {
    gameState.isPlaying = false;
    gameState.isPaused = false;
    showScreen('main-menu');
}

function showGameSetup() {
    showScreen('game-setup');
}

function showRecords() {
    loadRecords();
    showScreen('records');
}

function showSettings() {
    // Update toggle states
    document.getElementById('sound-toggle').checked = settings.soundEnabled;
    document.getElementById('particles-toggle').checked = settings.particlesEnabled;
    document.getElementById('shake-toggle').checked = settings.screenShakeEnabled;
    document.getElementById('fps-toggle').checked = settings.showFPS;
    
    showScreen('settings');
}

function startGame() {
    // Get selected options
    gameState.gameMode = document.querySelector('input[name="gameMode"]:checked').value;
    gameState.difficulty = parseInt(document.getElementById('difficulty').value);
    gameState.aiPersonality = document.querySelector('input[name="aiPersonality"]:checked').value;
    
    // Reset game state
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.gameTimer = 0;
    gameState.activePowerups = [];
    gameState.powerupSpawnTimer = 0;
    gameState.particles = [];
    gameState.screenShake = 0;
    
    // Set game mode specific settings
    switch (gameState.gameMode) {
        case 'classic':
            gameState.targetScore = 10;
            break;
        case 'timeAttack':
            gameState.timeLimit = 120;
            break;
        case 'survival':
            gameState.targetScore = Infinity;
            break;
        case 'practice':
            gameState.targetScore = Infinity;
            break;
    }
    
    // Initialize game objects
    if (gameState.ball) {
        gameState.ball.reset();
        gameState.playerPaddle.y = canvas.height / 2 - 40;
        gameState.aiPaddle.y = canvas.height / 2 - 40;
    }
    
    // Update displays
    document.getElementById('mode-display').textContent = gameState.gameMode.charAt(0).toUpperCase() + gameState.gameMode.slice(1) + ' Mode';
    updateAIDisplay();
    
    // Show timer for time attack
    document.getElementById('timer-display').style.display = 
        gameState.gameMode === 'timeAttack' ? 'block' : 'none';
    
    gameState.isPlaying = true;
    gameState.isPaused = false;
    showScreen('game-screen');
}

function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = !gameState.isPaused;
    
    if (gameState.isPaused) {
        showScreen('pause-screen');
        document.getElementById('pause-icon').textContent = '▶️';
    } else {
        showScreen('game-screen');
        document.getElementById('pause-icon').textContent = '⏸️';
    }
}

function resumeGame() {
    gameState.isPaused = false;
    showScreen('game-screen');
    document.getElementById('pause-icon').textContent = '⏸️';
}

function playAgain() {
    startGame();
}

// Power-up Notifications
function showPowerupNotification(name) {
    const notification = document.getElementById('powerup-notification');
    notification.querySelector('.powerup-text').textContent = name;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

// Local Storage
function saveSettings() {
    localStorage.setItem('modernPongSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('modernPongSettings');
    if (saved) {
        Object.assign(settings, JSON.parse(saved));
    }
}

function saveRecord() {
    const records = JSON.parse(localStorage.getItem('modernPongRecords') || '{}');
    
    const key = `${gameState.gameMode}_${gameState.difficulty}_${gameState.aiPersonality}`;
    const currentRecord = records[key] || { bestScore: 0, gamesPlayed: 0, totalWins: 0 };
    
    currentRecord.gamesPlayed++;
    if (gameState.playerScore > gameState.aiScore) {
        currentRecord.totalWins++;
    }
    if (gameState.playerScore > currentRecord.bestScore) {
        currentRecord.bestScore = gameState.playerScore;
    }
    
    records[key] = currentRecord;
    localStorage.setItem('modernPongRecords', JSON.stringify(records));
}

function loadRecords() {
    const records = JSON.parse(localStorage.getItem('modernPongRecords') || '{}');
    const recordsGrid = document.getElementById('records-grid');
    
    recordsGrid.innerHTML = '';
    
    if (Object.keys(records).length === 0) {
        recordsGrid.innerHTML = '<p style="text-align: center; color: #aaa;">No records yet. Play some games!</p>';
        return;
    }
    
    const modes = ['classic', 'timeAttack', 'survival', 'practice'];
    const difficulties = ['Beginner', 'Intermediate', 'Expert', 'Impossible'];
    const personalities = ['Casual', 'Aggressive', 'Defensive'];
    
    Object.entries(records).forEach(([key, record]) => {
        const [mode, difficulty, personality] = key.split('_');
        const winRate = record.gamesPlayed > 0 ? (record.totalWins / record.gamesPlayed * 100).toFixed(1) : 0;
        
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        recordCard.innerHTML = `
            <div class="record-title">${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</div>
            <div class="record-details">
                <div class="record-item">
                    <div class="record-label">Best Score</div>
                    <div class="record-value">${record.bestScore}</div>
                </div>
                <div class="record-item">
                    <div class="record-label">Games Played</div>
                    <div class="record-value">${record.gamesPlayed}</div>
                </div>
                <div class="record-item">
                    <div class="record-label">Win Rate</div>
                    <div class="record-value">${winRate}%</div>
                </div>
                <div class="record-item">
                    <div class="record-label">AI Setup</div>
                    <div class="record-value">${personalities[parseInt(personality)] || personality} ${difficulties[parseInt(difficulty) - 1] || difficulty}</div>
                </div>
            </div>
        `;
        
        recordsGrid.appendChild(recordCard);
    });
}

function clearRecords() {
    if (confirm('Are you sure you want to clear all records?')) {
        localStorage.removeItem('modernPongRecords');
        loadRecords();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting initialization...');
    
    // Add a small delay to ensure all elements are ready
    setTimeout(() => {
        initGame();
    }, 100);
});