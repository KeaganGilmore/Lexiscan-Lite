/**
 * Lexiscan-Lite - Audio Manager
 * Handles phoneme pronunciation with consistent, neutral delivery.
 */
export default class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.preferredVoice = null;
        this.isReady = false;

        // Load voices
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        // Prefer neutral, clear voices
        this.preferredVoice = this.voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Microsoft Zira') ||
            v.name.includes('Samantha') ||
            v.lang.startsWith('en')
        ) || this.voices[0];

        this.isReady = this.voices.length > 0;
    }

    /**
     * Speak a phoneme clearly and neutrally.
     * @param {string} text - The phoneme or letter to speak
     * @returns {Promise} - Resolves when speech is complete
     */
    speak(text) {
        return new Promise((resolve) => {
            if (this.synth.speaking) {
                this.synth.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);

            if (this.preferredVoice) {
                utterance.voice = this.preferredVoice;
            }

            // Clinical settings: clear, neutral, consistent
            utterance.rate = 0.8;    // Slightly slower for clarity
            utterance.pitch = 1.0;   // Neutral pitch
            utterance.volume = 1.0;  // Full volume

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve(); // Don't block on errors

            this.synth.speak(utterance);
        });
    }

    /**
     * Cancel any ongoing speech
     */
    cancel() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
    }
}
