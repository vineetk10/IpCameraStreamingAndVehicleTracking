from kafka import KafkaConsumer
from datetime import datetime
import moviepy.editor as moviepy
import threading
from pymongo import MongoClient
import concurrent.futures
from threading import Lock
import asyncio
import time
import cv2
import json
import os
import shutil
import boto3
import cv2
import re
import os
import io
from PIL import Image, ImageDraw, ImageFont
request_lock = Lock()
import concurrent.futures
import queue
#loop = asyncio.get_event_loop()
client = MongoClient("mongodb+srv://cmpe295:cmpe295@cmpe295.6lb75ya.mongodb.net/?retryWrites=true&w=majority")
# Access your database and collection
db = client["multicamera"]
collection = db["users"]

executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
requests_queue = queue.Queue()
s3 = boto3.client('s3')
s3 = boto3.client('s3',aws_access_key_id='access_key',aws_secret_access_key='access_key')
import numpy as np
rekognition = boto3.client('rekognition', region_name='us-east-2',aws_access_key_id='access_key',aws_secret_access_key='secret_key')
#lock = threading.Lock()
def consume(partition):
    consumer = KafkaConsumer(
        'license',
        bootstrap_servers=['localhost:9092'],
        enable_auto_commit=False,
        group_id='my-new-group')

    while True:
        try:
            for message in consumer:
                #process_frame(message)
                #consumer.commit()
                with request_lock:
                    requests_queue.put(message)
                executor.submit(process_queue)
                #asyncio.create_task(async_process_frame(message))
                print("Moved")
                consumer.commit()
        except Exception as e:
            print(f"Error: {e}")


def process_queue():
    # Call process_frame() asynchronously using asyncio
    print("HERE!!")
    #await asyncio.get_event_loop().run_in_executor(None, process_frame, message)
    while True:
        try:
            message= requests_queue.get(block=False)
        except request_queue.Empty:
            break
        else:
            executor.submit(process_frame, message)

def process_frame(message):
    # Process the framei
    print("SLEEP")
    #time.sleep(10)
    start_time = time.time()

    msg=json.loads(message.value.decode('utf-8'))
    folder_path=msg['message_id']
    user_id=msg['user_id']
    fps = msg['fps']
    folder_path+='/'
    file_list = os.listdir(folder_path)
    image_files = [f for f in file_list if f.endswith(".jpg") or f.endswith(".png")]
    image_files.sort(key=lambda x: int(x.split("frame")[1].split(".")[0]))
    # Sort the image files in ascending order based on the frame number in the file name
    image_files.sort(key=lambda x: int(x.split("frame")[1].split(".")[0]))
    # Define the video writer object
    #fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    #video_writer = cv2.VideoWriter('output.mp4', fourcc, 30.0, (640, 480))
    frame_num=1
    folder_name = "fold"
    first_file=folder_path+image_files[0]
    first_image = cv2.imread(first_file)
    frame_width =first_image.shape[1]
    frame_height = first_image.shape[0]
    # Calculate the target width based on a fraction of the original frame width
    width_fraction = 0.25
    target_width = int(frame_width * width_fraction)
    # Calculate the new dimensions based on the target width and the aspect ratio
    aspect_ratio = frame_width / frame_height
    new_width = first_image.shape[1]
    new_height = first_image.shape[0]
    # Create a VideoWriter object to write the output video
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    output_video=folder_path[0:-1]+'.avi'
    #first_file=folder_path+image_files[0]
    #first_image = cv2.imread(first_file)
    #frame_size = (first_image.shape[1], first_image.shape[0])
    out = cv2.VideoWriter(output_video, fourcc, fps , (new_width,new_height))
    #if not os.path.exists(folder_name):
        #os.makedirs(folder_name)
    #rekognition = boto3.client('rekognition', region_name='us-east-2')
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=100)

    # Submit the make_frame function to the executor for each image file
    futures = []
    for image_file in image_files:
        futures.append(executor.submit(make_frame, folder_path,image_file,new_width,new_height))
        print("is it fast??")
    concurrent.futures.wait(futures)
    
    for image_file in image_files:
        image=cv2.imread(folder_path + image_file)
        out.write(image)
    out.release()
    cv2.destroyAllWindows()
    #s3 = boto3.client('s3')
    bucket_name = '295b'
    file_name = output_video
    file_path = output_video
    print("processing done")
    clip=moviepy.VideoFileClip(output_video)
    vid=folder_path[:-1]+'.mp4'
    clip.write_videofile(vid)
    #s3.upload_file(output_video, '295b', output_video)
    with open(vid, 'rb') as f:
        s3.put_object(Bucket='295b', Key=vid, Body=f, ContentType='video/mp4')
    os.remove(output_video)
    os.remove(vid)
    shutil.rmtree(folder_path)
    print("DONE SLEEPING")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print("Elapsed time: {:.2f} seconds".format(elapsed_time))
    bucket_name='295b'
    #bucket_name='295b'
    url = s3.generate_presigned_url(ClientMethod='get_object',Params={'Bucket': bucket_name,'Key': output_video, 'ResponseContentType': 'video/mp4'})
    print(url)
    now = datetime.utcnow()

    #url = s3.generate_presigned_url(ClientMethod='get_object',Params={'Bucket': bucket_name,'Key': output_video})
    #print(url)
    #now = datetime.utcnow()
    user_doc = collection.find_one({"emailId": user_id})
    msg_id=folder_path[0:-1]
    # Loop through the queries array to find the correct query object based on the message ID
    for query_obj in user_doc["queries"]:
        if query_obj["message_id"] ==msg_id :
            # Update the query object with the new values
            query_obj["status"] = "finished"
            query_obj["finished_timestamp"] = now
            query_obj["output_url"] = url

            # Update the user document in the database
            collection.update_one({"emailId": user_id}, {"$set": {"queries": user_doc["queries"]}})

            # Break out of the loop once the query object has been updated
            break

