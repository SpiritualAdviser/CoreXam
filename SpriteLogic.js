class SpriteLogic {
    constructor(asset) {
        this.animationEventEnd = new Event('SpriteLogic.animationEnd');
        this.requestAnimationFrameloop = false;
        this.context = asset.context;
        this.image = asset.image;
        this.width = asset.width;
        this.height = asset.height;
        this.allFrames = asset.allFrames;
        this.animationParams = asset.animationParams;
        this.animationRepeat = asset.animationRepeat || false;
        this.currentAnimation = {};
        this.tickCount = 0;
        this.ticksPerFrame = asset.ticksPerFrame || 6;
        this.animationName = asset.animationName || false;
        this.animationStop = false;
        // this.start();
        // this.setSpriteOptions(asset, canvas);
    }

    // setSpriteOptions(asset, canvas) {
    //     debugger

    //     const instanceJson = CoreXam.App.AssetsGroup.json.find(file => file.key === asset.key);
    //     const framesOptions = instanceJson.bodyJson.frames;
    //     const allFrames = Object.values(instanceJson.bodyJson.frames);
    //     const animationParams = instanceJson.bodyJson.meta.frameTags;
    //     canvas.key = asset.key;

    //     if (asset.name) {
    //         canvas.name = asset.name;
    //     }
    //     if (asset.id) {
    //         canvas.id = asset.id;
    //     }
    //     let frameSize = false;

    //     for (const param in framesOptions) {
    //         if (param) {
    //             frameSize = framesOptions[param].sourceSize
    //             break
    //         }
    //     }
    //     canvas.width = frameSize.w;
    //     canvas.height = frameSize.h;
    //     const imageSprite = new Image();
    //     imageSprite.src = CoreXam.CoreLogics.BaseCoreLogics.prototype.getPath('img', canvas);// need to resolve
    //     let spriteModel = new SpriteLogic({
    //         context: canvas.getContext('2d'),
    //         image: imageSprite,
    //         width: frameSize.w,
    //         height: frameSize.h,
    //         allFrames: allFrames,
    //         animationParams: animationParams,
    //         animationName: asset.animationName,
    //         animationRepeat: asset.animationRepeat,
    //         ticksPerFrame: asset.ticksPerFrame,
    //     })
    //     canvas.spriteModel = spriteModel;
    //     spriteModel.start();
    // }

    render() {
        let mainFrame = this.currentAnimation.mainFrame;
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.drawImage(this.image, mainFrame.x, mainFrame.y);
    }

    update(oneFrame) {

        this.tickCount++;
        if (oneFrame) {
            this.getFrameOption(); // надо получать координаты нужного фрейма в спрайте
            this.render();
            return
        }
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            this.getFrameOption(); // надо получать координаты нужного фрейма в спрайте
            this.render();
        }

    }
    play(animationName, animationRepeat) {

        if (animationName) {
            this.animationName = animationName;
            this.animationRepeat = animationRepeat;
            this.animationStop = false;
        }

        if (this.animationName && this.setAnimation(this.animationName)) {

            if (this.currentAnimation.to === this.currentAnimation.from) {
                const oneFrame = true
                this.update(oneFrame);


            } else {

                let loop = () => {

                    if (!this.animationStop) {
                        this.update();
                        window.requestAnimationFrame(loop);
                    }
                }
                this.requestAnimationFrameloop = window.requestAnimationFrame(loop);
            }

        } else {
            this.context.drawImage(this.image, 0, 0);
        }
    }

    stop() {

        this.animationStop = true;
        cancelAnimationFrame(this.requestAnimationFrameloop);
        this.requestAnimationFrameloop = false;
    }

    setAnimation(animationName) {
        this.currentAnimation = this.animationParams.find(item => item.name === animationName);

        if (this.currentAnimation) {
            this.currentAnimation.mainFrame = {
                index: this.currentAnimation.from,
            }
            return true;
        } else {
            console.log('не верное имя анимации')
            return false;
        }
    }

    getFrameOption() {
        let frame = this.currentAnimation.mainFrame.index;
        this.currentAnimation.mainFrame.x = -this.allFrames[frame].frame.x;
        this.currentAnimation.mainFrame.y = -this.allFrames[frame].frame.y;
        this.currentAnimation.mainFrame.index++;

        if (frame === this.currentAnimation.to) {

            if (this.animationRepeat) {
                this.currentAnimation.mainFrame.index = this.currentAnimation.from;
            } else {
                // debugger
                this.currentAnimation.mainFrame.index = this.currentAnimation.to;
                if (this.requestAnimationFrameloop) {
                    this.stop();
                }
                this.animationEventEnd.ditail = { animationName: this.currentAnimation, canvasContext: this.context }
                dispatchEvent(this.animationEventEnd);
            }
        }
    }

    test() {
        debugger
    }
}
module.exports = SpriteLogic;
console.log('=>BaseAnimationLogic is completed');
