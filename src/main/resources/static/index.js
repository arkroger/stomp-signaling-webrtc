refreshDeviceState = (state) => {
    const controls = document.getElementById("controls");

    if (controls && state) {
        controls.classList.add((state.mic)?'control-mic-on':'control-mic-off');
        controls.classList.remove((state.mic)?'control-mic-off':'mcontrol-ic-on');

        controls.classList.add((state.video)?'control-video-on':'control-video-off');
        controls.classList.remove((state.video)?'control-video-off':'control-video-on');
    }
}

toggleVideo = () => {
    video.toggleVideo();
}

toggleMic = () => {
    video.toggleMic();
}

join = () => {
    const room = document.getElementById("room").value;
    if (document.getElementById("room").value) {
        window.open("meet.html?room=" + room, "_blank");
    }
}

const video = new LocalVideo(document.getElementById("localVideo"));

video.onChangeDeviceState = (e) => {
    refreshDeviceState(e);
};
video.initLocalVideo();


