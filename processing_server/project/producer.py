from flask_cors import CORS
import cv2
from datetime import datetime

from concurrent.futures import ThreadPoolExecutor
import numpy as np
import os
import boto3
import io
import threading
import json
from kafka import KafkaProducer
import uuid
from flask import Flask, jsonify, request
from pymongo import MongoClient

# Replace the <username>, <password>, <cluster-name>, and <dbname> with your own values
client = MongoClient("mongodb+srv://cmpe295:cmpe295@cmpe295.6lb75ya.mongodb.net/?retryWrites=true&w=majority")
# Access your database and collection
db = client["multicamera"]
collection = db["users"]

app = Flask(__name__)
CORS(app)
#os.environ['AWS_ACCESS_KEY_ID'] = 'access_key'
#os.environ['AWS_SECRET_ACCESS_KEY'] = 'sercet_key'
# Set up S3 client
s3 = boto3.client('s3')
s3 = boto3.client(
    's3',aws_access_key_id='access_key',aws_secret_access_key='sercet_key')
MAX_THREADS = 4
thread_pool = ThreadPoolExecutor(max_workers=MAX_THREADS)
lock = threading.Lock()
producer = KafkaProducer(bootstrap_servers=['localhost:9092'])
# Define function to extract frames from video and save them to S3
def extract_frames(bucket_name,object_key, output_folder, user_id,topic):
    # Download video from S3
    #print("Downloidn from S3")
    #response = s3.get_object(Bucket=bucket_name, Key=object_key)
    #print("Done!!")
    #video_data = response['Body'].read()
    #output_folder = 'folder'
    if not os.path.exists(output_folder):
        os.makedirs(output_folder) 
    #byte_stream = video_object['Body'].read()
    #video_stream = io.BytesIO(video_data)
    # create an OpenCV video capture object from the byte stream
    print("INSIDE EXTRATC FRAMES")
    print("Bucket:"+bucket_name)
    print("ker"+object_key)
    print("doing the read")
    try:
        url = s3.generate_presigned_url('get_object', Params = {'Bucket': bucket_name, 'Key': object_key}, ExpiresIn = 600) 
    except:
        print("not working")
    print("done read")
    cap = cv2.VideoCapture(url)
    print(url)
    print(cap)
    print("done printing cap")
    # initialize the previous frame
    prev_frame = None
    prev_pixel_count = None
    # loop through the video frames
    frame_count = 0
    threshold = 50
    fps = cap.get(cv2.CAP_PROP_FPS)
    print(fps)
    fgbg = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=50, detectShadows=False)
    while True:
        # read the next frame from the video capture object
        ret, frame = cap.read()
        #print(frame)
        # check if we have reached the end of the video
        if not ret:
            print("OOOPS")
            break
        #ret, jpeg_frame = cv2.imencode('.jpg', frame)
        #output_key = os.path.join(output_folder, f'frame{frame_count}.jpg')
        #s3.put_object(Bucket=output_bucket, Key=output_key, Body=jpeg_frame.tobytes())
        #frame_count+=1
        ret, jpeg_frame = cv2.imencode('.jpg', frame)
        output_file = os.path.join(output_folder, f'frame{frame_count}.jpg')
        with open(output_file, 'wb') as f:
            f.write(jpeg_frame.tobytes())
        frame_count += 1
        '''fgmask = fgbg.apply(frame)
        _, thresh = cv2.threshold(fgmask, threshold, 255, cv2.THRESH_BINARY)
        pixel_count = cv2.countNonZero(thresh)
        if prev_frame is not None:
            frame_diff = cv2.absdiff(frame, prev_frame)
            gray_diff=cv2.cvtColor(frame_diff, cv2.COLOR_BGR2GRAY)
            _, thresh_diff = cv2.threshold(gray_diff, 30, 255, cv2.THRESH_BINARY)
            frame_diff_pixel_count = cv2.countNonZero(thresh_diff)
            #_, frame_diff_thresh = cv2.threshold(frame_diff, 30, 255, cv2.THRESH_BINARY)
            #frame_diff_pixel_count = cv2.countNonZero(frame_diff_thresh)
            if frame_diff_pixel_count < 15000:
                continue
        if pixel_count > 500:  # adjust threshold as needed
            # Save frame to S3
            # Convert frame to JPEG format
            ret, jpeg_frame = cv2.imencode('.jpg', frame)
            output_key = os.path.join(output_folder, f'frame{frame_count}.jpg')
            s3.put_object(Bucket=output_bucket, Key=output_key, Body=jpeg_frame.tobytes())
            frame_count+=1
        prev_frame = frame
        prev_pixel_count = pixel_count'''
    message = {"message_id": output_folder,"user_id":user_id, "fps": fps}
    message_json = json.dumps(message)

    # Encode the JSON string as bytes
    message_bytes = message_json.encode('utf-8')
    with lock:
        try:
            producer.send(topic,message_bytes)
        except:
            print("Kafka not working but fine otherwise!!")
    print("KAFKA DONE!!")


# Define Flask route to handle GET requests
@app.route('/extract_frames', methods=['POST'])
def handle_request():
    # Extract S3 URL from request
    data = request.json
    user_id = data.get("email_id")
    topic = data.get("type")
    video_url = data.get("s3_url")
    #video_url = request.args.get('video_url')
    #user_id=request.args.get('user_id')
    print(video_url)
    #topic='license'
    s3_url_parts = video_url.replace('s3://', '').split('/')
    bucket_name = s3_url_parts[0]
    object_key = '/'.join(s3_url_parts[1:])
    # Extract frames from video and save to S3
    ##print("Bucket"+bucket_name)
    ##print("key is"+object_key)
    #output_bucket = bucket_name
    #output_folder = 'frames'
    folder_name=str(uuid.uuid4())
    #return jsonify({'message': folder_name})
    now = datetime.utcnow()
    #timestamp = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    queries = {
    "message_id": folder_name,
    "input_key":object_key,
    "input_url": video_url,
    "status": "received",
    "received_timestamp": now,
    "query_type": topic,
    "finished_timestamp": None,
    "output_url": None}

    
    collection.update_one(
    {"emailId": user_id},
    {"$push": {"queries": queries}})
    
    #return jsonify({'message': folder_name})
    try:
        thread_pool.submit(extract_frames,bucket_name, object_key, folder_name,user_id,topic)

    # Send Kafka message with number of frames extracted
    #message = f'{frame_count} frames extracted from {video_url}'
    #producer.send('frame-count', message.encode())
    except:
        return {'error': 'Service Unavailable'}, 503
    return jsonify({'message': folder_name})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=500)

