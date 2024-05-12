class StatesManagerController {
    constructor() {

        this.action = false;
        this._nameOfState = 'INIT';
        this._currentState = false;
        this.createdGameActions = [];
debugger
        if (CoreXam.App.Modules && CoreXam.App.Modules.ConfigStates) {
            this.configStates = new CoreXam.App.Modules.ConfigStates();

            if (CoreXam.App.Modules.Actions) {
                this.gameActions = CoreXam.App.Modules.Actions;
            }

        } else {

        }
    }

    _getCurrentState() {
        this._currentState = this.configStates.contents[this._nameOfState];
        this.actionEventNextStage = new CustomEvent('StatesManager.action.NextStage', { 'detail': this._nameOfState, });
        this.statesManagerEventRun = new CustomEvent('StatesManager.states.Run', { 'detail': this._nameOfState, });
        this.statesManagerEventFinish = new CustomEvent('StatesManager.states.Finish', { 'detail': this._nameOfState, });
    }

    startState() {
        console.log('%c State ' + this._nameOfState, 'background: #bada55; color: #000');
        dispatchEvent(this.statesManagerEventRun);
        CoreXam.gameStage.currentStage = this._nameOfState;
        if (this._currentState) {
            if (this._currentState.action) {
                this._runAction(this._currentState.action);
            }

            if (this._currentState.all) {
                this._currentState.all.forEach(actionAll => {
                    this._runAction(actionAll.action);
                });
            }

            console.log('%c State finish ' + this._nameOfState, 'background: #bada55; color: #000');
            dispatchEvent(this.statesManagerEventFinish);
        } else {
            return
        }
    }
    _runAction(action) {
        const actionOptions = action.split('.');
        const actionName = actionOptions[0];
        const optionName = actionOptions[1];
        let actionObject = false;
        for (let actionClass in this.gameActions) {

            if (actionName === actionClass) {
                actionObject = this.createdGameActions.find(action => action.name === actionName);
                if (actionObject) {

                } else {
                    actionObject = new this.gameActions[actionClass](actionName, optionName);
                    this.createdGameActions.push(actionObject)
                }

                actionObject.run(actionName, optionName);
                actionObject._onFinish();
            }
        }
    }

    pause() {

    }

    resume() {

    }

    _nextState(nameNextStage) {
        this._nameOfState = nameNextStage;
        this._getCurrentState();
        this.startState();
    }
    _subscribe() {
        addEventListener('StatesManager.action.NextStage', (event) => {
            this._nextState(event.detail)
        })
    }
}

module.exports = StatesManagerController;
