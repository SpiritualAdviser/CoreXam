
class PauseGame {
    constructor() {
        this._subscribe();
        this.eventStopGame = new Event('game.stop');
        this.eventRuningGame = new Event('game.runing');
        this.gameSheetStyle = document.styleSheets[0];
        this.rulesInserted = false;
        this.indexRules = 0;
    }

    _gameStop() {
        CoreXam.gameStage.palayGame = 'stop';
        this.addCssRules('none', this.indexRules);
        this.stopAnimation();
        dispatchEvent(this.eventStopGame);
    }

    _gameRuning() {
        CoreXam.gameStage.palayGame = 'run';
        this.startAnimation();
        this.deleteCssRules(this.indexRules);
        dispatchEvent(this.eventRuningGame);
    }

    stopAnimation() {
        this.gameCanvases = document.querySelectorAll('canvas');

        if (this.gameCanvases) {
            this.gameCanvases.forEach(canvas => {
                canvas.sprite.stop();
            });
        }
    }

    startAnimation() {
        if (this.gameCanvases) {
            this.gameCanvases.forEach(canvas => {
                canvas.sprite.play();
            });
        }
    }

    addCssRules(pointerEvents, index) {

        if (!this.rulesInserted) {
            let rule = (`* {animation-play-state: paused; pointer-events: ${pointerEvents};}`);
            this.gameSheetStyle.insertRule(rule, index);
            this.rulesInserted = true;
        }
    }

    deleteCssRules(index) {
        if (this.rulesInserted) {
            this.gameSheetStyle.deleteRule(index);
            this.rulesInserted = false;
        }
    }

    _subscribe() {
        addEventListener('pauseGame.geme.run', this._gameRuning.bind(this));
        addEventListener('pauseGame.geme.stop', this._gameStop.bind(this));
    };
}

module.exports = PauseGame;