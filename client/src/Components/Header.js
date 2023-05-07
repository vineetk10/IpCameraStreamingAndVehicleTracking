import React from 'react'
import '../css/Header.css'
import { signout, isAutheticated } from "../auth/authapicalls";
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import Avatar from 'react-avatar';

function Header() {
  const user = JSON.parse(localStorage.getItem("jwt"));
  const history = useHistory();
  return (
      
      <Navbar bg="light" variant="light">
         <span style={{marginLeft:'10px'}}>{isAutheticated() && <Avatar name={user.name} size="40"  round={true} />}</span>

        <Container style={{backgroundColor:'aliceblue'}}>
          {/* <Navbar.Brand href="#home">IP Camera Streaming & Vehcile Tracking</Navbar.Brand> */}
          <Nav className="me-auto">
            <Nav.Link href="stream">WebCam Live View</Nav.Link>
            <Nav.Link href="ipcamstream">IP Cam Live View</Nav.Link>
            <Nav.Link href="showRecordings">Playback/Query</Nav.Link>
            <Nav.Link href="status">Request Status</Nav.Link>
          </Nav>
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
        </Container>
      </Navbar>
      
      
      
  )
}

export default Header