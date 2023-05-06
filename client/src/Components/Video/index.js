import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
	position: relative;
	display: inline-block;
	
`;
const VideoContainer = styled.video`
	width: 100%;
	height: 100%;
	margin: 10px;
	border: 1px solid lightgray;
`;

const UserLabel = styled.p`
	display: inline-block;
	position: absolute;
	bottom: 10px;
	left: 1.5rem;
	font-size: 1.2rem;
	color: black;
	font-family: cursive;
`;

// interface Props {
// 	email: string;
// 	stream: MediaStream;
// 	muted?: boolean;
// }

const Video = ({ email, stream, muted }) => {
	const ref = useRef(null);
	const [isMuted, setIsMuted] = useState(false);

	useEffect(() => {
		if (ref.current) ref.current.srcObject = stream;
		if (muted) setIsMuted(muted);
	}, [stream, muted]);

	return (
		<Container  style={{ width: '100%' }}>
			<VideoContainer  ref={ref} muted={isMuted} autoPlay />
			<UserLabel>{email}</UserLabel>
	  </Container>
		
	);
};

export default Video;
