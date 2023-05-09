import React, { useEffect, useRef, useState } from 'react'
import Header from './Header'
import { API } from '../backend';

import AWS from 'aws-sdk';
import { Button } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import '../css/recordings.css'
import VideoPlayer from './VideoPlayer';

const s3 = new AWS.S3({
  region: process.env.REACT_APP_S3_Region,
  accessKeyId: process.env.REACT_APP_S3_accessKeyId,
  secretAccessKey: process.env.REACT_APP_S3_secretAccessKey
});


function Recordings() {
    const [selectedVideoURL, setSelectedVideoURL] = useState();
    const [selectedItem, setSelectedItem] = useState('');
    const [recordings, setRecordings] = useState();
    const [filteredRecordings, setFilterRecordings] = useState([]);
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('');

    const handleSelect = (eventKey) => {
      setSelectedItem(eventKey); 
    };

    const handleSortSelect = (eventKey) => {
      setSortBy(eventKey);
      let sortedList = [...recordings];
      if (eventKey === 'duration') {
        sortedList.sort((a, b) => a.duration - b.duration);
        setRecordings(sortedList);
        setFilterRecordings([]);
      } else if (eventKey === 'startDate') {
        sortedList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setRecordings(sortedList);
        setFilterRecordings([]);
      } else if (eventKey === 'endDate') {
        sortedList.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        setRecordings(sortedList);
        setFilterRecordings([]);
      }
      else if(eventKey === 'webcam')
      {
        setFilterRecordings(sortedList.filter((video)=>video.videoType === 'webcam'));
      }
      else if(eventKey === 'ip')
      {
        setFilterRecordings(sortedList.filter((video)=>video.videoType === 'ipcam'))
      }
    };
    
    const setRecordingUrls = (userRecordings)=>{
      return userRecordings.map((recording)=>{
        recording.url = s3.getSignedUrl('getObject', {
          Bucket: process.env.REACT_APP_S3_BucketName,
          Key: recording.name+".mp4",
          Expires: 3600 
      });
      return recording;
      })
    }

    const getAllRecordings = async()=>{
        const userRecordings = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/recordings/${JSON.parse(localStorage.getItem("jwt")).id}`, {
            method: "GET",
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));
        console.log("Recordings are "+userRecordings);
        const newRecordings = setRecordingUrls(userRecordings.recordings);
        setRecordings(newRecordings);
    }

    const handleQuery = async()=>{
      const response = await fetch(`${process.env.REACT_APP_ADARSH}/extract_frames`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({s3_url: selectedVideoURL, email_id:JSON.parse(localStorage.getItem("jwt")).emailId, type: selectedItem })
      })
        .then(response => {
          return response.json();
        })
        .then(response => {
          setMessage(response.message)
          return response.json();
        })
        .catch(err => console.log(err));
        
      console.log("response "+response);
    }
    useEffect(()=>{
        getAllRecordings();
    },[])

  return (
    <div style={{ height: '100vh', position: 'relative'}}>
         <Header/>
         <div style={{ backgroundColor: 'cornflowerblue', height: '100%'}}>
          {Query()}
          {message.length>0 && <h4 style={{color:'chartreuse', fontSize: '1.2rem'}}>{"Your requested video "+message+" is being processed"}</h4>}
          {RecordingFilters(handleSortSelect, sortBy)}
          {VideoRecordingsGrid()}
         </div>
    </div>
  )

  function VideoRecordingsGrid() {
    return <div style={{ backgroundColor: 'cornflowerblue', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' ,  gridGap:'20px', margin:'1rem'}}>

      {filteredRecordings.length > 0 ? (
        filteredRecordings.map((recording, index) => {
          return <div style={{ position: 'relative' }}>
            <input style={{ position: 'absolute', zIndex: 1, top: '2rem', left: '1rem' }} type="radio" id={index} name="recording" value={recording.name}
              onChange={(e) => { setSelectedVideoURL(recording.s3URI); } } />
            <VideoPlayer height="15rem" width="15rem" url={recording.url} />
          </div>;

        })
      ) :
        recordings && recordings.map((recording, index) => {
          return <div style={{ position: 'relative', margin:'1rem' }}>
            <input style={{ position: 'absolute', zIndex: 1, top: '2rem', left: '1rem' }} type="radio" id={index} name="recording" value={recording.name}
              onChange={(e) => { setSelectedVideoURL(recording.s3URI); } } />
            <VideoPlayer height="15rem" width="15rem" url={recording.url} />
          </div>;

        })}
    </div>;
  }

  function Query() {
    return <div style={{ position: 'relative', zIndex: 1, margin: '5px', display: 'flex', justifyContent: 'space-between' }}>
      <Dropdown style={{ margin: '1rem' }} onSelect={handleSelect}>
        <Dropdown.Toggle variant="primary" id="dropdown-basic">
          {selectedItem ? selectedItem : 'Select an option'}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item eventKey="emotion">Emotion</Dropdown.Item>
          <Dropdown.Item eventKey="license">License</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Button style={{ margin: '1rem' }} onClick={handleQuery}>Query</Button>
    </div>;
  }
}

export default Recordings

function RecordingFilters(handleSortSelect, sortBy) {
  return <div>
    <Dropdown style={{ margin: '1rem' }} onSelect={handleSortSelect}>
      <Dropdown.Toggle variant="primary" id="dropdown-basic">
        {sortBy ? sortBy : 'Filter/Sort By'}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item eventKey="duration">duration</Dropdown.Item>
        <Dropdown.Item eventKey="startDate">Start Date</Dropdown.Item>
        <Dropdown.Item eventKey="endDate">End Date</Dropdown.Item>
        <Dropdown.Item eventKey="webcam">Webcam</Dropdown.Item>
        <Dropdown.Item eventKey="ip">Ip</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  </div>;
}
