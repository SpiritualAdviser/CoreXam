class StatesManagerBaseActione extends CoreXam.CoreLogics.BaseCoreLogics {

    constructor(actionName, actionOption) {
        super();
        this.name = actionName;
        this.actionOption = actionOption;
        this._terminating = false;
        this.finished = false;
        this._onFinishCallback = false;
        this._onFinish = this._onFinish.bind(this);
    }

    //can we start this action?
    guard() {
        return true;
    }

    run(actionName, optionName) {
        this.name = actionName;
        this.actionOption = optionName;
        this.actionEventRun = new CustomEvent('StatesManager.action.Run', { 'detail': `${this.name}.${this.actionOption}`, });
        this.actionEventFinish = new CustomEvent('StatesManager.action.Finish', { 'detail': `${this.name}.${this.actionOption}`, });
        console.log(`%c action run ---> ${this.name}.${this.actionOption}`, 'color: blue');
        dispatchEvent(this.actionEventRun);
    }
    _onFinish() {
        this._terminating = false;
        this.finished = true;
        dispatchEvent(this.actionEventFinish);
        console.log(`%c action finish <--- ${this.name}.${this.actionOption}`, 'color: blue');
        // this._onFinishCallback();
    }
}

module.exports = StatesManagerBaseActione;
