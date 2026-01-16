/**
 * Audio Manager
 * Handles text-to-speech and sound effects.
 */
export default class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.preferredVoice = null;

        // Initialize voices
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
        this.loadVoices();
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        // Try to find a premium/natural sounding voice
        // Prioritize Google US English or similar
        this.preferredVoice = this.voices.find(voice =>
            voice.name.includes('Google US English') ||
            voice.name.includes('Samantha')
        ) || this.voices[0];
    }

    speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const utterThis = new SpeechSynthesisUtterance(text);
        if (this.preferredVoice) {
            utterThis.voice = this.preferredVoice;
        }
        utterThis.rate = 0.9; // Slightly slower for clarity
        utterThis.pitch = 1;
        this.synth.speak(utterThis);
    }

    playFeedback(isCorrect) {
        // Placeholder for simple beep sounds or UI clicks
        // In a full implementation, we'd use Audio() with mp3 files
        // For now, we keep it silent or use simple oscillator if robust web audio needed
        // Keeping it silent to "remain clinical" per user request (no wrong buzzer)
    }
}
