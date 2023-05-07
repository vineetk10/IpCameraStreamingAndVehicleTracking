import React, { useEffect, useState } from 'react'
import Header from './Header'
import Footer from './Footer'
import AddIPCamera from './AddIPCamera'
import { Button, Table } from 'react-bootstrap'
import styled from 'styled-components';

const StyledTd = styled.td`
  max-width: 200px; /* adjust the width as needed */
  white-space: nowrap; /* prevent line breaks */
  overflow-x: auto; /* hide any overflow */
`;

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
                    <th>Input Url</th>
                    <th>Status</th>
                    <th>Recieved Timestamp</th>
                    <th>Output URL</th>
                    <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {statuses.map((status,index)=>{
                    return  <tr style={{backgroundColor:'azure'}}>
                        <StyledTd>{index}</StyledTd>
                        <StyledTd>{status.query_type}</StyledTd>
                        <StyledTd>{status.message_id}</StyledTd>
                        <StyledTd>{status.input_url}</StyledTd>
                        <StyledTd>{status.status}</StyledTd>
                        <StyledTd>{status.received_timestamp}</StyledTd>
                        <StyledTd>{status.output_url!==null ? <a href={status.output_url}>Output</a> : ''}</StyledTd>
                        <StyledTd><Button variant="danger" onClick={() => { deleteStatus(status.message_id) }}>Delete</Button></StyledTd>
                    </tr>
                    })}
                </tbody>
                </Table>
            {/* <EditCameraModal show ={show} cameraId={cameraId} cameraIp={cameraIp} cameraName={cameraName} handleClose={handleClose}/> */}
         </div>
        <Footer/>
    </div>
  )
}

export default RequestStatus