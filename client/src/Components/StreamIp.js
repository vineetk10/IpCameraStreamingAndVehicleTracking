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
  // const pc = new RTCPeerConnection(servers);
  // let localStream = null; 
  // let remoteStream = null  
    const handleWebCamClick = ()=>{
     // Get the media stream from the user's device
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(function(stream) {
      // Create a new RTCPeerConnection
      var pc = new RTCPeerConnection();
      
      // Add the media stream to the peer connection
      stream.getTracks().forEach(function(track) {
        pc.addTrack(track, stream);
      });
      
      // Set up the data channel for sending data
      var dataChannel = pc.createDataChannel('media-stream');
      dataChannel.onopen = function() {
        console.log('Data channel open');
      };
      
      // Set up the signaling connection
      var signalingConnection = new WebSocket('ws://localhost:8080');
      signalingConnection.onopen = function() {
        console.log('Signaling connection open');
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Send an offer to the other peer
        pc.createOffer()
          .then(function(offer) {
            return pc.setLocalDescription(offer);
          })
          .then(function() {
            signalingConnection.send(JSON.stringify({
              type: 'offer',
              sdp: pc.localDescription.sdp
            }));
          });
      };
      
      // Handle incoming messages from the signaling server
      signalingConnection.onmessage = function(event) {
        var message = JSON.parse(event.data);
        if (message.type === 'answer') {
          // Set the remote description based on the answer from the other peer
          pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: message.sdp
          }));
        } else if (message.type === 'candidate') {
          // Add the ICE candidate received from the other peer
          pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        } else if (message.type === 'media-stream') {
          // Handle incoming media stream from other peer
          var remoteStream = new MediaStream();
          message.tracks.forEach(function(track) {
            var remoteTrack = remoteStream.addTrack(new MediaStreamTrack(track), remoteStream);
          });
          // Attach remote stream to a video element
          var remoteVideo = document.getElementById('remote-video');
          remoteVideo.srcObject = remoteStream;
        }
      };
      
      // Send ICE candidates to the other peer
      pc.onicecandidate = function(event) {
        if (event.candidate) {
          signalingConnection.send(JSON.stringify({
            type: 'candidate',
            candidate: event.candidate
          }));
        }
      };
      
      // Listen for incoming media streams from the other peer
      pc.ontrack = function(event) {
        // Send the incoming media stream to the other peer
        signalingConnection.send(JSON.stringify({
          type: 'media-stream',
          tracks: event.streams[0].getTracks().map(function(track) {
            return track.clone().toJSON();
          })
        }));
        // Attach local stream to a video element
        // var localVideo = document.getElementById('local-video');
        // localVideo.srcObject = stream;
       
      };
    })
    .catch(function(error) {
      console.error(error);
    });

  
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