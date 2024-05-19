
class CollisionBetween extends CoreXam.CoreLogics.BaseCoreLogics {
    constructor() {
        super();
        this.requestAnimationFrameloop = false;
        this.groupObjects = [];
        this.relationGroups = false;
        this.tickCount = 0;
        this.ticksPerFrame = 2;

        this.eventIsCollisions = new Event('CollisionBetween.IsCollisions');
        this.eventObjectIsOutside = new Event('CollisionBetween.ObjectIsOutside');
        this.colisionRun = true;
        this.bordeAreaColision = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
    }

    run() {
        this.scene = document.getElementById('scene');

        let loop = () => {

            if (this.colisionRun) {
                if (CoreXam.gameStage.palayGame === 'run') {
                    this.runCollision();
                }
                window.requestAnimationFrame(loop);
            }
        }
        this.requestAnimationFrameloop = window.requestAnimationFrame(loop);
    }

    addObjectToCollision(newObject, typeObject) {

        this.addToGroup(newObject, typeObject);

    }

    addToGroup(newObject, typeObject) {

        const curentGpoup = this.groupObjects.find(group => group.id === typeObject);

        if (curentGpoup) {
            curentGpoup.objects.push(newObject);

        } else {

            const newGroup = {
                objects: [],
            };
            newGroup.id = typeObject;
            newGroup.relationGroups = this.getRelationGroups(typeObject);
            newGroup.objects.push(newObject);
            this.groupObjects.push(newGroup);
        }
        newObject.collision = true;
    }

    getRelationGroups(typeObject) {
        if (this.relationGroups) {
            let nameRelationGroups = false;
            for (let key in this.relationGroups) {

                if (key === typeObject) {
                    nameRelationGroups = this.relationGroups[key];
                }
            }
            return nameRelationGroups;
        }
    }

    runCollision() {
        this.tickCount++;

        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;

            this.groupObjects.forEach(mainGroup => {

                if (mainGroup.relationGroups) {
                    this.findReletionGroup(mainGroup);
                }
            });
        }
    }

    findReletionGroup(mainGroup) { // need optimisation

        mainGroup.relationGroups.forEach(reletionGroup => {

            const curentReletionGroup = this.groupObjects.find(group => group.id === reletionGroup);

            if (curentReletionGroup) {
                mainGroup.objects.forEach(mainObject => {

                    if (mainObject.collision) {
                        curentReletionGroup.objects.forEach(relationObject => {

                            if (relationObject.collision) {
                                this.checkOutsidePosition(mainObject);
                                this.checkOutsidePosition(relationObject);

                                if (!mainObject.outside && !relationObject.outside) {
                                    this.checkCollisionBorder(mainObject, relationObject);
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    checkOutsidePosition(verifyObject) {

        const verifyObjectOpt = this.getCoords(verifyObject);
        verifyObject.option = verifyObjectOpt;

        if (verifyObjectOpt.bottom > this.bordeAreaColision.top && verifyObjectOpt.top < this.scene.clientHeight - this.bordeAreaColision.bottom &&
            verifyObjectOpt.right > this.bordeAreaColision.left && verifyObjectOpt.left < this.scene.clientWidth - this.bordeAreaColision.right) {

            if (verifyObject.outside) {
                verifyObject.outside = false;
            }

        } else {

            if (!verifyObject.outside) {
                verifyObject.outside = true;
                this.fireEventOnColision(this.eventObjectIsOutside, { element: verifyObject });
            }
        }
    }

    checkCollisionBorder(mainObject, relationObject) {
        let mainBorderArray = [];
        let relationBorderArray = [];

        if (mainObject.colisionBorder) {
            mainBorderArray = this.setBorderOption(mainObject);
        } else {
            mainBorderArray.push(mainObject);
        }

        if (relationObject.colisionBorder) {
            relationBorderArray = this.setBorderOption(relationObject);
        } else {
            relationBorderArray.push(relationObject);
        }

        mainBorderArray.forEach(mainObj => {

            relationBorderArray.forEach(relationObj => {

                this.checkCollision(mainObj, relationObj);
            });
        });
    }

    setBorderOption(element) {
        const borderArray = [];
        element.colisionBorder.forEach(border => {

            const newObject = {
                option: {},
                curentElement: element,
            }

            newObject.option.left = element.option.left + border.leftOfset;
            newObject.option.right = newObject.option.left + border.widthArea;
            newObject.option.top = element.option.top + border.topOfset;
            newObject.option.bottom = newObject.option.top + border.heightArea;
            borderArray.push(newObject);
        });
        return borderArray;
    }


    checkCollision(mainObject, relationObject) {

        const mainObjectOpt = mainObject.option;
        const relationObjectOpt = relationObject.option;

        let xColl = false;
        let yColl = false;
        let IsCollision = false;

        xColl = (mainObjectOpt.right > relationObjectOpt.left)
            && (mainObjectOpt.left < relationObjectOpt.right);

        yColl = (mainObjectOpt.bottom > relationObjectOpt.top)
            && (mainObjectOpt.top < relationObjectOpt.bottom)

        IsCollision = (xColl && yColl);

        if (IsCollision) {
            const curentMainObject = this.getElementOnColision(mainObject);
            const curentrelationObject = this.getElementOnColision(relationObject);

            this.fireEventOnColision(this.eventIsCollisions, { mainObj: curentMainObject, relationObj: curentrelationObject, });
        }
    }

    getElementOnColision(element) {
        let curentElement = false;

        if (element.curentElement) {
            curentElement = element.curentElement;
        } else {
            curentElement = element;
        }
        return curentElement;
    }

    collisionSwich(colisionRun) {
        this.colisionRun = colisionRun;
        if (colisionRun) {
            this.run();
        }
    }

    getCoords(element) {
        let elementOptions = element.getBoundingClientRect();
        return elementOptions;
    }

    removeCollision(element, needDestroy, timeLazyDestroy = false) {
        element.collision = false;

        if (needDestroy) {
            this.destroyElement(element, timeLazyDestroy);
        }
    }

    fireEventOnColision(eventName, detail) {
        eventName.detail = detail;
        dispatchEvent(eventName);
    }

    setColisionOption(borderOption) {
        this.bordeAreaColision = borderOption;
    }

}
module.exports = CollisionBetween;
