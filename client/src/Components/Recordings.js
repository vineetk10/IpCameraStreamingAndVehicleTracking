import React, { useEffect, useState } from 'react'
import Header from './Header'
import { API } from '../backend';

import AWS from 'aws-sdk';
import { Button } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';
import { useMemo } from 'react';

const s3 = new AWS.S3({
  region: process.env.REACT_APP_S3_Region,
  accessKeyId: process.env.REACT_APP_S3_accessKeyId,
  secretAccessKey: process.env.REACT_APP_S3_secretAccessKey
});


function Recordings() {
    const [selectedVideoURL, setSelectedVideoURL] = useState();
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [recordings, setRecordings] = useState();
    const [message, setMessage] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [url, setUrl] = useState('')

    const handleSelect = (eventKey) => {
      setSelectedItem(eventKey); // update the state when a dropdown item is selected
    };

    const handleSortSelect = (eventKey) => {
      setSortBy(eventKey); // update the state when a dropdown item is selected
      let sortedList = [...recordings];
      if (eventKey === 'duration') {
        sortedList.sort((a, b) => a.duration - b.duration);
      } else if (eventKey === 'startDate') {
        sortedList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      } else if (eventKey === 'endDate') {
        sortedList.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
      }
      console.log(sortedList)
      setRecordings(sortedList);
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
      // setRecordings(userRecordings);
    }
    useEffect(()=>{
        getAllRecordings();
    },[])

    // const getVideoComponent = useMemo((url)=>{
    //   return <video controls style={{ width:'90%', margin:'1rem',border: '1px solid lightgray'}}>
    //     <source src={url} type="video/mp4"/>
    //   </video>
    // },[])
   
  return (
    <div>
         <Header/>
         <div style={{backgroundColor: 'cornflowerblue'}}>
          <div style={{position:'relative', zIndex:1, margin:'5px', display:'flex', justifyContent:'space-between'}}>
          <Dropdown style={{ margin:'1rem'}}  onSelect={handleSelect}>
          <Dropdown.Toggle variant="primary" id="dropdown-basic">
            {selectedItem ? selectedItem : 'Select an option'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item eventKey="emotion">Emotion</Dropdown.Item>
            <Dropdown.Item eventKey="license">License</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
            <Button style={{ margin:'1rem'}} onClick={handleQuery}>Query License</Button>
          </div>
          {message.length>0 && <h4 style={{color:'chartreuse', fontSize: '1.2rem'}}>{"Your requested video "+message+" is being processed"}</h4>}
          <div>
            <Dropdown style={{ margin:'1rem'}}  onSelect={handleSortSelect}>
            <Dropdown.Toggle variant="primary" id="dropdown-basic">
              {sortBy ? sortBy : 'Filter/Sort By'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="duration">duration</Dropdown.Item>
              <Dropdown.Item eventKey="startDate">Start Date</Dropdown.Item>
              <Dropdown.Item eventKey="endDate">End Date</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          </div>
          <form style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr'}}>
            
              {
                  recordings && recordings.map((recording, index)=>{
                      const url = s3.getSignedUrl('getObject', {
                          Bucket: process.env.REACT_APP_S3_BucketName,
                          Key: recording.name+".mp4",
                          Expires: 3600 
                      });
                    return <div style={{position:'relative'}}>
                      {recording.duration}
                      <input style={{position:'absolute', zIndex:1, top:'2rem', left:'1rem'}} type="radio" id={index} name="recording"  value={recording.name}
                      onChange={(e) => { setSelectedVideoURL(recording.url)}} />
                      {/* {()=>getVideoComponent(recording.url)} */}
                      <video controls style={{ width:'90%', margin:'1rem',border: '1px solid lightgray'}}>
        <source src={url} type="video/mp4"/>
      </video>
                    </div>

                  })
              }
          </form>
         </div>
        
         
        

      {/* {users.map((user, index) => (
        <Video key={index} email={user.name} stream={user.stream} muted={true}/>
      ))} */}
    </div>
  )
}

export default Recordings