
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
            newGroup.relationGroups = this.getNameRelationGroups(typeObject);
            newGroup.objects.push(newObject);
            this.groupObjects.push(newGroup);
        }
        newObject.collision = true;
    }

    getNameRelationGroups(typeObject) {

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
                    this.checkCollisionOptions(mainGroup);
                }
            });
        }
    }


    checkCollisionOptions(mainGroup) { // need optimisation

        mainGroup.relationGroups.forEach(reletionGroup => {

            const curentReletionGroup = this.groupObjects.find(group => group.id === reletionGroup);

            mainGroup.objects.forEach(mainObject => {

                this.checkOutsidePosition(mainObject);

                if (curentReletionGroup && mainObject.collision) {

                    curentReletionGroup.objects.forEach(relationObject => {
                        this.checkOutsidePosition(relationObject);

                        if (relationObject.collision) {

                            if (!mainObject.outside && !relationObject.outside) {

                                this.checkCollisionBorder(mainObject, relationObject);
                            }
                        }
                    });
                }
            });
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

        mainBorderArray.forEach(mainBorder => {

            const IsCollision = relationBorderArray.find(relationBorder => this.checkCollision(mainBorder, relationBorder));

            if (IsCollision) {
                // console.log('colision', mainObject, relationObject)
                this.fireEventOnColision(this.eventIsCollisions, { mainObj: mainObject, relationObj: relationObject, });
            }
        });
    }

    setBorderOption(element) {
        const borderArray = [];
        element.colisionBorder.forEach(border => {

            const newObject = {
                option: {},
                // collisionElement: element,
            }

            newObject.option.left = element.option.left + border.leftOfset;
            newObject.option.right = newObject.option.left + border.widthArea;
            newObject.option.top = element.option.top + border.topOfset;
            newObject.option.bottom = newObject.option.top + border.heightArea;
            borderArray.push(newObject);
        });
        return borderArray;
    }

    showBorderCollision() {

        this.groupObjects.forEach(group => {
            group.objects.forEach(element => {

                if (element.colisionBorder) {

                    element.colisionBorder.forEach(borderObj => {

                        const elementCoords = element.getBoundingClientRect();

                        const newDiv = document.createElement('div');
                        newDiv.style.position = 'fixed';

                        newDiv.style.left = (elementCoords.left + borderObj.leftOfset) + 'px';
                        newDiv.style.top = (elementCoords.top + borderObj.topOfset) + 'px';

                        newDiv.style.width = borderObj.widthArea + 'px';
                        newDiv.style.height = borderObj.heightArea + 'px';

                        newDiv.style.border = '2px solid'

                        element.parentElement.prepend(newDiv)
                    });

                } else {
                    element.style.border = '2px solid';
                }
            });
        });
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

        return IsCollision
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
