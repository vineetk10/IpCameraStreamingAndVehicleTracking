# MultiCameraObjectTracking

## Steps to run the application
There are 4 main components of this application which are:- <br>
a. Client - This contains the UI code for the application. <br>
b. Server - This contains all the server side code for the application which includes user api's, camera api's and storing video to S3. <br>
c. Signalling server - This contains the intermidiary server side code for creating a websocket connection between multiple clients.<br>
d. Processing server - This contains the kafka code for producer and consumer.<br>

To start each of the application you will have to:
1. Client:- <br>
  a. Create .env file in the root folder of client and add the values for REACT_APP_SIGNALLING_SERVER_URL, REACT_APP_SERVER_URL, REACT_APP_SERVER_IP, REACT_APP_S3_Region, REACT_APP_S3_BucketName, REACT_APP_S3_accessKeyId, REACT_APP_S3_secretAccessKey, REACT_APP_ProcessingServer.  <br>
  b. Run command "npm install" and "npm start"
  
2. Server:- <br>
  a. Create a config.env file in the root folder of server and add values for ATLAS_URI ,PORT=8000, YOUR_ACCESS_KEY_ID, YOUR_SECRET_ACCESS_KEY, SQS_REGION, SQS_URL

//Provide the seconds delay to show msgs on the SQS
DELAY_SECONDS=20

// Provide the maximum msgs that can be polled from the SQS
MAX_MSGS_POLLED=10 <br>
  b. Run command "npm install" and "npm start"

3. Signalling server - Deploy this code on cloud and run command "npm install" and "npm start".

4. Processing server:
Installtaion: Install tensorflow, opencv , fer, moviepy, numpy <br>
Run zookeeper: bin/zookeeper-server-start.sh config/zookeeper.properties <br>
Run Kafka: bin/kafka-server-start.sh config/server.properties <br>
Run producer.py : flask run --host=0.0.0.0 --port=8080 <br>
Run con_simple.py(consumer for emotion detection): python3 con_simple.py <br>
Run con2.py (consumer for license plate detection): python3 con2.py <br>

## Architecture Diagram
![Architecture Diagram](https://user-images.githubusercontent.com/26499781/231992341-8f29d4cb-8cde-4ad3-9e0b-0e989c0ede1c.png)

## High-level design for WebCam streaming using WebRTC
![image](https://user-images.githubusercontent.com/26499781/231992622-6c0beeec-51eb-4702-b945-006e751ace4e.png)

## High-level design for IP camera streaming
![HLD (3)](https://user-images.githubusercontent.com/26499781/231993954-d66af9e9-f13c-4515-a812-59db7351e2a3.png)

## High-level design for handling video streams using Kafka Consumer/Producer mechanisms
<img width="673" alt="image" src="https://user-images.githubusercontent.com/26499781/231993110-0a840ad3-f699-466d-a291-3b0b2a7d12b9.png">
