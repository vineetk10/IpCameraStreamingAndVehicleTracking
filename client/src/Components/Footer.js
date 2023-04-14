import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
      <Container fluid className="fixed-bottom" style={{ height:'3rem' , backgroundColor:'cornflowerblue'}}>
        <Row style={{width:'100%'}}>
          <Col md={6}>
            <p>&copy; 295 IP Camera Streaming and Vehicle Tracking</p>
          </Col>
          <Col md={6}>
            <p>Designed by Vineet, Vivek, Sai & Adarsh</p>
          </Col>
        </Row>
      </Container>
  );
};

export default Footer;
