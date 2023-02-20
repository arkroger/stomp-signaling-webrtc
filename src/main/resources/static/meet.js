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

createWrapperRemoteElement = (userId, state) => {
    let div = document.createElement("div");
    div.setAttribute("id", userId);
    div.classList.add("col", "s4", "remote-video");
    // div.classList.add("remoteVideo");

    let videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");

    let divUser = document.createElement("div");
    divUser.innerText = userId;

    let divOffline = document.createElement("div");
    divOffline.classList.add("offline-message");
    divOffline.innerText = "Offline"

    //
    // let divMic = document.createElement("div");
    // divMic.innerHTML = `<strong>Mic:</strong><span class="micState">${state?.mic}</span>`;
    //
    // let divVideo = document.createElement("div");
    // divVideo.innerHTML = `<strong>Video:</strong><span class="videoState">${state?.video}</span>`;
    //
    // let buttonPip = document.createElement("button");
    // buttonPip.innerText = 'PIP';
    // buttonPip.addEventListener('click', (event) => {
    //     pictureInPicture(userId);
    // });
    //
    // let buttonFull = document.createElement("button");
    // buttonFull.innerText = 'Full';
    // buttonFull.addEventListener('click', (event) => {
    //     fullScreen(userId);
    // });

    // let divButtons = document.createElement("div");
    // divButtons.appendChild(buttonPip);
    // divButtons.appendChild(buttonFull);

    let video = document.createElement("video");

    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");


    // videoWrapper.appendChild(divMic);
    // videoWrapper.appendChild(divVideo);
    // div.appendChild(divButtons);
    videoWrapper.appendChild(video);
    videoWrapper.appendChild(divOffline);
    // videoWrapper.appendChild(divUser);
    div.appendChild(videoWrapper);

    return div;
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
    const videoWrapperElement = createWrapperRemoteElement(userId, state);
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

const localVideo = new LocalVideo(document.getElementById("localVideo"));
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
        onUserExit
    );
});









