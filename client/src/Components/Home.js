import React from 'react'
import AddIPCamera from './AddIPCamera';
import Footer from './Footer';
import Header from './Header';
import Options from './Options';

function Home() {
  return (
    <div style={{height:'100vh', backgroundColor:'aliceblue'}}>
        <Header/>
        <AddIPCamera/>
        <Footer/>
    </div>
  )
}

export default Home