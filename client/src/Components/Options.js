import React from 'react'
import '../css/Options.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import QueryLicensePlate from './QueryLicensePlate';
import StreamIpCameras from './StreamIpCameras';
import Image from 'react-bootstrap/Image'
import IpCamera from '../Components/images/IpCamera.jpg'
function Options() {
  return (
    <div className='options'>
        <Container className='options-container'>
            <Row>
                <Col className='options-container-license-plate'>
                    <QueryLicensePlate/>
                </Col>
                <Col>
                    <Image src={IpCamera}/>
                </Col>
                <Col className='options-container-license-stream'>
                    <StreamIpCameras/>
                </Col>
            </Row>
        </Container>
    </div>
  )
}

export default Options