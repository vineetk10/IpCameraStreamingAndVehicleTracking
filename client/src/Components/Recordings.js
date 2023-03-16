import React, { useEffect } from 'react'
import Header from './Header'
import { API } from '../backend';

function Recordings() {

    // const getAllRecordings = ()=>{
    //     return fetch(`${API}/users/register`, {
    //         method: "POST",
    //         headers: {
    //           Accept: "application/json",
    //           "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify()
    //       })
    //         .then(response => {
    //           return response.json();
    //         })
    //         .catch(err => console.log(err));
    // }
    useEffect(()=>{
        // getAllRecordings();
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