import React, { useEffect, useState } from 'react'
import Header from './Header'
import { API } from '../backend';

import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.REACT_APP_S3_Region,
  accessKeyId: process.env.REACT_APP_S3_accessKeyId,
  secretAccessKey: process.env.REACT_APP_S3_secretAccessKey
});


function Recordings() {
    const [recordings, setRecordings] = useState();
    
    const getAllRecordings = async()=>{
        const userRecordings = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/recordings/${JSON.parse(localStorage.getItem("jwt")).id}`, {
            method: "GET",
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));
        console.log("Recordings are "+userRecordings);
        setRecordings(userRecordings);
    }
    useEffect(()=>{
        getAllRecordings();
    },[])
  return (
    <div>
         <Header/>
         {
            recordings && recordings.recordings.map((recording)=>{
                const url = s3.getSignedUrl('getObject', {
                    Bucket: process.env.REACT_APP_S3_BucketName,
                    Key: recording.name+".mp4",
                    Expires: 3600 
                });
               return <video controls style={{height:'25%', width:'25%', margin:'5%'}}>
                    <source src={url} type="video/mp4"/>
                </video>
            })
         }
        

      {/* {users.map((user, index) => (
        <Video key={index} email={user.name} stream={user.stream} muted={true}/>
      ))} */}
    </div>
  )
}

export default Recordings