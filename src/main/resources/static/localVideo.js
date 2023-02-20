class LocalVideo extends Video {

    constructor(videoElement) {
        super(videoElement);
    }

    initLocalVideo = async () => {


        const constraints = {
            video: true,
            audio: false
        }
        return navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.videoElement.srcObject = stream;
                super.videoStream = stream;
                this.changeDeviceState();
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });

        // listarDevices();

        // navigator.mediaDevices.addEventListener('devicechange', event => {
        //     listarDevices();
        // });
    }

    toggleVideo = function () {
        if (this.videoStream.getVideoTracks() && this.videoStream.getVideoTracks().length > 0) {
            this.videoStream.getVideoTracks()[0].enabled = !this.videoStream.getVideoTracks()[0].enabled;
            this.changeDeviceState();
        }
    }

    toggleMic = function () {
        if (this.videoStream.getAudioTracks() && this.videoStream.getAudioTracks().length > 0) {
            this.videoStream.getAudioTracks()[0].enabled = !this.videoStream.getAudioTracks()[0].enabled;
            this.changeDeviceState();
        }

    }

    changeDeviceState = function() {
        this.onChangeDeviceState(this.getDeviceStateConfig());
        // const event = new Event('changeDeviceState');
        // document.dispatchEvent(event);
    }


    getDeviceStateConfig() {
        let micOn = false;
        if(this.videoStream && this.videoStream.getAudioTracks() && this.videoStream.getAudioTracks().length > 0) {
            micOn = this.videoStream.getAudioTracks()[0].enabled
        }

        let videoOn = false;
        if(this.videoStream && this.videoStream.getVideoTracks() && this.videoStream.getVideoTracks().length > 0) {
            videoOn = this.videoStream.getVideoTracks()[0].enabled;
        }

        return {
            mic: micOn,
            video: videoOn
        }
    }
}