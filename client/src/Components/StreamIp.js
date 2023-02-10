import React,{useRef} from 'react'
import StreamingCameraOptions from './StreamingCameraOptions'
// import firebase from 'firebase/app'
import Button from 'react-bootstrap/Button';

function StreamIp() {
    // const firestore = firebase.firestore();
    // server config
  const videoRef = useRef(null);
  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'], // free stun server
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // global states
  const pc = new RTCPeerConnection(servers);
  let localStream = null; 
  let remoteStream = null  
    const handleWebCamClick = async()=>{
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    })

    // initalizing the remote server to the mediastream
    remoteStream = new MediaStream();


    // Pushing tracks from local stream to peerConnection
    localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
    })

    pc.ontrack = event => {
        event.streams[0].getTracks(track => {
            remoteStream.addTrack(track)
        })
    }  

    // displaying the video data from the stream to the webpage
    videoRef.current.srcObject = localStream;
    videoRef.current.play();
    // remoteVideo.srcObject = remoteStream;

    // enabling and disabling interface based on the current condtion
    // callButton.disabled = false;
    // answerButton.disabled = false;
    // webcamButton.disabled = true;
      // document.getElementById('webcamVideo').srcObject = localStream;
    }
  return (
    <div>
        <StreamingCameraOptions/>
        <Button variant="primary" size="lg" onClick={handleWebCamClick}>
            Start Webcam
        </Button>
        <div className="videos">
      <span>
        <h3>Local Stream</h3>
        <video ref={videoRef}></video>
      </span>
      <span>
        <h3>Remote Stream</h3>
        <video id="remoteVideo"></video>
      </span>

    </div>
    </div>
  )
}

export default StreamIp