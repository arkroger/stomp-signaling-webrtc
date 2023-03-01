let subscriptionRoom;
let subscriptionWebRtc;
let room;
const UUIDGeneratorBrowser = () =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
const userId = UUIDGeneratorBrowser();
const roomNumber = new URLSearchParams(window.location.search).get("room");
document.getElementById("room").innerText = roomNumber;

// callbackRoom = (message) => {
//     const body = JSON.parse(message.body);
//     console.log(body);
// }
//
// callbackWebRtc = (message) => {
//     const body = JSON.parse(message.body);
//     console.log(body);
// }

createWrapperRemoteElement = (userId) => {
    let div = document.createElement("div");
    div.setAttribute("id", userId);
    div.classList.add("col", "s4", "remote-video");

    let videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");

    let divUser = document.createElement("div");
    divUser.innerText = userId;

    let divOffline = document.createElement("div");
    divOffline.classList.add("offline-message");
    divOffline.innerText = "Offline"

    let video = document.createElement("video");

    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");

    videoWrapper.appendChild(video);
    videoWrapper.appendChild(divOffline);

    div.appendChild(videoWrapper);
    div.appendChild(getDivActions(userId));

    return div;
}


getDivActions = (userId) => {
    let divMic = document.createElement("i");
    divMic.classList.add("micState");
    divMic.classList.add("material-icons");
    divMic.innerHTML = `mic_off`;

    let divVideo = document.createElement("i");
    divVideo.classList.add("videoState");
    divVideo.classList.add("material-icons");
    divVideo.innerHTML = `videocam_off`;

    let buttonPip = document.createElement("a");
    buttonPip.classList.add("btn");
    buttonPip.innerHTML = '<i class="material-icons">picture_in_picture</i>';
    buttonPip.addEventListener('click', (event) => {
        pictureInPicture(userId);
    });

    let buttonFull = document.createElement("a");
    buttonFull.innerHTML = '<i class="material-icons">fullscreen</i>';
    buttonFull.classList.add("btn");
    buttonFull.addEventListener('click', (event) => {
        fullScreen(userId);
    });

    let divState = document.createElement("div");
    divState.classList.add("state");
    divState.appendChild(divMic);
    divState.appendChild(divVideo);

    let divButtons = document.createElement("div");
    divButtons.classList.add("buttons")
    divButtons.appendChild(buttonPip);
    divButtons.appendChild(buttonFull);

    const actions = document.createElement("div");
    actions.classList.add("actions")
    actions.appendChild(divState);
    actions.appendChild(divButtons)
    return actions;
}

unjoin = () => {
    room.sendMessage({type: "USER-OFFLINE"});
    subscriptionRoom.unsubscribe();
    subscriptionWebRtc.unsubscribe();
    room.clearUsers();

    document.querySelectorAll(".remote-video").forEach(element => {
        element.remove();
    });
}

removeWrapperRemoteElement = (userId) => {
    document.getElementById(userId).classList.add("offline");
    setTimeout( () => {
        document.getElementById(userId).remove();
    }, 3000);
}

createRemoteVideo = (userId, state) => {
    const videoWrapperElement = createWrapperRemoteElement(userId);
    changeState(videoWrapperElement, state);
    document.getElementById("videos").appendChild(videoWrapperElement);

    const videoRemote = new RemoteVideo(
        userId,
        videoWrapperElement.getElementsByTagName("video")[0],
        [{'urls': 'stun:stun.l.google.com:19302'}],
        localVideo,
        (newIceCandidade) => {
            room.sendMessageWebRtc({'newIceCandidate': newIceCandidade});
        }
    );

    videoRemote.onOffLine = (userId) => {
        onUserExit(userId);
    }

    return videoRemote;

}

onUserExit = (userId) => {
    room.deleteUser(userId);
    removeWrapperRemoteElement(userId);
}

onUserJoin = (userId, state) => {
    const remoteVideo = this.createRemoteVideo(userId, state);
    remoteVideo.createOffer().then((offer) => {
      room.sendMessageWebRtc({'offer': offer, 'to': userId, 'state': state});
    });

    room.addUser(userId, remoteVideo);
}

onOffer = async (userId, state, offer) => {
    let remoteVideo;

    if (room.hasUser(userId)) {
        remoteVideo = room.getUser(userId);
    } else {
        remoteVideo = this.createRemoteVideo(userId, state);
        room.addUser(userId, remoteVideo);
    }

    await remoteVideo.addRemoteDescription(offer);
    remoteVideo.createAnswer().then((answer) => {
        room.sendMessageWebRtc({'answer': answer, 'to': userId});
    });
}

onAnswer = async (userId, answer) => {
    const remoteVideo = room.getUser(userId);
    await remoteVideo.addRemoteDescription(answer);
}

onNewIceCandidate = (userId, iceCandidate) => {
    const remoteVideo = room.getUser(userId);
    remoteVideo.addIceCandidate(iceCandidate);
}

onChangeDevice = (userId, state) => {
    changeState(document.getElementById(userId), state);
}

changeState = (userElement, state) => {
    const micState = userElement.getElementsByClassName("micState")[0];
    const videoState = userElement.getElementsByClassName("videoState")[0];

    micState.innerText = (state.mic)?'mic':'mic_off';
    videoState.innerText = (state.video)?'videocam':'videocam_off';
}

pictureInPicture = async (userId) => {
    if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        let video = room.getUser(userId);
        await video.videoElement.requestPictureInPicture();
    }
}

fullScreen = async (userId) => {
    let video = room.getUser(userId);
    await video.videoElement.requestFullscreen();
}

toggleVideo = (localVideo) => {
    localVideo.toggleVideo();
    room.sendMessage({ type: "CHANGE-DEVICE-STATE", state: localVideo.getDeviceStateConfig()});
}

toggleMic = (localVideo) => {
    localVideo.toggleMic();
}

const localVideo = new LocalVideo(document.getElementById("localVideo"));
localVideo.onChangeDeviceState = (e) => {
    refreshDeviceState(e, document.getElementById("controls"));
};
localVideo.initLocalVideo().then(() => {
    room = new Room(
        roomNumber,
        userId,
        "http://localhost:8080/websocket",
        localVideo,
        () => {
            room.sendMessage({ type: "USER-ONLINE", state: localVideo.getDeviceStateConfig()});
        },
        onUserJoin,
        onOffer,
        onAnswer,
        onNewIceCandidate,
        onUserExit,
        onChangeDevice
    );
});
