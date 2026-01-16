/**
 * Lexiscan-Lite - Data Manager
 * Handles comprehensive metrics collection for clinical analysis.
 * Records: reaction times, error patterns, confusion matrices, timing distributions.
 */
export default class DataManager {
    constructor() {
        this.sessionData = {
            id: this.generateSessionId(),
            startTime: new Date().toISOString(),
            endTime: null,
            tasks: [],
            // Confusion matrix for error pattern analysis
            confusionMatrix: {},
            // Font comparison data
            fontComparison: { standard: null, dyslexia: null }
        };
        this.currentTask = null;
        this.itemStartTime = null; // Per-item timing
    }

    generateSessionId() {
        return 'LS-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
    }

    startTask(taskId, taskType, config = {}) {
        this.currentTask = {
            taskId,
            taskType,
            font: config.font || 'standard',
            startTime: Date.now(),
            endTime: null,
            trials: [],
            // Summary stats calculated at end
            summary: null
        };
    }

    startTrial(target, distractors, trialIndex) {
        this.itemStartTime = Date.now();
        return {
            trialIndex,
            target,
            distractors,
            presentedAt: this.itemStartTime
        };
    }

    recordResponse(trialData, selected, wasTimeout = false) {
        if (!this.currentTask) return;

        const reactionTime = wasTimeout ? null : (Date.now() - this.itemStartTime);
        const isCorrect = selected === trialData.target;

        const trial = {
            ...trialData,
            selected,
            isCorrect,
            reactionTime,
            wasTimeout,
            respondedAt: Date.now()
        };

        this.currentTask.trials.push(trial);

        // Update confusion matrix
        if (!isCorrect && selected !== null) {
            const key = `${trialData.target}->${selected}`;
            this.sessionData.confusionMatrix[key] = (this.sessionData.confusionMatrix[key] || 0) + 1;
        }

        return trial;
    }

    endTask() {
        if (!this.currentTask) return null;

        this.currentTask.endTime = Date.now();
        const trials = this.currentTask.trials;

        // Calculate summary statistics
        const completed = trials.filter(t => !t.wasTimeout);
        const correct = trials.filter(t => t.isCorrect);
        const reactionTimes = completed.map(t => t.reactionTime).filter(t => t !== null);

        this.currentTask.summary = {
            totalTrials: trials.length,
            completedTrials: completed.length,
            correctCount: correct.length,
            accuracy: completed.length > 0 ? (correct.length / completed.length) * 100 : 0,
            timeouts: trials.filter(t => t.wasTimeout).length,
            meanRT: reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : null,
            medianRT: this.median(reactionTimes),
            rtStdDev: this.stdDev(reactionTimes),
            duration: (this.currentTask.endTime - this.currentTask.startTime) / 1000
        };

        this.sessionData.tasks.push(this.currentTask);
        const completedTask = this.currentTask;
        this.currentTask = null;
        return completedTask;
    }

    // Calculate attention stability score (variance in RT across repeated tasks)
    calculateAttentionStability() {
        const allRTs = this.sessionData.tasks.flatMap(t =>
            t.trials.filter(tr => tr.reactionTime !== null).map(tr => tr.reactionTime)
        );
        return {
            overallStdDev: this.stdDev(allRTs),
            coefficientOfVariation: allRTs.length > 0 ? (this.stdDev(allRTs) / this.mean(allRTs)) * 100 : null
        };
    }

    // Find repeated error patterns (same confusion 2+ times)
    getRepeatedConfusions() {
        return Object.entries(this.sessionData.confusionMatrix)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1]);
    }

    exportJSON() {
        this.sessionData.endTime = new Date().toISOString();
        this.sessionData.attentionStability = this.calculateAttentionStability();
        this.sessionData.repeatedConfusions = this.getRepeatedConfusions();

        return JSON.stringify(this.sessionData, null, 2);
    }

    exportCSV() {
        this.sessionData.endTime = new Date().toISOString();
        let csv = '';

        // Header info
        csv += `Lexiscan-Lite Screening Report\n`;
        csv += `Session ID,${this.sessionData.id}\n`;
        csv += `Date,${this.sessionData.startTime}\n\n`;

        // Task Summary
        csv += `TASK SUMMARY\n`;
        csv += `Task,Type,Font,Trials,Correct,Accuracy(%),MeanRT(ms),MedianRT(ms),RTStdDev,Timeouts\n`;

        this.sessionData.tasks.forEach((task, i) => {
            const s = task.summary;
            csv += [
                i + 1,
                task.taskType,
                task.font,
                s.totalTrials,
                s.correctCount,
                s.accuracy.toFixed(1),
                s.meanRT ? s.meanRT.toFixed(0) : 'N/A',
                s.medianRT ? s.medianRT.toFixed(0) : 'N/A',
                s.rtStdDev ? s.rtStdDev.toFixed(0) : 'N/A',
                s.timeouts
            ].join(',') + '\n';
        });

        // Error Pattern Analysis
        csv += `\nERROR PATTERN ANALYSIS\n`;
        csv += `Confusion,Count\n`;
        const confusions = this.getRepeatedConfusions();
        if (confusions.length === 0) {
            csv += `No repeated confusions detected\n`;
        } else {
            confusions.forEach(([key, count]) => {
                csv += `"${key}",${count}\n`;
            });
        }

        // Attention Stability
        const stability = this.calculateAttentionStability();
        csv += `\nATTENTION STABILITY\n`;
        csv += `Metric,Value\n`;
        csv += `RT Standard Deviation,${stability.overallStdDev ? stability.overallStdDev.toFixed(0) + 'ms' : 'N/A'}\n`;
        csv += `Coefficient of Variation,${stability.coefficientOfVariation ? stability.coefficientOfVariation.toFixed(1) + '%' : 'N/A'}\n`;

        // Detailed Trial Log
        csv += `\nDETAILED TRIAL LOG\n`;
        csv += `Task,Trial,Target,Selected,Correct,RT(ms),Timeout\n`;

        this.sessionData.tasks.forEach((task, taskIndex) => {
            task.trials.forEach((trial, trialIndex) => {
                csv += [
                    taskIndex + 1,
                    trialIndex + 1,
                    `"${trial.target}"`,
                    `"${trial.selected || 'TIMEOUT'}"`,
                    trial.isCorrect,
                    trial.reactionTime || 'N/A',
                    trial.wasTimeout
                ].join(',') + '\n';
            });
        });

        // Clinical Notes
        csv += `\nCLINICAL INTERPRETATION NOTES\n`;
        csv += `"This is a SCREENING tool - not a diagnosis."\n`;
        csv += `"Repeated confusions (e.g. b->d) suggest phonological/visual processing issues."\n`;
        csv += `"High RT variance (CV > 30%) may indicate attention instability."\n`;
        csv += `"Failure on basic literacy tasks suggests instructional gaps."\n`;

        return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    }

    // Utility functions
    mean(arr) {
        return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }

    median(arr) {
        if (arr.length === 0) return null;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    stdDev(arr) {
        if (arr.length < 2) return null;
        const m = this.mean(arr);
        const squareDiffs = arr.map(v => Math.pow(v - m, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }
}
