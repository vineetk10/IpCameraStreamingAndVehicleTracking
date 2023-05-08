import { useState, useEffect } from 'react';

function VideoPlayer({ url }) {
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
      style={{ width: '100%', height: 'auto' }}
    />
  );
}

export default VideoPlayer