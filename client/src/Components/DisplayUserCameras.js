import React, { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import {API} from '../backend'

function DisplayUserCameras() {
    const [cameras, setCameras] = useState([]);

    useEffect(()=>{
       const cameraResponse = fetch(`${API}/users/login/${JSON.parse(localStorage.getItem("jwt"))._id}`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify()
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));

            setCameras(cameraResponse);
    },[cameras]);

  return (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map((camera)=>{
                 <tr>
                 <td>1</td>
                 <td>Mark</td>
                 <td>Otto</td>
                 <td>@mdo</td>
               </tr>
            })}
          </tbody>
        </Table>
      );
}

export default DisplayUserCameras