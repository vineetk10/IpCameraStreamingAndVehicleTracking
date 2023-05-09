import { useState, useEffect } from 'react';

function VideoPlayer({ url, height, width }) {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (player) {
      player.src = url;
      player.load();
    }
  }, [url, player]);

  return (
    <video
      ref={setPlayer}
      controls
      style={{ width: '15rem', height: height? height : 'auto', backgroundColor:'black' }}
    />
  );
}

export default VideoPlayer