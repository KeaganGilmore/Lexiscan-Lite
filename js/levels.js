/**
 * Level Configuration
 * Defines the progression of tasks.
 */

export const LEVEL_TYPES = {
    FAMILIARIZATION: 'warmup',
    VISUAL_MATCH: 'visual_match',
    AUDIO_MATCH: 'audio_match',
    RAPID_NAMING: 'rapid_naming'
};

export const LEVELS = [
    // --- Level 0: Warm Up ---
    {
        id: 'l0_intro',
        type: LEVEL_TYPES.FAMILIARIZATION,
        title: 'Warm Up',
        instruction: 'Find the letter you see at the top.',
        duration: 999, // Untimed mostly, but let's say generous
        items: [
            { target: 'A', distractors: ['B', 'C'] },
            { target: 'M', distractors: ['N', 'W'] },
            { target: 'O', distractors: ['Q', 'D'] }
        ]
    },

    // --- Level 0.5: Basic Literacy Check (Education Gap Screen) ---
    // Very simple words. Failure here suggests lack of instruction.
    {
        id: 'l0_literacy_check',
        type: LEVEL_TYPES.VISUAL_MATCH,
        title: 'Word Check',
        instruction: 'Find the word "THE".',
        duration: 20,
        items: [
            { target: 'THE', distractors: ['SHE', 'TEA'] },
            { target: 'AND', distractors: ['END', 'ANT'] },
            { target: 'CAT', distractors: ['BAT', 'CAP'] },
            { target: 'DOG', distractors: ['DIG', 'LOG'] },
            { target: 'IN', distractors: ['ON', 'IT'] },
            { target: 'FOR', distractors: ['FAR', 'FUR'] },
            { target: 'YOU', distractors: ['YES', 'YET'] },
            { target: 'IS', distractors: ['IF', 'IT'] }
        ]
    },

    // --- Level 1: Visual Discrimination (Simple) ---
    // Target: Upper case letters, distinct shapes
    {
        id: 'l1_visual_simple',
        type: LEVEL_TYPES.VISUAL_MATCH,
        title: 'Level 1: Letter Match',
        instruction: 'Click the matching letter as fast as you can.',
        duration: 20,
        items: [
            { target: 'T', distractors: ['I', 'L', 'H'] },
            { target: 'F', distractors: ['E', 'P', 'T'] },
            { target: 'R', distractors: ['P', 'B', 'K'] },
            { target: 'G', distractors: ['C', 'O', 'Q'] },
            { target: 'M', distractors: ['W', 'N', 'V'] },
            { target: 'L', distractors: ['I', 'J', 'T'] },
            { target: 'S', distractors: ['Z', '5', '8'] },
            { target: 'B', distractors: ['8', 'D', 'R'] },
        ]
    },

    // --- Level 2: Visual Discrimination (Confusable/Rotated) ---
    // Target: Lowercase b, d, p, q (Classic Dyslexia Indicators)
    {
        id: 'l2_visual_confusable',
        type: LEVEL_TYPES.VISUAL_MATCH,
        title: 'Level 2: Tricky Letters',
        instruction: 'Pay close attention. Match the letter exactly.',
        duration: 25,
        items: [
            { target: 'b', distractors: ['d', 'p', 'q'] },
            { target: 'd', distractors: ['b', 'q', 'p'] },
            { target: 'p', distractors: ['q', 'b', 'd'] },
            { target: 'q', distractors: ['p', 'd', 'b'] },
            { target: 'n', distractors: ['u', 'm', 'h'] },
            { target: 'u', distractors: ['n', 'v', 'c'] },
            { target: 'm', distractors: ['w', 'n', 'r'] },
            { target: 'w', distractors: ['m', 'v', 'u'] }
        ]
    },

    // --- Level 3: Phonological Awareness (Simple Sounds) ---
    // Target: Consonants
    {
        id: 'l3_audio_consonants',
        type: LEVEL_TYPES.AUDIO_MATCH,
        title: 'Level 3: Listen & Find',
        instruction: 'Listen to the sound and click the letter that makes that sound.',
        duration: 30,
        items: [
            { target: 'b', sound: 'b', distractors: ['d', 'v'] },
            { target: 'm', sound: 'm', distractors: ['n', 'b'] },
            { target: 's', sound: 's', distractors: ['c', 'z'] },
            { target: 'f', sound: 'f', distractors: ['v', 'th'] },
            { target: 't', sound: 't', distractors: ['d', 'k'] },
            { target: 'k', sound: 'k', distractors: ['g', 'c'] },
            { target: 'p', sound: 'p', distractors: ['b', 'q'] },
            { target: 'r', sound: 'r', distractors: ['l', 'w'] }
        ]
    },

    // --- Level 4: Differential Screening (Attention check) ---
    // Target: Simple, but repetitive. Sustained attention.
    // "Find the number" among letters
    {
        id: 'l4_attention',
        type: LEVEL_TYPES.VISUAL_MATCH, // Mechanic is the same
        title: 'Level 4: Spot the Number',
        instruction: 'Find the NUMBER hidden among the letters.',
        duration: 25,
        items: [
            { target: '4', distractors: ['A', 'H', 'Y'] },
            { target: '7', distractors: ['T', 'L', 'I'] },
            { target: '3', distractors: ['E', 'B', 'S'] },
            { target: '0', distractors: ['O', 'Q', 'D'] },
            { target: '1', distractors: ['I', 'l', '|'] },
            { target: '5', distractors: ['S', 'Z', '2'] },
            { target: '8', distractors: ['B', '0', '3'] },
            { target: '9', distractors: ['P', 'g', 'q'] }
        ]
    }
];
