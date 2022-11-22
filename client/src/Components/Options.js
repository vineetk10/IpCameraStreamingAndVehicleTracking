import React from 'react'
import '../css/Options.css'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import QueryLicensePlateButton from './QueryLicensePlateButton';
import Image from 'react-bootstrap/Image'
import IpCamera from '../Components/images/IpCamera.jpg'
import StreamIpCamerasButton from './StreamIpCamersButton';
function Options() {
  return (
    <div className='options'>
        <Container className='options-container'>
            <Row>
                <Col className='options-container-license-plate'>
                    <QueryLicensePlateButton/>
                </Col>
                <Col>
                    <Image src={IpCamera}/>
                </Col>
                <Col className='options-container-license-stream'>
                    <StreamIpCamerasButton/>
                </Col>
            </Row>
        </Container>
    </div>
  )
}

export default Options