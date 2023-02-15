import React from 'react'
import Button from 'react-bootstrap/Button';
import { useHistory } from "react-router-dom";

function OpenViduStreaming() {
    const history = useHistory();

  function handleClick() {
    history.push("/streamOpenVidu");
  }
  return (
    <div>
         <Button variant="primary" size="lg" onClick={handleClick}>
          Open Vidu Streaming
      </Button>
    </div>
  )
}

export default OpenViduStreaming