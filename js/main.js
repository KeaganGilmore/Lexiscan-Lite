import GameEngine from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
    window.game.init();
});
