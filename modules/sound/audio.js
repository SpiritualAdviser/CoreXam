
class AudioSound {
    constructor(asset) {

        this.trask = false;
        this.gameSamples = [];
        this.plaingSamples = [];
        this.soundMute = false;
        this.scene = document.getElementById('scene');
        if (CoreXam.App.AssetsGroup.sounds) {
            CoreXam.App.AssetsGroup.sounds.forEach(sample => {
                this.gameSamples.push(sample);
            });
        }

        this._subscribe();
    }

    async getAudioFile(filePath) {
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    async setupSamples() {
        console.log('setting up samples');
        const audioBuffers = {};

        for (const sample of this.gameSamples) {

            const currentSample = await this.getAudioFile(sample.src);

            audioBuffers[sample.key] = sample;
            audioBuffers[sample.key].audioBuffer = currentSample;
            console.log('setting up done');
        }

        return audioBuffers;
    }

    getSampleSource(currentSample, time, options) {
        const sampleSource = this.audioContext.createBufferSource();
        const currenGain = this.audioContext.createGain();

        sampleSource.buffer = currentSample.audioBuffer;
        sampleSource.options = currentSample;
        sampleSource.options.currenGain = currenGain;

        sampleSource.connect(currenGain);
        currenGain.connect(this.mainGainNode);

        if (currentSample.vol) {
            currenGain.gain.value = currentSample.vol;
        }
        if (currentSample.playbackRate) {
            sampleSource.playbackRate.value = currentSample.playbackRate;
        }
        if (currentSample.zoom) {
            // currenGain.gain.value = 0;
            // currenGain.gain.setValueAtTime(1, this.audioContext.currentTime + 2);
        }

        if (currentSample.loop) {
            sampleSource.loop = currentSample.loop;
        }

        return sampleSource;
    }

    _createAudioBox() {

        this._createAudioDiv();
        this._createPlayController();
        this._createVolumeControl();
        this._createStereoControl();
        this._currentSubscribe();
    }

    _createAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mainGainNode = this.audioContext.createGain();
        const stereoOptions = { pan: 0 };
        this.stereoBalance = new StereoPannerNode(this.audioContext, stereoOptions);
        this.stereoBalance.connect(this.audioContext.destination);
        this.mainGainNode.connect(this.stereoBalance);

        this.setupSamples().then((response) => {
            this.bufferedSamples = response;
            console.log(this.bufferedSamples);

            const eventGameSamplesLoaded = new Event('modules.audio.samples.loaded');
            dispatchEvent(eventGameSamplesLoaded);
        });
    }

    _createAudioDiv() {
        this.audioDiv = document.createElement('div');
        this.audioDiv.style.display = 'flex';
        this.audioDiv.style.flexDirection = 'column';
        this.audioDiv.style.position = 'absolute';
        this.audioDiv.style.width = '85px';
        this.audioDiv.style.bottom = '1%';
        this.audioDiv.style.right = '2%';

        this.scene.append(this.audioDiv);
    }

    _createPlayController() {
        this.playButton = document.createElement('button');
        this.playButton.setAttribute('data-playing', false);
        this.playButton.setAttribute('role', 'switch');
        this.playButton.setAttribute('aria-checked', false);
        this.playButton.style.pointerEvents = 'all';

        const span = document.createElement('span');
        span.style.backgroundColor = 'black';
        span.style.color = '#ffe2df';
        span.textContent = 'Play/Pause';

        this.playButton.append(span);
        this.audioDiv.appendChild(this.playButton)
    }
    _createVolumeControl() {
        // <input type="range" id="volume" min="0" max="2" value="1" step="0.01" />
        this.volumeControl = document.createElement('input');
        this.volumeControl.setAttribute('type', 'range');
        this.volumeControl.setAttribute('min', '0');
        this.volumeControl.setAttribute('max', '2');
        this.volumeControl.setAttribute('value', '1');
        this.volumeControl.setAttribute('step', '0.01');
        this.volumeControl.id = 'volume';
        this.volumeControl.style.pointerEvents = 'all';
        this.audioDiv.appendChild(this.volumeControl);
    }

    _createStereoControl() {
        // <input type="range" id="stereoControl" min="-1" max="1" value="0" step="0.01" />
        this.stereoControl = document.createElement('input');
        this.stereoControl.setAttribute('type', 'range');
        this.stereoControl.setAttribute('min', '-1');
        this.stereoControl.setAttribute('max', '1');
        this.stereoControl.setAttribute('value', '0');
        this.stereoControl.setAttribute('step', '0.01');
        this.stereoControl.id = 'stereoControl';
        this.stereoControl.style.pointerEvents = 'all';
        this.audioDiv.appendChild(this.stereoControl);
    }

