import AudioManager from './audio.js';
import DataManager from './data.js';
import { LEVELS, LEVEL_TYPES } from './levels.js';

export default class GameEngine {
    constructor() {
        this.audio = new AudioManager();
        this.data = new DataManager();
        this.currentLevelIndex = 0;
        this.currentLevel = null;

        // Game State
        this.isLevelActive = false;
        this.levelTimer = null;
        this.timeRemaining = 0;
        this.currentItemIndex = 0;
        this.shuffledItems = []; // For the current level run

        // DOM Elements
        this.screens = {
            landing: document.getElementById('screen-landing'),
            instructions: document.getElementById('screen-instructions'),
            game: document.getElementById('screen-game'),
            results: document.getElementById('screen-results')
        };

        this.ui = {
            displayLevel: document.getElementById('display-level'),
            timerBar: document.getElementById('timer-bar'),
            gameArea: document.getElementById('game-area'),
            gridContainer: document.getElementById('grid-container'),
            stimulusContainer: document.getElementById('stimulus-container'),
            stimulusText: document.getElementById('stimulus-text'),
            audioReplayBtn: document.getElementById('btn-audio-replay'),
            instructionTitle: document.getElementById('instruction-title'),
            instructionContent: document.getElementById('instruction-content'),
            feedbackOverlay: document.getElementById('feedback-overlay'),
            feedbackIcon: document.getElementById('feedback-icon')
        };

        // Bindings
        document.getElementById('btn-start-intro').addEventListener('click', () => this.showInstructions());
        document.getElementById('btn-start-level').addEventListener('click', () => this.startLevel());
        document.getElementById('btn-download').addEventListener('click', () => this.downloadResults());
        document.getElementById('btn-restart').addEventListener('click', () => location.reload()); // Simple reload for now
        this.ui.audioReplayBtn.addEventListener('click', () => this.replayAudio());
    }

    init() {
        console.log("Lexiscan-Lite Initialized");
    }

    switchScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    showInstructions() {
        // If we ran out of levels, finish
        if (this.currentLevelIndex >= LEVELS.length) {
            this.finishGame();
            return;
        }

        this.currentLevel = LEVELS[this.currentLevelIndex];
        this.ui.instructionTitle.textContent = this.currentLevel.title;
        this.ui.instructionContent.textContent = this.currentLevel.instruction;
        this.switchScreen('instructions');

        // Pre-shuffle items for this level run
        this.shuffledItems = this.shuffleArray([...this.currentLevel.items]);
        // Duplicate items if not enough for the duration? For now just loop or end early.
        // Better: cycle them if we run out.
    }

    startLevel() {
        this.data.startLevel(this.currentLevelIndex, this.currentLevel.type);
        this.switchScreen('game');
        this.ui.displayLevel.textContent = `${this.currentLevelIndex + 1}/${LEVELS.length}`;

        // Reset State
        this.isLevelActive = true;
        this.timeRemaining = this.currentLevel.duration;
        this.currentItemIndex = 0;

        // Start Timer
        this.updateTimerVisual();
        this.levelTimer = setInterval(() => this.tick(), 100); // 100ms precision

        // Show first item
        this.presentItem();
    }

    tick() {
        if (!this.isLevelActive) return;

        this.timeRemaining -= 0.1;
        this.updateTimerVisual();

        if (this.timeRemaining <= 0) {
            this.endLevel();
        }
    }

    updateTimerVisual() {
        const percentage = (this.timeRemaining / this.currentLevel.duration) * 100;
        this.ui.timerBar.style.width = `${Math.max(0, percentage)}%`;

        if (percentage < 20) {
            this.ui.timerBar.classList.add('warning');
        } else {
            this.ui.timerBar.classList.remove('warning');
        }
    }

    presentItem() {
        if (this.currentItemIndex >= this.shuffledItems.length) {
            // Loop back or end? Let's loop back for continuous play
            this.currentItemIndex = 0;
            this.shuffledItems = this.shuffleArray([...this.currentLevel.items]);
        }

        const item = this.shuffledItems[this.currentItemIndex];

        // Clear Grid
        this.ui.gridContainer.innerHTML = '';

        // Setup options (Target + Distractors)
        const options = [item.target, ...item.distractors];
        const shuffledOptions = this.shuffleArray(options);

        // Render Stimulus
        this.ui.stimulusContainer.classList.remove('hidden');
        if (this.currentLevel.type === LEVEL_TYPES.AUDIO_MATCH) {
            this.ui.stimulusText.textContent = "🔊"; // Icon for sound
            this.ui.audioReplayBtn.classList.remove('hidden');
            this.audio.speak(item.sound || item.target); // Speak immediately
        } else {
            // Visual Match
            this.ui.stimulusText.textContent = item.target;
            this.ui.audioReplayBtn.classList.add('hidden');
        }

        // Render Grid
        shuffledOptions.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'grid-item';
            btn.textContent = opt;
            btn.addEventListener('click', () => this.handleInteraction(item, opt, btn));
            this.ui.gridContainer.appendChild(btn);

            // Apply font size adjustment if needed via CSS classes
            // For rotated letters, we might need special CSS classes eventually
        });
    }

    replayAudio() {
        const item = this.shuffledItems[this.currentItemIndex];
        if (item) {
            this.audio.speak(item.sound || item.target);
        }
    }

    handleInteraction(item, selectedValue, btnElement) {
        if (!this.isLevelActive) return;

        // Debounce?
        // Check correctness
        const isCorrect = selectedValue === item.target;
        const timeTaken = Date.now() - this.data.currentLevelData.startTime; // Approximation per item

        // Visual Feedback
        if (isCorrect) {
            btnElement.classList.add('correct');
        } else {
            btnElement.classList.add('incorrect');
            // Highlight correct one? Maybe not for screening, just move on?
            // "Encouraging" -> Don't shame.
        }

        // Record Data
        this.data.recordInteraction(item.target, selectedValue, isCorrect, 0); // TODO: Calculate per-item delta time if needed

        // Move to next item after variable delay
        // Adaptive Timing: Fast for correct (flow), slower for incorrect (reflection)
        const delay = isCorrect ? 250 : 800;

        this.isLevelActive = false; // Pause input
        setTimeout(() => {
            this.isLevelActive = true;
            this.currentItemIndex++;
            this.presentItem();
        }, delay);
    }

    endLevel() {
        clearInterval(this.levelTimer);
        this.isLevelActive = false;
        this.data.endLevel();

        this.currentLevelIndex++;
        this.showInstructions(); // Go to next level
    }

    finishGame() {
        this.switchScreen('results');
    }

    downloadResults() {
        const csvContent = this.data.exportResults();
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `lexiscan_results_${timestamp}_${this.data.sessionData.id}.csv`;

        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Utility
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
