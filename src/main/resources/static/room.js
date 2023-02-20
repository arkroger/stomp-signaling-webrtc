class Room {

    id;

    userId;

    stompClient;

    localVideo;

    users = new Map();

    onUserJoin = () => {};

    onUserExit = (userId) => {};

    onOffer = (userId, state, offer) => {};

    onAnswer = (userId, answer) => {};
    
    onNewIceCandidate = (userId, iceCandidate) => {};

    onChangeDeviceState = () => {};


    constructor(id, userId, urlWebSocket, localVideo, onConnected, onUserJoin, onOffer, onAnswer, onNewIceCandidate, onUserExit) {
        this.id = id;
        this.userId = userId;
        this.localVideo = localVideo;
        this.stompClient = Stomp.over(new SockJS(urlWebSocket));
        this.stompClient.debug = null;
        this.stompClient.connect({}, () => {
            subscriptionRoom = this.stompClient.subscribe("/topic/room/" + this.id, this.callbackRoom);
            subscriptionWebRtc = this.stompClient.subscribe("/topic/room/" + this.id + "/webrtc", this.callbackWebRtc);

            onConnected();
            this.onUserJoin = onUserJoin;
            this.onOffer = onOffer;
            this.onAnswer = onAnswer;
            this.onNewIceCandidate = onNewIceCandidate;
            this.onUserExit = onUserExit;

        }, (error) => {
            console.error("Erro", error);
        });
    }

    callbackRoom = (message) => {
        const body = JSON.parse(message.body);

        if (body.userId !== this.userId) {
            if (body.data.type === "USER-ONLINE") {
                this.onUserJoin(body.userId, body.data.state);
            } else if (body.data.type === "USER-OFFLINE") {
                this.onUserExit(body.userId);
            }
        }
    }

    callbackWebRtc = (message) => {
        const body = JSON.parse(message.body);

        if (body.userId !== this.userId) {
            if (body.data.offer && body.data.to === this.userId) {
                this.onOffer(body.userId, body.data.state, body.data.offer);
            }

            if (body.data.answer && body.data.to === this.userId) {
                this.onAnswer(body.userId, body.data.answer);
            }

            if (body.data.newIceCandidate) {
                this.onNewIceCandidate(body.userId, body.data.newIceCandidate);
            }
        }

    }

    sendMessage = (message) => {
        const data = {
            userId: userId,
            data: message
        }
        this.stompClient.send("/app/room/" + this.id, {}, JSON.stringify(data));
    }

    sendMessageWebRtc = (message) => {
        const data = {
            userId: userId,
            data: message
        }
        this.stompClient.send("/app/room/" + this.id + "/webrtc", {}, JSON.stringify(data));
    }

    addUser = (userId, remoteVideo) => {
        this.users.set(userId, remoteVideo);
    }

    getUser = (userId) => {
        return this.users.get(userId);
    }

    hasUser = (userId) => {
        return this.users.has(userId);
    }

    deleteUser = (userId) => {
        const user = this.getUser(userId);
        user.close();
        delete this.getUser(userId);
        this.users.delete(userId);
    }

    clearUsers = () => {
        this.users.forEach((value, key) => {
            this.deleteUser(key);
        })
    }

}