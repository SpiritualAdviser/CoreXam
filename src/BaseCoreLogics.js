const StatesManager = require('./modules/statesManager/controller.js');
const SpriteLogic = require('./SpriteLogic.js');
const ButtonsLogic = require('./modules/objects/buttons.js');
const PauseGame = require('./modules/gameLogic/pauseGame.js');
const Device = require('./modules/gameLogic/device.js');
// const Sounds = require('./modules/sound/audio.js');
class BaseCoreLogics {
    constructor() {

        this.scene = document.getElementById('scene');
        this.gameModules = [];
        this.gameComponents = [];
        if (!this.scene) {
            this.scene = document.createElement('div');
            this.scene.id = "scene";
            this.scene.className = "scene";
            document.body.append(this.scene);
        }
        this._subscribe();
    }
    _runGame() {
        const gameScene = new CoreXam.App.Scene();
        this.createComponents(gameScene.components);
        const pauseGame = new PauseGame();
        const device = new Device();
        // const sounds = new Sounds()

        if (this.gameComponents.length > 0) {

            this.gameComponents.forEach(conponent => {
                this.startLogic(conponent.Controller);
            })
        }

        if (this.gameModules.length > 0) {

            this.gameModules.forEach(modul => {
                this.startLogic(modul);
            })
        }

        const statesManager = new StatesManager();
        if (!CoreXam.App.Modules.AudioGame) {

            const eventGameSamplesLoaded = new Event('modules.audio.samples.loaded');
            dispatchEvent(eventGameSamplesLoaded);
        }
    }

    createComponents(gameElements, lastDivComponent) {

        if (gameElements.length > 0) {

            const appResourse = Object.entries(CoreXam.App);
            gameElements.forEach(componentOnScene => {
                const divComponent = document.createElement('div');
                divComponent.id = componentOnScene.componentName;
                divComponent.componentName = componentOnScene.componentName;

                divComponent.classList.add(componentOnScene.className);

                appResourse.forEach(typeResources => {

                    switch (typeResources[0]) {
                        case 'Components':
                            for (let key in typeResources[1]) {
                                if (key === divComponent.id) {
                                    const dataComponents = typeResources[1][key];
                                    this.sortData(divComponent, dataComponents, lastDivComponent);
                                }
                            }
                            break;
                        case 'Modules':

                            for (let key in typeResources[1]) {

                                if (key === divComponent.id) {
                                    const dataComponents = typeResources[1][key];
                                    this.gameModules.push(dataComponents);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                })
            });
        } else {
            const text = document.createElement('txt');
            text.innerHTML = 'game scene no components';
            text.style.fontSize = "45px";
            document.body.appendChild(text);
        }
    }

    sortData(newDivComponent, dataComponents, lastDivComponent) {

        for (let dataName in dataComponents) {
            switch (dataName) {
                case 'Template':

                    this.createAssets(dataComponents[dataName], newDivComponent);
                    const divComponent = lastDivComponent ? lastDivComponent : this.scene;

                    divComponent.append(newDivComponent);
                    break;
                case 'Controller':
                    this.gameComponents.push(dataComponents);
                    break;

                default:
                    break;
            }
        }
    }
    textyreChange() {
        debugger
    }
    createAssets(dataComponents, divComponent) {
        let assets = dataComponents;

        if (typeof (dataComponents) === 'function') {
            const template = new dataComponents;
            assets = template.assets;
        }
        assets.forEach(asset => {

            let model = false;

            if (asset.componentName) {
                const lastDivComponent = divComponent;
                this.createComponents([asset], lastDivComponent);
            } else {

                switch (asset.tag) {
                    case 'sprite':
                        model = this.createSprite(asset);

                        // this.setSpriteOptions(model, asset);
                        break;
                    case 'div':
                        model = this.createTemplateAssets(asset);
                        if (model.key) {
                            model.style.backgroundImage = `url(${this.getPath('img', model)}) `
                        }

                        break;
                    case 'img':
                        model = this.createTemplateAssets(asset);
                        model.src = this.getPath('img', model);
                        break;
                    case 'input':
                        model = this.createTemplateAssets(asset);
                        if (asset.type === 'image') {
                            model.src = this.getPath('img', model);
                        }
                        break;
                    case 'button':
                        let buttonModel = new ButtonsLogic(asset);
                        model = buttonModel.button;
                        break;
                    case 'container':
                        asset.tag = 'div';
                        model = this.createTemplateAssets(asset);
                        this.createAssets(asset.contents, model);
                        break;
                    default:
                        model = this.createTemplateAssets(asset);
                        break;
                }

                divComponent.append(model);

            }

        });
        return divComponent;
    }

    startLogic(dataComponents, divComponent) {

        let controller = new dataComponents;

        // divComponent.controller = controller;
    }

    createTemplateAssets(asset) {

        let model = false;
        for (const options in asset) {

            if (asset.hasOwnProperty(options)) {

                switch (options) {
                    case 'tag':
                        model = document.createElement(asset[options]);
                        break;
                    case 'contents':
                        break;
                    default:
                        model[options] = asset[options];
                        break;
                }
            }
        };
        return model;
    }

    createSprite(asset) {
        const canvas = document.createElement('canvas');
        canvas.className = asset.className;

        const instanceJson = CoreXam.App.AssetsGroup.json.find(file => file.key === asset.key);
        const framesOptions = instanceJson.bodyJson.frames;
        const allFrames = Object.values(instanceJson.bodyJson.frames);
        const animationParams = instanceJson.bodyJson.meta.frameTags;
        canvas.key = asset.key;

        if (asset.name) {
            canvas.name = asset.name;
        }
        if (asset.id) {
            canvas.id = asset.id;
        }
        let frameSize = false;

        for (const param in framesOptions) {
            if (param) {
                frameSize = framesOptions[param].sourceSize
                break
            }
        }
        canvas.width = frameSize.w;
        canvas.height = frameSize.h;
        const imageSprite = new Image();
        imageSprite.src = this.getPath('img', canvas);// need to resolve

        let spriteModel = new SpriteLogic({
            context: canvas.getContext('2d'),
            image: imageSprite,
            width: frameSize.w,
            height: frameSize.h,
            allFrames: allFrames,
            animationParams: animationParams,
            animationName: asset.animationName,
            animationRepeat: asset.animationRepeat,
            ticksPerFrame: asset.ticksPerFrame,
        })

        canvas.sprite = spriteModel;
        // spriteModel.start();

        return canvas;
    }

    getPath(typOfasset, model) {

        let path = false;
        const assets = CoreXam.App.AssetsGroup;

        switch (typOfasset) {
            case 'img':
                path = assets.image.find(asset => asset.key === model.key).src;
                break
            default:
                break;
        }
        return path
    }

    fullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitrequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullscreen) {
            element.mozRequestFullScreen();
        }
    }
    destroyElement(element, timeLazyDestroy) {

        if (timeLazyDestroy) {
            setTimeout(() => {
                element.remove();
            }, timeLazyDestroy);
        } else {
            element.remove();
        }
        // console.log('element destroed');
    }

    test() {
        setTimeout(() => {
            let event = new Event('Core.sceneWasCreated');
            dispatchEvent(event);
        }, 500);

    }
    // playSpriteAnimation(canvas, animationName, animationRepeat) {
    //     canvas.spriteModel.start(animationName, animationRepeat);

    // }
    // stopSpriteAnimation(canvas) {
    //     canvas.spriteModel.stopLoop();
    // }

    _subscribe() {
        addEventListener('modules.audio.samples.loaded', this.test)

    };
}
module.exports = BaseCoreLogics;
