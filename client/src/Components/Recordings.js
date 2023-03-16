import React, { useEffect } from 'react'
import Header from './Header'
import { API } from '../backend';

function Recordings() {

    const getAllRecordings = async()=>{
        const recordings = await fetch(`${process.env.REACT_APP_SERVER_URL}/users/recordings/${JSON.parse(localStorage.getItem("jwt")).id}`, {
            method: "GET",
          })
            .then(response => {
              return response.json();
            })
            .catch(err => console.log(err));
        console.log("Recordings are "+recordings);
    }
    useEffect(()=>{
        getAllRecordings();
    })
  return (
    <div>
         <Header/>
      {/* {users.map((user, index) => (
        <Video key={index} email={user.name} stream={user.stream} muted={true}/>
      ))} */}
    </div>
  )
}

export default Recordings