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

4. Processing server: <br>
Instaltaion: Insatll kafka. Also install tensorflow, opencv , fer, moviepy, numpy <br>
Run zookeeper: bin/zookeeper-server-start.sh config/zookeeper.properties <br>
Run Kafka: bin/kafka-server-start.sh config/server.properties <br>
Run producer.py : flask run --host=0.0.0.0 --port=8080 <br>
Run con_simple.py(consumer for emotion detection): python3 con_simple.py <br>
Run con2.py (consumer for license plate detection): python3 con2.py <br>

5. Experiment:<br>
Code already in place in file con_simple.py(the emotion detction consumer), under processing_server/project calculates the time taken to process the frames and convert the processed frames into videos. In Line 127, we have executor = concurrent.futures.ThreadPoolExecutor(max_workers=N) where N can be substituted for the number of threads that spaw in parallel to process the frames.


## Architecture Diagram
![Architecture Diagram](https://user-images.githubusercontent.com/26499781/231992341-8f29d4cb-8cde-4ad3-9e0b-0e989c0ede1c.png)

## High-level design for WebCam streaming using WebRTC
![image](https://user-images.githubusercontent.com/26499781/231992622-6c0beeec-51eb-4702-b945-006e751ace4e.png)

## High-level design for IP camera streaming
![HLD (3)](https://user-images.githubusercontent.com/26499781/231993954-d66af9e9-f13c-4515-a812-59db7351e2a3.png)

## High-level design for handling video streams using Kafka Consumer/Producer mechanisms
![Blank diagram](https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/acc75aa0-b66c-4fc4-899a-c216b4912bb4)



## Experiment:


<img width="1275" alt="1" src="https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/d6e2547c-c54e-4d6e-8d3d-1402def32df7">
Processing time with one thread
<br>
<br>
<img width="1343" alt="2" src="https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/7264ca54-4eeb-476c-8335-f4801861eed1">
Processing time with 4 threads
<br>
<br>
<img width="1258" alt="4" src="https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/9a6ba95d-c82b-403e-afaa-12a4943eb6c0"><img width="1258" alt="6" src="https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/2acfcc56-ff6b-4f71-979e-093308b119fd">
Processing with 6 threads
<br>
<br>
<img width="1281" alt="8" src="https://github.com/vineetk10/IpCameraStreamingAndVehicleTracking/assets/90799950/1282a4e3-70f0-4e39-aab3-05150f419516">
Processing with 8 threads
<br>
<br>

