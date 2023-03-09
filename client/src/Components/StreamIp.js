import React, { useState, useRef, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
// import Video from './Components/Video';
import Video from './Video';
import { WebRTCUser } from './types';
const user = JSON.parse(localStorage.getItem("jwt"));
const pc_config = {
  iceServers: [
    // {
    //   urls: 'stun:[STUN_IP]:[PORT]',
    //   'credentials': '[YOR CREDENTIALS]',
    //   'username': '[USERNAME]'
    // },
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};
const SOCKET_SERVER_URL = process.env.REACT_APP_SIGNALLING_SERVER_URL;

const StreamCameras = () => {
  const socketRef = useRef();
  const pcsRef = useRef({});
  const localVideoRef = useRef(null);
  const localStreamRef = useRef();
  const [users, setUsers] = useState([]);

  const getLocalStream = useCallback(async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: 240,
          height: 240,
        },
      });

//       const mimeType = 'audio/webm';
//       let chunks = [];
//       const recorder = new MediaRecorder(localStream, { type: mimeType, timeslice: 1000  });
//       recorder.start(1000);

      let chunks = [];
      let totalSize = 0;
      const CHUNK_SIZE = 10;  // each chunk is of 50 KBs, so each file would be aroung 400-500 KBs and contain 10 second video, we can change it to have 30 mins videos
      const mediaRecorderOptions = {
        mimeType: 'video/webm;codecs=h264',
        timeslice: 50000 // 50 KB
      };
      const recorder = new MediaRecorder(localStream, mediaRecorderOptions);
      recorder.start(1000);
      
      recorder.ondataavailable = (event) => {
        console.log('Recording started');
        chunks.push(event.data);
        if (chunks.length >= CHUNK_SIZE) {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      };
      recorder.onstop = (event) => {
        console.log('Recording stopped');
        const blob = new Blob(chunks, { type: 'video/webm' });
        chunks = [];
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        // send counter in file name to verify
        totalSize+= 1;
        formData.append('file', blob, totalSize + '_myvideo.webm');
        xhr.open('POST', SOCKET_SERVER_URL + '/upload', true);
        xhr.onreadystatechange = function() {
          if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log('Video uploaded successfully!');
          }
        };
        xhr.send(formData);
        recorder.start(1000);
      };
      
      
//       recorder.ondataavailable = (event) => {
//         console.log("dataavailable ");
//         if (typeof event.data === 'undefined') return;
//         if (event.data.size === 0) return;
//         chunks.push(event.data);
//       };
      
//       recorder.onstop = async () => {
//         const videoBlob = new Blob(chunks, { type: 'video/webm' });
//         // send the videoBlob to the AWS Lambda function
//       };

      // recorder.addEventListener('dataavailable', event => {
      //   console.log("dataavailable ");
      //   if (typeof event.data === 'undefined') return;
      //     if (event.data.size === 0) return;
      //     chunks.push(event.data);
      //   });
      // recorder.addEventListener('stop', () => {
      //   const recording = new Blob(chunks, {
      //     type: mimeType
      //   });
      //   // renderRecording(recording, list);
      //   chunks = [];
      // });
      
      console.log("CHUNKS ", chunks);

      localStreamRef.current = localStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      if (!socketRef.current) return;
      socketRef.current.emit('join_room', {
        room: user.roomId,
        email: user.emailId,
      });
    } catch (e) {
      console.log(`getUserMedia error: ${e}`);
    }
  }, []);

  const createPeerConnection = useCallback((socketID, email) => {
    try {
      const pc = new RTCPeerConnection(pc_config);

      pc.onicecandidate = (e) => {
        if (!(socketRef.current && e.candidate)) return;
        console.log('onicecandidate');
        socketRef.current.emit('candidate', {
          candidate: e.candidate,
          candidateSendID: socketRef.current.id,
          candidateReceiveID: socketID,
        });
      };

      pc.oniceconnectionstatechange = (e) => {
        console.log(e);
      };

      pc.ontrack = (e) => {

        // console.log(e.streams[0]);
        setUsers((oldUsers) =>
          oldUsers
            .filter((user) => user.id !== socketID)
            .concat({
              id: socketID,
              email,
              stream: e.streams[0],
            }),
        );
      };

      if (localStreamRef.current) {
        console.log('localstream add');
        localStreamRef.current.getTracks().forEach((track) => {
          if (!localStreamRef.current) return;
          pc.addTrack(track, localStreamRef.current);
        });
      } else {
        console.log('no local stream');
      }

      return pc;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }, []);

  useEffect(() => {
    socketRef.current = io.connect(SOCKET_SERVER_URL);
    getLocalStream();

    socketRef.current.on('all_users', (allUsers, sender) => {
      // if(sender=="sample@naver.com")
      // {
        
        allUsers.filter(x=>x.id==sender).forEach(async (user) => {
          if (!localStreamRef.current) return;
          const pc = createPeerConnection(user.id, user.email);
          if (!(pc && socketRef.current)) return;
          pcsRef.current = { ...pcsRef.current, [user.id]: pc };
          try {
            const localSdp = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            });
            console.log('create offer success');
            await pc.setLocalDescription(new RTCSessionDescription(localSdp));
            socketRef.current.emit('offer', {
              sdp: localSdp,
              offerSendID: socketRef.current.id,
              offerSendEmail: user.name ?? "IP",
              offerReceiveID: user.id,
            });
          } catch (e) {
            console.error(e);
          }
        });
      // }
      
    });

    socketRef.current.on(
      'getOffer',
      async (data) => {
        const { sdp, offerSendID, offerSendEmail } = data;
        console.log('get offer');
        if (!localStreamRef.current) return;
        const pc = createPeerConnection(offerSendID, offerSendEmail);
        if (!(pc && socketRef.current)) return;
        pcsRef.current = { ...pcsRef.current, [offerSendID]: pc };
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          console.log('answer set remote description success');
          const localSdp = await pc.createAnswer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
          });
          await pc.setLocalDescription(new RTCSessionDescription(localSdp));
          socketRef.current.emit('answer', {
            sdp: localSdp,
            answerSendID: socketRef.current.id,
            answerReceiveID: offerSendID,
          });
        } catch (e) {
          console.error(e);
        }
      },
    );

    socketRef.current.on(
      'getAnswer',
      (data) => {
        const { sdp, answerSendID } = data;
        console.log('get answer');
        const pc = pcsRef.current[answerSendID];
        if (!pc) return;
        pc.setRemoteDescription(new RTCSessionDescription(sdp));
      },
    );

    socketRef.current.on(
      'getCandidate',
      async (data) => {
        console.log('get candidate');
        const pc = pcsRef.current[data.candidateSendID];
        if (!pc) return;
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        console.log('candidate add success');
      },
    );

    socketRef.current.on('user_exit', (data) => {
      if (!pcsRef.current[data.id]) return;
      pcsRef.current[data.id].close();
      delete pcsRef.current[data.id];
      setUsers((oldUsers) => oldUsers.filter((user) => user.id !== data.id));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      users.forEach((user) => {
        if (!pcsRef.current[user.id]) return;
        pcsRef.current[user.id].close();
        delete pcsRef.current[user.id];
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createPeerConnection, getLocalStream]);

  return (
    <div>
      {/* <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: 'black',
        }}
        muted
        ref={localVideoRef}
        autoPlay
      /> */}

      {users.map((user, index) => (
        // <video src={user.stream}></video>
        <Video key={index} email={user.email} stream={user.stream} muted={true}/>
      ))}
    </div>
  );
};

export default StreamCameras;
