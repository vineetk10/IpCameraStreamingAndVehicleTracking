import React, { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import AddIPCamera from './AddIPCamera'
import { Button, Table } from 'react-bootstrap'
import styled from 'styled-components';
import VideoPlayer from './VideoPlayer'
import AWS from 'aws-sdk';
const StyledTd = styled.td`
  max-width: 200px; /* adjust the width as needed */
  white-space: nowrap; /* prevent line breaks */
  overflow-x: auto; /* hide any overflow */
`;

const s3 = new AWS.S3({
    region: process.env.REACT_APP_S3_Region,
    accessKeyId: process.env.REACT_APP_S3_accessKeyId,
    secretAccessKey: process.env.REACT_APP_S3_secretAccessKey
  });
function RequestStatus() {

    const [statuses, setStatuses] = useState([]);

    const getStatus = async()=>{
        const statusResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/queries/${JSON.parse(localStorage.getItem("jwt")).id}`, {
            method: "GET"
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));

            setStatuses(statusResponse.queries);
    }

    const deleteStatus = (statusId)=>{
        fetch(`${process.env.REACT_APP_SERVER_URL}/users/queries/${JSON.parse(localStorage.getItem("jwt")).id}/${statusId}`, {
            method: "DELETE"
          })
            .then(response => {
              return response.json();
            })
            .then(response => {
                return response.json();
              })
            .catch(err => console.log(err));
    }

    useEffect(()=>{
        getStatus();
       
    },[]);
  return (
    <div style={{height:'100vh', backgroundColor:'aliceblue'}}>
        <Header/>
        <div>
            <Table style={{position:'relative', top:'5rem'}} striped bordered hover>
                <thead>
                    <tr style={{backgroundColor:'cornflowerblue'}}>
                    <th>#</th>
                    <th>Query Type</th>
                    <th>Message Id</th>
                    <th>Input</th>
                    <th>Status</th>
                    <th>Recieved Timestamp</th>
                    <th>Output</th>
                    <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {statuses.map((status,index)=>{
                    const outputUrl = s3.getSignedUrl('getObject', {
                        Bucket: process.env.REACT_APP_S3_BucketName,
                        Key: status.message_id+".mp4",
                        Expires: 3600 
                    });
                    const inputUrl = s3.getSignedUrl('getObject', {
                      Bucket: process.env.REACT_APP_S3_BucketName,
                      Key: status.input_key ? status.input_key : 'abc',
                      Expires: 3600 
                  });
                    return  <tr style={{backgroundColor:'azure'}}>
                        <StyledTd>{index+1}</StyledTd>
                        <StyledTd>{status.query_type}</StyledTd>
                        <StyledTd>{status.message_id}</StyledTd>
                        <StyledTd>{status.input_key!=null ?  <VideoPlayer height="15rem" url={inputUrl}>Output</VideoPlayer> : ''}</StyledTd>
                        <StyledTd>{status.status}</StyledTd>
                        <StyledTd>{status.received_timestamp}</StyledTd>
                        <StyledTd>{status.output_url!==null ? <VideoPlayer height="15rem" url={outputUrl}/> : ''}</StyledTd>
                        <StyledTd><Button variant="danger" onClick={() => { deleteStatus(status.message_id) }}>Delete</Button></StyledTd>
                    </tr>
                    })}
                </tbody>
                </Table>
            {/* <EditCameraModal show ={show} cameraId={cameraId} cameraIp={cameraIp} cameraName={cameraName} handleClose={handleClose}/> */}
         </div>
        {/* <Footer/> */}
    </div>
  )
}

export default RequestStatus