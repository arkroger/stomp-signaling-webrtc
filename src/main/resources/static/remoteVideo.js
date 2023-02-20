class RemoteVideo extends Video {

    id;
    peer;
    onNewIceCandidate = (iceCandidate) => {};

    onOffLine = (userId) => {};
    constructor(id, videoElement, iceServers, videoLocal, onNewIceCandidate) {
        super(videoElement);
        this.id = id;
        this.onNewIceCandidate = onNewIceCandidate;
        this.peer = this.createPeer(iceServers, videoLocal.videoStream);
    }

    createPeer = (iceServers, localStream) => {
        const configuration = {'iceServers': iceServers}
        const peerConnection = new RTCPeerConnection(configuration);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.addEventListener('icecandidate', event => {
            if (event.candidate) {
                this.onNewIceCandidate(event.candidate);
            }
        });

        peerConnection.addEventListener('track', async (event) => {
            const [remoteStream] = event.streams;
            this.videoElement.srcObject = remoteStream;
        });

        peerConnection.addEventListener('iceconnectionstatechange', event => {
            if (peerConnection.iceConnectionState === 'disconnected') {
                this.onOffLine(this.id);
            }
        });

        peerConnection.addEventListener('connectionstatechange', event => {
            if (peerConnection.connectionState === 'connected') {
                console.log("peer connected");
            }
        });

        return peerConnection;

    }

    addRemoteDescription = async (remoteDescription) => {
        await this.peer.setRemoteDescription(new RTCSessionDescription(remoteDescription));
    }

    addIceCandidate = (iceCandidate) => {
        this.peer.addIceCandidate(iceCandidate);
    }

    createOffer = async () => {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer)
        return offer;
    }

    createAnswer = async () => {
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return answer;
    }

    close = () => {
        this.peer.close();
    }
}