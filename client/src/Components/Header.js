import React from 'react'
import '../css/Header.css'
import { signout, isAutheticated } from "../auth/authapicalls";
import { Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

function Header() {
  const history = useHistory();
  return (
    <div className='header'>
      <div></div>
      <div>Vehicle Tracking</div>
       {isAutheticated() && (
              <Button
                variant="light"
                onClick={() => {
                  signout(() => {
                    history.push("/");
                  });
                }}
              >
                Signout
              </Button>
            )}
            {!isAutheticated() && (
              <div>
                <Button onClick={() => history.push("/login")}>Log in</Button>
                &nbsp;
                <Button onClick={() => history.push("/signup")}>Sign up</Button>
              </div>
            )}
      
      
      </div>
  )
}

export default Header