class StatesManagerConfigStates {
    constructor() {
        this.contents = {
            IDLE: { action: 'showGameMenu' },

            GAME_LEVEL_START: {
                all: [
                    { action: 'showLevelComponent' },
                    { action: 'movePlaneOnStart' },
                    { action: 'startLevels' },
                ]
            },

            GAME_LEVEL_FINISHING: { action: 'levelFinish' },


        }
    }

    get() {
        debugger
        return this.contents;
    };

}

module.exports = StatesManagerConfigStates;
