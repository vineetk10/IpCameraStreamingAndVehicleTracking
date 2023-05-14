import React, { useEffect, useState } from 'react'
import JsmpegPlayer from '../Components/JsmpegPlayer';
import Header from './Header';

function IpCameraStreaming() {

  const [ports, setPorts] = useState([]);
  const videoOptions = {
    poster: 'https://cycjimmy.github.io/staticFiles/images/screenshot/big_buck_bunny_640x360.jpg'
  };
  
  const videoOverlayOptions = {};

  const getIpCamDetails = async ()=>{
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/liveFeed/${JSON.parse(localStorage.getItem("jwt")).emailId}`, {
        method: "GET",
      })
        .then(response => {
          return response.json();
        })
        .catch(err => console.log(err));
    console.log("Recordings are "+res);
    const p = res[0].cameras.map((camera)=>camera.port);
    console.log("Ports ", p);
    setPorts(p);
    // setRecordings(res[0].cameras);
    // "ws://54.190.19.109:50000"
  }
  useEffect(()=>{
    getIpCamDetails();
  },[])
  return (
    <div>
      <Header/>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', backgroundColor: 'cornflowerblue', height:'100vh'}}>
        {
        ports.map((port)=>{ 
          return <JsmpegPlayer
          wrapperClassName="video-wrapper"
          videoUrl= {`ws://${process.env.REACT_APP_SERVER_IP}:`+port}
          options={videoOptions}
          overlayOptions={videoOverlayOptions}
          />
      })}
    </div>
    </div>
   
  )
}

export default IpCameraStreaming