import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import {API} from '../backend'
import EditCameraModal from './EditCameraModal';

function DisplayUserCameras() {
    const [cameras, setCameras] = useState([]);
    const [show, setShow] = useState(false);
    const [cameraId, setCameraId] = useState();
    const [cameraIp, setCameraIp] = useState();
    const [cameraName, setCameraName] = useState();

    const getCameras = async()=>{
        const cameraResponse = await fetch(`${API}/users/liveFeed/${JSON.parse(localStorage.getItem("jwt")).emailId}`, {
            method: "GET"
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));

            setCameras(cameraResponse.cameras);
    }

    const deleteCamera = (cameraId)=>{
        fetch(`${API}/users/deleteCamera/${JSON.parse(localStorage.getItem("jwt")).emailId}/${cameraId}`, {
            method: "DELETE"
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));
    }
    const handleClose = () => setShow(false);
    useEffect(()=>{
        getCameras();
       
    },[]);

  return (
    <>
     <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>IP</th>
              <th>Name</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera,index)=>{
              return  <tr>
                 <td>{index}</td>
                 <td>{camera.ip}</td>
                 <td>{camera.name}</td>
                 <td><Button  onClick={() => { setShow(true); setCameraId(camera._id); setCameraIp(camera.ip); setCameraName(camera.name)}}>Edit</Button></td>
                 <td><Button variant="danger" onClick={() => { deleteCamera(camera._id) }}>Delete</Button></td>
               </tr>
            })}
          </tbody>
        </Table>
            <EditCameraModal show ={show} cameraId={cameraId} cameraIp={cameraIp} cameraName={cameraName} handleClose={handleClose}/>
    </>
       
      );
}

export default DisplayUserCameras