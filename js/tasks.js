/**
 * Lexiscan-Lite - Task Definitions
 * Clinically-informed task configurations based on dyslexia research.
 */

export const TASK_TYPES = {
    BASELINE_LITERACY: 'baseline_literacy',
    PHONEME_GRAPHEME: 'phoneme_grapheme',
    VISUAL_DISCRIMINATION: 'visual_discrimination',
    VISUAL_MASKING: 'visual_masking',
    LEXICAL_DECISION: 'lexical_decision',
    ATTENTION_STABILITY: 'attention_stability'
};

/**
 * Task configuration structure:
 * - id: unique identifier
 * - type: TASK_TYPES enum
 * - title: display title
 * - instruction: brief instruction text
 * - trialConfig: { timeout, maskDuration, flashDuration }
 * - trials: array of trial definitions
 * - isWarmup: if true, data is not used for scoring
 */
export const TASKS = [
    // ========== TASK 0: WARMUP (not scored) ==========
    {
        id: 'warmup',
        type: TASK_TYPES.VISUAL_DISCRIMINATION,
        title: 'Practice Round',
        instruction: 'Click the matching letter. This is just practice.',
        isWarmup: true,
        trialConfig: {
            timeout: 5000, // generous for practice
            showStimulus: true
        },
        trials: [
            { target: 'A', distractors: ['X', 'Z'] },
            { target: 'B', distractors: ['R', 'K'] }
        ]
    },

    // ========== TASK 1: BASELINE LITERACY CHECK ==========
    // Purpose: Catch instructional gaps (not dyslexia)
    {
        id: 'baseline_literacy',
        type: TASK_TYPES.BASELINE_LITERACY,
        title: 'Word Recognition',
        instruction: 'Find the matching word.',
        trialConfig: {
            timeout: 4000,
            showStimulus: true
        },
        trials: [
            { target: 'the', distractors: ['teh', 'hte'] },
            { target: 'and', distractors: ['nad', 'dna'] },
            { target: 'is', distractors: ['si', 'iz'] },
            { target: 'cat', distractors: ['cta', 'tac'] },
            { target: 'dog', distractors: ['god', 'dgo'] },
            { target: 'run', distractors: ['nur', 'unr'] }
        ]
    },

    // ========== TASK 2: PHONEME-GRAPHEME MATCHING (Audio) ==========
    // Core dyslexia indicator - sound to letter mapping
    {
        id: 'phoneme_grapheme',
        type: TASK_TYPES.PHONEME_GRAPHEME,
        title: 'Sound Matching',
        instruction: 'Listen to the sound. Click the letter that makes that sound.',
        trialConfig: {
            timeout: 3000, // Short window - reaction time matters
            playAudio: true
        },
        trials: [
            { target: 'b', phoneme: 'buh', distractors: ['d', 'p'] },
            { target: 'd', phoneme: 'duh', distractors: ['b', 't'] },
            { target: 'm', phoneme: 'mmm', distractors: ['n', 'w'] },
            { target: 'n', phoneme: 'nnn', distractors: ['m', 'h'] },
            { target: 's', phoneme: 'sss', distractors: ['z', 'c'] },
            { target: 'f', phoneme: 'fff', distractors: ['v', 'th'] },
            { target: 'p', phoneme: 'puh', distractors: ['b', 'q'] },
            { target: 't', phoneme: 'tuh', distractors: ['d', 'k'] },
            { target: 'k', phoneme: 'kuh', distractors: ['g', 'c'] },
            { target: 'g', phoneme: 'guh', distractors: ['k', 'j'] }
        ]
    },

    // ========== TASK 3: VISUAL DISCRIMINATION (b/d/p/q) ==========
    // Classic dyslexia confusions - mirror/rotation errors
    {
        id: 'visual_confusable',
        type: TASK_TYPES.VISUAL_DISCRIMINATION,
        title: 'Letter Match',
        instruction: 'Look carefully. Click the exact matching letter.',
        trialConfig: {
            timeout: 3000,
            showStimulus: true
        },
        trials: [
            { target: 'b', distractors: ['d', 'p', 'q'] },
            { target: 'd', distractors: ['b', 'q', 'p'] },
            { target: 'p', distractors: ['q', 'b', 'd'] },
            { target: 'q', distractors: ['p', 'd', 'b'] },
            { target: 'b', distractors: ['d', 'p', 'q'] }, // repeat for pattern detection
            { target: 'd', distractors: ['b', 'q', 'p'] },
            { target: 'n', distractors: ['u', 'h', 'm'] },
            { target: 'u', distractors: ['n', 'v', 'c'] },
            { target: 'm', distractors: ['w', 'nn', 'rn'] },
            { target: 'w', distractors: ['m', 'vv', 'uu'] }
        ]
    },

    // ========== TASK 4: VISUAL MASKING (Brief exposure) ==========
    // Tests visual processing speed - dyslexia shows consistent errors
    {
        id: 'visual_masking',
        type: TASK_TYPES.VISUAL_MASKING,
        title: 'Quick Look',
        instruction: 'A letter will flash briefly. Click what you saw.',
        trialConfig: {
            timeout: 3000,
            flashDuration: 400, // 400ms exposure
            maskDuration: 100  // 100ms fade
        },
        trials: [
            { target: 'b', distractors: ['d', 'p'] },
            { target: 'd', distractors: ['b', 'q'] },
            { target: 'p', distractors: ['q', 'b'] },
            { target: 'q', distractors: ['p', 'd'] },
            { target: 'n', distractors: ['u', 'm'] },
            { target: 'u', distractors: ['n', 'v'] },
            { target: 'was', distractors: ['saw', 'was'] }, // word reversal
            { target: 'on', distractors: ['no', 'on'] }
        ]
    },

    // ========== TASK 5: LEXICAL DECISION ==========
    // Real word vs pseudoword - dyslexia struggles disproportionately with pseudowords
    {
        id: 'lexical_decision',
        type: TASK_TYPES.LEXICAL_DECISION,
        title: 'Real or Not?',
        instruction: 'Is this a real word? Click YES or NO.',
        trialConfig: {
            timeout: 3000,
            binaryChoice: true
        },
        trials: [
            { stimulus: 'cat', isReal: true },
            { stimulus: 'plim', isReal: false },
            { stimulus: 'dog', isReal: true },
            { stimulus: 'frote', isReal: false },
            { stimulus: 'run', isReal: true },
            { stimulus: 'nalp', isReal: false },
            { stimulus: 'book', isReal: true },
            { stimulus: 'brone', isReal: false },
            { stimulus: 'tree', isReal: true },
            { stimulus: 'glorp', isReal: false },
            { stimulus: 'house', isReal: true },
            { stimulus: 'snorf', isReal: false }
        ]
    },

    // ========== TASK 6: ATTENTION STABILITY (Repeat of earlier task) ==========
    // Same structure as Task 3 - compare performance variance
    {
        id: 'attention_check',
        type: TASK_TYPES.ATTENTION_STABILITY,
        title: 'One More Time',
        instruction: 'Same as before. Click the matching letter.',
        trialConfig: {
            timeout: 3000,
            showStimulus: true
        },
        trials: [
            { target: 'b', distractors: ['d', 'p', 'q'] },
            { target: 'd', distractors: ['b', 'q', 'p'] },
            { target: 'p', distractors: ['q', 'b', 'd'] },
            { target: 'q', distractors: ['p', 'd', 'b'] },
            { target: 'n', distractors: ['u', 'h', 'm'] },
            { target: 'u', distractors: ['n', 'v', 'c'] }
        ]
    }
];

// Phoneme audio map (for Web Speech API pronunciation)
export const PHONEME_MAP = {
    'buh': 'b',
    'duh': 'd',
    'mmm': 'mmmm',
    'nnn': 'nnnn',
    'sss': 'ssss',
    'fff': 'ffff',
    'puh': 'p',
    'tuh': 't',
    'kuh': 'k',
    'guh': 'g'
};