def make_frame(folder_path,image_file,new_width,new_height):

    image=cv2.imread(folder_path + image_file)
    #time.sleep(5)
    
    #image = cv2.resize(image, (new_width, new_height))
    #_, image_bytes = cv2.imencode(".jpg", image)
    image_bytes = np.array(cv2.imencode('.jpg', image)[1]).tobytes()
    '''response = rekognition.detect_labels(Image={'Bytes': bytes(image_bytes)},MaxLabels=10,MinConfidence=50)

    # Filter the response to extract the license plate information
    license_plate = None
    for label in response['Labels']:
        if 'License Plate' in label['Name']:
            for instance in label['Instances']:
                license_plate = instance['BoundingBox']
                break
        if license_plate:
            break
    # Call the detect_text API to detect text in the image'''
    response = rekognition.detect_text(Image={'Bytes': image_bytes})
    # Extract the text and its location in the image
    text = {}
    for t in response['TextDetections']:
        if t['Type'] == 'LINE':
            text[t['DetectedText']] = t['Geometry']['BoundingBox']
    # Filter the text to extract the license plate characters
    license_plate_text = ''
    license_plate=True
    lp={}
    if license_plate:
        for t in text:
            #print(t)
            lp=text[t]
            t_pre=re.sub(r'\W+', '', t)
            if(len(t_pre)==7 or len(t_pre)==6):
                digits = re.findall(r'\d', t_pre)
                if(len(digits)>=3):
                    license_plate_text+=t_pre
                    break
        
    if lp!={}:
        left = int(image.shape[1] * lp['Left'])
        top = int(image.shape[0] * lp['Top'])
        right = int(left + image.shape[1] * lp['Width'])
        bottom = int(top + image.shape[0] * lp['Height'])
        # Draw bounding box
        cv2.rectangle(image, (left, top), (right, bottom), (0, 0, 255), 3)
        # Add license plate text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(license_plate_text, font, 1, 2)[0]
        cv2.putText(image, license_plate_text, (left, bottom + text_size[1] + 10), font, 1, (0, 0, 255), 2, cv2.LINE_AA)
    cv2.imwrite(folder_path + image_file, image)




    #out.write(image)
    #out.release()
    #cv2.destroyAllWindows()
    #s3 = boto3.client('s3')
    #s3.upload_file(output_video, 'ipcamerastreaming', output_video)
    #print("DONE SLEEPING")

if __name__ == "__main__":
    '''partition_0 = {"topic": "license", "partition": 0}
    partition_1 = {"topic": "license", "partition": 1}

    t1 = threading.Thread(target=consume, args=(partition_0,))
    t2 = threading.Thread(target=consume, args=(partition_1,))

    t1.start()
    t2.start()

    t1.join()
    t2.join()'''
    partition_info = {"topic": "license", "partition": 0}
    consume(partition_info)
