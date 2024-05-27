
class Buttons {
    constructor(asset) {
        this.button = false;
        this.asset = asset;
        this.createButton();
        this.setBackground();
    }
    createButton() {
        // this.button = document.createElement(this.asset.tag);

        for (const options in this.asset) {

            if (this.asset.hasOwnProperty(options)) {
                switch (options) {
                    case 'tag':
                        this.button = document.createElement(this.asset[options]);
                        break;
                    case 'className':
                        this.button.classList.add(this.asset.className);
                        break;
                    // case 'textContent':
                    //     this.button.textContent= this.asset.textContent ;
                    //     break;
                    default:
                        this.button[options] = this.asset[options];
                        break;
                }
            }
        };
    }

    setBackground() {

        if (this.button.key) {
            const allAssets = CoreXam.App.AssetsGroup.image;
            const path = allAssets.find(asset => asset.key === this.button.key).src;
            this.button.path = path;
            this.button.style.backgroundImage = 'url(' + `${path}` + ')';
            if (this.button.hover) {
                const pathMouseOver = allAssets.find(asset => asset.key === this.button.hover).src;
                this.button.pathMouseOver = pathMouseOver;
                this.button.onmouseover = this.onmouseOver;
                this.button.onmouseout = this.onmouseOut;
            }
        }
    }
    onmouseOver() {
        this.style.backgroundImage = 'url(' + `${this.pathMouseOver}` + ')';
    }
    onmouseOut() {
        this.style.backgroundImage = 'url(' + `${this.path}` + ')';
    }

    _subscribe() {
    };
}
module.exports = Buttons;
