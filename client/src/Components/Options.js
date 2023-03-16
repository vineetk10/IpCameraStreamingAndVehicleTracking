import React from 'react'
import '../css/Options.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import QueryLicensePlateButton from './QueryLicensePlateButton';
import Image from 'react-bootstrap/Image'
import IpCamera from '../Components/images/IpCamera.jpg'
import StreamIpCamerasButton from './StreamIpCamersButton';
import AddIPCameraButton from './AddIPCameraButton';
import OpenViduStreaming from './OpenViduStreaming';
import ShowRecordingButton from './ShowRecordingButton';
function Options() {
  return (
    <div className='options'>
        <Container className='options-container'>
            <Row>
                <Col className='options-container-license-plate'>
                    <Row><AddIPCameraButton/></Row>
                    <br/>
                    <Row><QueryLicensePlateButton/></Row>
                </Col>
                <Col>
                    <Image src={IpCamera}/>
                </Col>
                <Col className='options-container-license-stream'>
                    <StreamIpCamerasButton/>
                    <br/>
                    <Row><ShowRecordingButton/></Row>
                    {/* <Row><OpenViduStreaming/></Row> */}
                </Col>
            </Row>
        </Container>
    </div>
  )
}

export default Options