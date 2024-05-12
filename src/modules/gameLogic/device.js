
class Device {
    constructor() {
        this.detectDevice();
    }
    detectDevice() {
        const userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.match('android') || userAgent.match('iphone') || userAgent.match('macintosh') || userAgent.match('ipad')) {
            CoreXam.Device = 'Mobile';
        } else {
            CoreXam.Device = 'Desktop';
        }
    }
}

module.exports = Device;
