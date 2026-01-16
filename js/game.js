/**
 * Lexiscan-Lite - Game Engine
 * State machine for clinical screening flow with proper timing, masking, and neutral feedback.
 */
import AudioManager from './audio.js';
import DataManager from './data.js';
import { TASKS, TASK_TYPES, PHONEME_MAP } from './tasks.js';

const STATES = {
    IDLE: 'idle',
    INSTRUCTIONS: 'instructions',
    RUNNING: 'running',
    TRIAL_STIMULUS: 'trial_stimulus',
    TRIAL_RESPONSE: 'trial_response',
    TRIAL_TRANSITION: 'trial_transition',
    TASK_COMPLETE: 'task_complete',
    FINISHED: 'finished'
};

export default class GameEngine {
    constructor() {
        this.audio = new AudioManager();
        this.data = new DataManager();

        this.state = STATES.IDLE;
        this.currentTaskIndex = 0;
        this.currentTask = null;
        this.currentTrialIndex = 0;
        this.currentTrialData = null;
        this.trialTimeout = null;
        this.inputLocked = false;

        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        this.screens = {
            landing: document.getElementById('screen-landing'),
            instructions: document.getElementById('screen-instructions'),
            game: document.getElementById('screen-game'),
            results: document.getElementById('screen-results')
        };

        this.ui = {
            // HUD
            taskLabel: document.getElementById('task-label'),
            progressText: document.getElementById('progress-text'),
            timerBar: document.getElementById('timer-bar'),

            // Game Area
            stimulusContainer: document.getElementById('stimulus-container'),
            stimulusText: document.getElementById('stimulus-text'),
            gridContainer: document.getElementById('grid-container'),
            audioIcon: document.getElementById('audio-icon'),

            // Instructions
            instructionTitle: document.getElementById('instruction-title'),
            instructionContent: document.getElementById('instruction-content')
        };
    }

    bindEvents() {
        document.getElementById('btn-start').addEventListener('click', () => this.start());
        document.getElementById('btn-continue').addEventListener('click', () => this.startTask());
        document.getElementById('btn-download-csv').addEventListener('click', () => this.downloadCSV());
        document.getElementById('btn-download-json').addEventListener('click', () => this.downloadJSON());
        document.getElementById('btn-restart').addEventListener('click', () => location.reload());
    }

    init() {
        console.log('Lexiscan-Lite initialized. Session:', this.data.sessionData.id);
    }

    // ==================== SCREEN MANAGEMENT ====================

    switchScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        if (this.screens[name]) {
            this.screens[name].classList.add('active');
        }
    }

    // ==================== FLOW CONTROL ====================

    start() {
        this.currentTaskIndex = 0;
        this.showInstructions();
    }

    showInstructions() {
        if (this.currentTaskIndex >= TASKS.length) {
            this.finish();
            return;
        }

        this.currentTask = TASKS[this.currentTaskIndex];
        this.state = STATES.INSTRUCTIONS;

        this.ui.instructionTitle.textContent = this.currentTask.title;
        this.ui.instructionContent.textContent = this.currentTask.instruction;

        this.switchScreen('instructions');
    }

    startTask() {
        this.state = STATES.RUNNING;
        this.currentTrialIndex = 0;

        // Start data recording (skip warmup)
        if (!this.currentTask.isWarmup) {
            this.data.startTask(this.currentTask.id, this.currentTask.type);
        }

        // Update HUD
        this.ui.taskLabel.textContent = this.currentTask.title;
        this.updateProgress();

        this.switchScreen('game');
        this.runTrial();
    }

    updateProgress() {
        const total = this.currentTask.trials.length;
        const current = this.currentTrialIndex + 1;
        this.ui.progressText.textContent = `${current} / ${total}`;

        const pct = (current / total) * 100;
        this.ui.timerBar.style.width = `${pct}%`;
    }

    // ==================== TRIAL EXECUTION ====================

    async runTrial() {
        if (this.currentTrialIndex >= this.currentTask.trials.length) {
            this.completeTask();
            return;
        }

        const trial = this.currentTask.trials[this.currentTrialIndex];
        const config = this.currentTask.trialConfig;

        this.inputLocked = true;
        this.clearGameArea();
        this.updateProgress();

        // Handle different task types
        switch (this.currentTask.type) {
            case TASK_TYPES.LEXICAL_DECISION:
                await this.runLexicalDecisionTrial(trial, config);
                break;
            case TASK_TYPES.VISUAL_MASKING:
                await this.runMaskingTrial(trial, config);
                break;
            case TASK_TYPES.PHONEME_GRAPHEME:
                await this.runPhonemeGraphemeTrial(trial, config);
                break;
            default:
                await this.runStandardTrial(trial, config);
                break;
        }
    }

    // --- Standard Visual Trial ---
    async runStandardTrial(trial, config) {
        // Show stimulus
        this.ui.stimulusContainer.classList.remove('hidden');
        this.ui.stimulusText.textContent = trial.target;
        this.ui.stimulusText.classList.remove('masked');
        this.ui.audioIcon.classList.add('hidden');

        // Start timing
        this.currentTrialData = this.data.startTrial(trial.target, trial.distractors, this.currentTrialIndex);

        // Render options
        const options = this.shuffleArray([trial.target, ...trial.distractors]);
        this.renderOptions(options, trial.target);

        // Unlock input
        this.inputLocked = false;

        // Start timeout
        this.startTrialTimeout(config.timeout);
    }

    // --- Phoneme-Grapheme Trial ---
    async runPhonemeGraphemeTrial(trial, config) {
        // Show audio icon
        this.ui.stimulusContainer.classList.remove('hidden');
        this.ui.stimulusText.textContent = '🔊';
        this.ui.audioIcon.classList.remove('hidden');

        // Play phoneme
        await this.audio.speak(trial.phoneme || trial.target);

        // Start timing AFTER audio finishes
        this.currentTrialData = this.data.startTrial(trial.target, trial.distractors, this.currentTrialIndex);

        // Render options
        const options = this.shuffleArray([trial.target, ...trial.distractors]);
        this.renderOptions(options, trial.target);

        this.inputLocked = false;
        this.startTrialTimeout(config.timeout);
    }

    // --- Visual Masking Trial ---
    async runMaskingTrial(trial, config) {
        // Flash stimulus briefly
        this.ui.stimulusContainer.classList.remove('hidden');
        this.ui.stimulusText.textContent = trial.target;
        this.ui.stimulusText.classList.remove('masked');
        this.ui.audioIcon.classList.add('hidden');

        // Wait for flash duration
        await this.delay(config.flashDuration || 400);

        // Mask stimulus (fade out)
        this.ui.stimulusText.classList.add('masked');
        await this.delay(config.maskDuration || 100);

        // Hide stimulus completely
        this.ui.stimulusText.textContent = '?';

        // Start timing
        this.currentTrialData = this.data.startTrial(trial.target, trial.distractors, this.currentTrialIndex);

        // Render options
        const options = this.shuffleArray([trial.target, ...trial.distractors]);
        this.renderOptions(options, trial.target);

        this.inputLocked = false;
        this.startTrialTimeout(config.timeout);
    }

    // --- Lexical Decision Trial ---
    async runLexicalDecisionTrial(trial, config) {
        this.ui.stimulusContainer.classList.remove('hidden');
        this.ui.stimulusText.textContent = trial.stimulus;
        this.ui.audioIcon.classList.add('hidden');

        // Start timing
        const targetValue = trial.isReal ? 'YES' : 'NO';
        this.currentTrialData = this.data.startTrial(targetValue, [trial.isReal ? 'NO' : 'YES'], this.currentTrialIndex);
        this.currentTrialData.stimulus = trial.stimulus;
        this.currentTrialData.isRealWord = trial.isReal;

        // Render YES/NO buttons
        this.renderBinaryChoice(targetValue);

        this.inputLocked = false;
        this.startTrialTimeout(config.timeout);
    }

    // ==================== RENDERING ====================

    clearGameArea() {
        this.ui.gridContainer.innerHTML = '';
        this.ui.stimulusContainer.classList.add('hidden');
        this.ui.stimulusText.classList.remove('masked');
    }

    renderOptions(options, target) {
        this.ui.gridContainer.innerHTML = '';
        this.ui.gridContainer.className = 'grid-container grid-' + options.length;

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'grid-item';
            btn.textContent = opt;
            btn.setAttribute('data-value', opt);
            btn.addEventListener('click', () => this.handleResponse(opt, btn));
            this.ui.gridContainer.appendChild(btn);
        });
    }

    renderBinaryChoice(correctAnswer) {
        this.ui.gridContainer.innerHTML = '';
        this.ui.gridContainer.className = 'grid-container grid-2';

        ['YES', 'NO'].forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'grid-item binary-choice';
            btn.textContent = choice;
            btn.setAttribute('data-value', choice);
            btn.addEventListener('click', () => this.handleResponse(choice, btn));
            this.ui.gridContainer.appendChild(btn);
        });
    }

    // ==================== RESPONSE HANDLING ====================

    handleResponse(selected, btnElement) {
        if (this.inputLocked) return;

        this.inputLocked = true;
        this.clearTrialTimeout();

        // Record response
        if (!this.currentTask.isWarmup) {
            this.data.recordResponse(this.currentTrialData, selected, false);
        }

        // NO visual feedback - neutral transition per clinical guidelines
        // Just move to next trial
        this.transitionToNextTrial();
    }

    handleTimeout() {
        if (this.inputLocked) return;

        this.inputLocked = true;

        // Record timeout
        if (!this.currentTask.isWarmup) {
            this.data.recordResponse(this.currentTrialData, null, true);
        }

        this.transitionToNextTrial();
    }

    transitionToNextTrial() {
        // Brief pause (minimal, neutral)
        setTimeout(() => {
            this.currentTrialIndex++;
            this.runTrial();
        }, 200); // Very short - just enough to register transition
    }

    startTrialTimeout(ms) {
        this.clearTrialTimeout();
        this.trialTimeout = setTimeout(() => this.handleTimeout(), ms);
    }

    clearTrialTimeout() {
        if (this.trialTimeout) {
            clearTimeout(this.trialTimeout);
            this.trialTimeout = null;
        }
    }

    // ==================== TASK COMPLETION ====================

    completeTask() {
        this.clearTrialTimeout();

        if (!this.currentTask.isWarmup) {
            this.data.endTask();
        }

        this.currentTaskIndex++;
        this.showInstructions();
    }

    finish() {
        this.state = STATES.FINISHED;
        this.switchScreen('results');
    }

    // ==================== EXPORT ====================

    downloadCSV() {
        const csvContent = this.data.exportCSV();
        this.triggerDownload(csvContent, `lexiscan_${this.data.sessionData.id}.csv`);
    }

    downloadJSON() {
        const jsonContent = 'data:application/json;charset=utf-8,' + encodeURIComponent(this.data.exportJSON());
        this.triggerDownload(jsonContent, `lexiscan_${this.data.sessionData.id}.json`);
    }

    triggerDownload(dataUri, filename) {
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ==================== UTILITIES ====================

    shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
