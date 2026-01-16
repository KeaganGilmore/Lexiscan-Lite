/**
 * Data Manager
 * Handles metrics collection and export.
 */
export default class DataManager {
    constructor() {
        this.sessionData = {
            id: this.generateSessionId(),
            timestamp: new Date().toISOString(),
            levels: []
        };
        this.currentLevelData = null;
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    startLevel(levelIndex, levelType) {
        this.currentLevelData = {
            levelIndex: levelIndex,
            type: levelType,
            attempts: 0,
            correct: 0,
            startTime: Date.now(),
            endTime: null,
            events: [] // Detailed click log
        };
    }

    recordInteraction(target, selected, isCorrect, timeTaken) {
        if (!this.currentLevelData) return;

        this.currentLevelData.attempts++;
        if (isCorrect) this.currentLevelData.correct++;

        this.currentLevelData.events.push({
            target,
            selected,
            isCorrect,
            timeTaken,
            timestamp: Date.now()
        });
    }

    endLevel() {
        if (this.currentLevelData) {
            this.currentLevelData.endTime = Date.now();
            this.currentLevelData.duration = (this.currentLevelData.endTime - this.currentLevelData.startTime) / 1000;
            this.currentLevelData.accuracy = (this.currentLevelData.correct / this.currentLevelData.attempts) * 100;
            this.sessionData.levels.push(this.currentLevelData);
            this.currentLevelData = null;
        }
    }

    exportResults() {
        // Prepare CSV
        let csvContent = "data:text/csv;charset=utf-8,";

        // Header
        csvContent += "Level,Type,Duration(s),Attempts,Correct,Accuracy(%),AvgResponseTime(ms)\n";

        this.sessionData.levels.forEach(level => {
            const avgTime = level.events.length > 0
                ? level.events.reduce((a, b) => a + b.timeTaken, 0) / level.events.length
                : 0;

            let row = [
                level.levelIndex + 1,
                level.type,
                level.duration.toFixed(2),
                level.attempts,
                level.correct,
                level.accuracy.toFixed(2),
                avgTime.toFixed(0)
            ].join(",");
            csvContent += row + "\r\n";
        });

        // Add detailed event log section
        csvContent += "\r\nDetailed Event Log\r\n";
        csvContent += "Level,Target,Selected,Correct,Time(ms)\n";

        this.sessionData.levels.forEach(level => {
            level.events.forEach(e => {
                let row = [
                    level.levelIndex + 1,
                    e.target,
                    e.selected,
                    e.isCorrect,
                    e.timeTaken
                ].join(",");
                csvContent += row + "\r\n";
            });
        });

        return encodeURI(csvContent);
    }
}
