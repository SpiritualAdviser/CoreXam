
class CollisionBetween extends CoreXam.CoreLogics.BaseCoreLogics {
    constructor() {
        super();
        this.requestAnimationFrameloop = false;
        this.bulets = { mainObjects: [], skelets: [] };
        this.targets = { mainObjects: [], skelets: [] };
        this.destroyElements = [];
        this.tickCount = 0;
        this.ticksPerFrame = 2;
        this.eventIsCollisions = new Event('CollisionBetween.IsCollisions');
        this.eventObjectIsOutside = new Event('CollisionBetween.ObjectIsOutside');
        this.eventObjectOnDestroy = new Event('CollisionBetween.ObjectOnDestroy');
        this.colisionState = true;
    }

    run() {
        this.scene = document.getElementById('scene');
        let loop = () => {
            if (this.colisionState) {
                if (CoreXam.gameStage.palayGame === 'run') {
                    this.runCollision();
                }
                window.requestAnimationFrame(loop);
            }
        }
        this.requestAnimationFrameloop = window.requestAnimationFrame(loop);
    }

    addObjectToCollision(newObjectOnScene, typeOfObject) {

        if (typeOfObject === 'target') {
            this.getSkeletObject(newObjectOnScene, 'target');
        } else {
            this.getSkeletObject(newObjectOnScene, false);
        }
    }

    getSkeletObject(newObjectOnScene, typeOfObject) {// придумать нормальное имя
        let skeletsObject = false;

        if (newObjectOnScene.skeletId) {
            skeletsObject = newObjectOnScene.querySelectorAll(`#${newObjectOnScene.skeletId}`);
            skeletsObject.forEach(objectSkelet => {
                if (typeOfObject === 'target') {
                    this.targets.skelets.push(objectSkelet);
                } else {
                    this.bulets.skelets.push(objectSkelet);
                }
            });
        } else {
            if (typeOfObject === 'target') {
                this.targets.skelets.push(newObjectOnScene);
            } else {
                this.bulets.skelets.push(newObjectOnScene);
            }
        };

        if (typeOfObject === 'target') {
            this.targets.mainObjects.push(newObjectOnScene);
        } else {
            this.bulets.mainObjects.push(newObjectOnScene);
        }
    }

    collisionSwich(colisionState) {
        this.colisionState = colisionState;
        if (colisionState) {
            this.run();
        } else {
            this.bulets = { mainObjects: [], skelets: [] };
            this.targets = { mainObjects: [], skelets: [] };
        }
    }

    runCollision() {
        this.tickCount++;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            // console.log('runCollision');
            if (this.targets.skelets.length > 0) {
                this.targets.skelets.forEach(targetSkelet => {

                    this.bulets.skelets.forEach(buletSkelet => {
                        this.checkCollision(targetSkelet, buletSkelet)
                    })
                });
            } else if (this.bulets.skelets.length > 0) {
                this.bulets.skelets.forEach(buletSkelet => {
                    this.checkCollision(false, buletSkelet);
                })
            }
        }
    }

    checkCollision(targetSkelet, buletSkelet) { // need optimisation

        let IsCollision = false;
        const buletOpt = this.getCoords(buletSkelet);

        if (buletOpt.top > 0 && buletOpt.bottom < this.scene.clientHeight &&
            buletOpt.left > 0 && buletOpt.right < this.scene.clientWidth) {


        } else {
            buletSkelet.option = buletOpt;
            this.fireEventOnColision(this.eventObjectIsOutside, { element: buletSkelet });
        }

        if (targetSkelet) {
            const targetOpt = this.getCoords(targetSkelet);

            if (targetOpt.top > 0 && targetOpt.bottom < this.scene.clientHeight &&
                targetOpt.left > 0 && targetOpt.right < this.scene.clientWidth) {

                let xColl = false;
                let yColl = false;

                xColl = ((buletOpt.left + buletOpt.width) > targetOpt.left)
                    && (buletOpt.left < targetOpt.right);

                yColl = ((buletOpt.top + buletOpt.height) > targetOpt.top)
                    && (buletOpt.top < targetOpt.bottom)

                IsCollision = (xColl && yColl);

                if (IsCollision) {
                    targetSkelet.option = targetOpt;
                    buletSkelet.option = buletOpt;
                    this.fireEventOnColision(this.eventIsCollisions, { target: targetSkelet, bulet: buletSkelet, });
                }

            } else {
                targetSkelet.option = targetOpt;
                this.fireEventOnColision(this.eventObjectIsOutside, { element: targetSkelet });
            }
        }
    }

    getCoords(element) {
        let elementOptions = element.getBoundingClientRect();

        if (element.skeletOfset) {
            elementOptions = this.setSizeSkeletForm(elementOptions, element.skeletOfset);
        }
        return elementOptions;
    }

    removeCollision(element, needDestroy, timeLazyDestroy = false) {

        const selektorId = element.id;
        this.bulets.skelets = this.filterCollisionObjects(this.bulets.skelets, selektorId, needDestroy);
        this.bulets.mainObjects = this.filterCollisionObjects(this.bulets.mainObjects, selektorId, needDestroy, true);
        this.targets.skelets = this.filterCollisionObjects(this.targets.skelets, selektorId);
        this.targets.mainObjects = this.filterCollisionObjects(this.targets.mainObjects, selektorId, needDestroy, true);

        if (needDestroy && this.destroyElements.length > 0) {
            this.destroyElements.forEach(element => {
                this.destroyElement(element, timeLazyDestroy);
            });
            this.destroyElements = [];
        }
    }

    fireEventOnColision(eventName, detail) {
        eventName.detail = detail;
        dispatchEvent(eventName);
    }

    filterCollisionObjects(arrayObjects, selektorId, needDestroy, mainObjects) {
        let necessaryObjects = [];
        arrayObjects.forEach(element => {

            if (element.id === selektorId || element.skeletId === selektorId) {

                if (needDestroy) {
                    this.destroyElements.push(element);
                    if (mainObjects) {
                        this.fireEventOnColision(this.eventObjectOnDestroy, { element });
                    }
                }

            } else {
                necessaryObjects.push(element);
            }
        });
        return necessaryObjects;
    }
}
module.exports = CollisionBetween;
