
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
        this.bordeAreaColision = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };

        // onresize = (event) => { this.setColisionArea() };
    }

    // setColisionArea() {
    //     this.bordeAreaColision.bottom = this.scene.clientHeight - this.bordeAreaColision.bottom;
    //     this.bordeAreaColision.right = this.scene.clientWidth - this.bordeAreaColision.right;

    // }

    run() {

        // this.setColisionArea();
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
     
        if (buletOpt.bottom > this.bordeAreaColision.top && buletOpt.top < this.scene.clientHeight - this.bordeAreaColision.bottom &&
            buletOpt.right > this.bordeAreaColision.left && buletOpt.left < this.scene.clientWidth - this.bordeAreaColision.right) {

            if (buletSkelet.outside) {
                buletSkelet.outside = false;
            }

        } else {

            if (!buletSkelet.outside) {
                buletSkelet.option = buletOpt;
                buletSkelet.outside = true;
                this.fireEventOnColision(this.eventObjectIsOutside, { element: buletSkelet });
            }
        }

        if (targetSkelet) {
            const targetOpt = this.getCoords(targetSkelet);

            if (targetOpt.bottom > this.bordeAreaColision.top && targetOpt.top < this.scene.clientHeight - this.bordeAreaColision.bottom &&
                targetOpt.right > this.bordeAreaColision.left && targetOpt.left < this.scene.clientWidth - this.bordeAreaColision.right) {

                targetSkelet.outside = false;

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

                if (!targetSkelet.outside) {
                    targetSkelet.option = targetOpt;
                    targetSkelet.outside = true;
                    this.fireEventOnColision(this.eventObjectIsOutside, { element: targetSkelet });
                }
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

    setColisionOption(borderOption) {
        this.bordeAreaColision = borderOption;
    }

}
module.exports = CollisionBetween;
