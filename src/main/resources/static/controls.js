refreshDeviceState = (state, controlsElement) => {
    if (controlsElement && state) {
        controlsElement.classList.add((state.mic)?'control-mic-on':'control-mic-off');
        controlsElement.classList.remove((state.mic)?'control-mic-off':'control-mic-on');

        controlsElement.classList.add((state.video)?'control-video-on':'control-video-off');
        controlsElement.classList.remove((state.video)?'control-video-off':'control-video-on');
    }
}