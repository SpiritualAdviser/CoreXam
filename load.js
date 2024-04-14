
window.CoreXam = {
    runGame() {
        const BaseCoreLogics = new (require('./BaseCoreLogics.js'));
        BaseCoreLogics._runGame();
    }
};
CoreXam.CoreLogics = {
    SpriteLogic: require('./SpriteLogic.js'),
    BaseCoreLogics: require('./BaseCoreLogics.js'),
};

CoreXam.App = {
    Scene: require('./scene.js'),
    AssetsGroup: require('./assetsGroup.js'),
};
CoreXam.gameStage = {
    palayGame: 'run',
    curentLevel: 1,
    curentScore: [],
    isWin: false,
};

require('./modules/_info.js');