    _changeToggleSoundState(pause) {

        if (this.audioContext.state === 'suspended' || this.soundMute) {

            if (pause === 'pause' || pause === 'play') {

                this.audioContext.resume();
            } else {
                this.volumeControl.value = 1;
                this.soundMute = false;
                this._changeVolume();
            }

        } else {

            if (pause === 'pause' || pause === 'play') {

                this.audioContext.suspend();
            } else {
                this.soundMute = true;
                this.volumeControl.value = 0;
                this._changeVolume();
            }
        }
    }

    // createNoteTable() {
    //     const noteFreq = [];
    //     for (let i = 0; i < 9; i++) {
    //         noteFreq[i] = [];
    //     }

    //     noteFreq[0]["A"] = 27.500000000000000;
    //     noteFreq[0]["A#"] = 29.135235094880619;
    //     noteFreq[0]["B"] = 30.867706328507756;

    //     noteFreq[1]["C"] = 32.703195662574829;
    //     noteFreq[1]["C#"] = 34.647828872109012;
    //     noteFreq[1]["D"] = 36.708095989675945;
    //     noteFreq[1]["D#"] = 38.890872965260113;
    //     noteFreq[1]["E"] = 41.203444614108741;
    //     noteFreq[1]["F"] = 43.653528929125485;
    //     noteFreq[1]["F#"] = 46.249302838954299;
    //     noteFreq[1]["G"] = 48.999429497718661;
    //     noteFreq[1]["G#"] = 51.913087197493142;
    //     noteFreq[1]["A"] = 55.000000000000000;
    //     noteFreq[1]["A#"] = 58.270470189761239;
    //     noteFreq[1]["B"] = 61.735412657015513;
    //     return noteFreq;
    // }


    _changeVolume() {
        this.mainGainNode.gain.value = this.volumeControl.value;
    }
    _changeStereoBalance() {
        this.stereoBalance.pan.value = this.stereoControl.value;
    }

    play(sampleName, time) {

        if (this.soundMute) {
            this.volumeControl.value = 0;
            this._changeVolume();
        }

        const currentSample = this.bufferedSamples[sampleName];
        let currentSampleSource;

        if (Object.keys(this.plaingSamples).length === 0) {

            currentSampleSource = this.getSampleSource(currentSample);
            this.plaingSamples[sampleName] = [];
            this.plaingSamples[sampleName].push(currentSampleSource);
            currentSampleSource.start(time);

        } else {

            for (let key in this.plaingSamples) {

                if (key === sampleName) {

                    if (this.plaingSamples[sampleName].length === 0) {

                        currentSampleSource = this.getSampleSource(currentSample);
                        this.plaingSamples[sampleName].push(currentSampleSource);
                        currentSampleSource.start(time);
                    } else {
                        this.plaingSamples[sampleName].forEach(audioBufferSourceNode => {

                            if (audioBufferSourceNode.loop) {

                                return
                            } else {

                                currentSampleSource = this.getSampleSource(currentSample);
                                this.plaingSamples[sampleName].push(currentSampleSource);
                                currentSampleSource.start(time);
                                return
                            }
                        });
                    }

                    return
                } else {

                    currentSampleSource = this.getSampleSource(currentSample);
                    this.plaingSamples[sampleName] = [];
                    this.plaingSamples[sampleName].push(currentSampleSource);
                    currentSampleSource.start(time);
                    return
                }
            }
        }

    }

    _currentSubscribe() {
        this.playButton.addEventListener('click', this._changeToggleSoundState.bind(this));
        this.volumeControl.addEventListener('input', this._changeVolume.bind(this), false);
        this.stereoControl.addEventListener('input', this._changeStereoBalance.bind(this), false)
    }

    stop(sampleName) { //to DO

        this.plaingSamples[sampleName].forEach(sample => {

            sample.stop()
        });
        this.plaingSamples[sampleName].length = 0;

        // if (this.plaingSamples[sampleName]) {
        //     this.plaingSamples[sampleName].stop();
        //     // delete this.plaingSamples[sampleName];
        // }
    }

    _subscribe() {
        addEventListener('module.audio.init', (event) => {
            if (event.detail === false) {
                this.soundMute = true;

            }
            if (!this.trask) {
                this.trask = true;
            }
            this._createAudioContext();
        });

        addEventListener('pauseGame.geme.stop', this._changeToggleSoundState.bind(this, 'pause'));
        addEventListener('pauseGame.geme.run', this._changeToggleSoundState.bind(this, 'play'));

        addEventListener('Core.sceneWasCreated', () => {
            this._createAudioBox();
        });

        // addEventListener('module.audio.stop', (event) => {
        //     this._stop(event.detail);

        // })
    };
}
module.exports = AudioSound;

