
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
    refreshDeviceState(e, document.getElementById("controls"));
};
video.initLocalVideo();


