from kafka import KafkaConsumer
from datetime import datetime
from pymongo import MongoClient
import threading
import concurrent.futures
import shutil
import time
import cv2
import json
import os
from threading import Lock
import asyncio
import boto3
import moviepy.editor as moviepy
import cv2
from fer import FER
import numpy as np
#lock = threading.Lock()
request_lock = Lock()
import concurrent.futures
import queue
#loop = asyncio.get_event_loop()
# Replace the <username>, <password>, <cluster-name>, and <dbname> with your own values
client = MongoClient("mongodb+srv://cmpe295:cmpe295@cmpe295.6lb75ya.mongodb.net/?retryWrites=true&w=majority")
# Access your database and collection
db = client["multicamera"]
collection = db["users"]
executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
requests_queue = queue.Queue()
#s3 = boto3.client('s3')
#s3 = boto3.client('s3',aws_access_key_id='',aws_secret_access_key='')
emotion_detector = FER(mtcnn=True)
s3 = boto3.client('s3', region_name='us-west-1', aws_access_key_id='access_key', aws_secret_access_key='secret_key')


# Define the emotion labels
emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

def consume(partition):
    consumer = KafkaConsumer(
        'emotion',
        bootstrap_servers=['localhost:9092'],
        enable_auto_commit=False,
        group_id='my-group')

    while True:
        try:
            for message in consumer:
                #process_frame(message)
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
    print(message.partition)
    start_time = time.time()
    #time.sleep(60)
    msg=json.loads(message.value.decode('utf-8'))
    folder_path=msg['message_id']
    user_id=msg['user_id']
    fps = msg['fps']
    #time.sleep(60)
    #emotion_detector = FER()

    # Define the emotion labels
    #emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
    # Define the path to the folder containing the image files
    #folder_path = "739ae2b2-8b47-4e4d-93c1-c90c0e5ab6fd_1/"
    # Get a list of all the image files in the folder
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
    new_width = target_width
    new_height = int(new_width / aspect_ratio)
    # Create a VideoWriter object to write the output video
    print("one")
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    print("after fourcc")
    output_video=folder_path[0:-1]+'.avi'
    #first_file=folder_path+image_files[0]
    #first_image = cv2.imread(first_file)
    #frame_size = (first_image.shape[1], first_image.shape[0])
    print("before out")
    out = cv2.VideoWriter(output_video, fourcc, fps , (frame_width,frame_height))
    print("after out")
    #if not os.path.exists(folder_name):
        #os.makedirs(folder_name)
    print("going to executors!!")
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=8)
    futures = []
    for image_file in image_files:
        futures.append(executor.submit(make_frame, folder_path,image_file,frame_width,frame_height))
    concurrent.futures.wait(futures)

    for image_file in image_files:
        image=cv2.imread(folder_path + image_file)
        out.write(image)
    #out.write(resized_frame)
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
    #s3.upload_file(output_video, '295b', output_video, ExtraArgs={'ContentType': 'video/mp4'})
    with open(vid, 'rb') as f:
        s3.put_object(Bucket='295b', Key=vid, Body=f, ContentType='video/mp4')
    #with open(file_path, 'rb') as file:
        #s3.upload_fileobj(file, bucket_name, file_name,ExtraArgs={"Content-Type": 'video/mp4'})
    #s3.upload_file(output_video, '295b', output_video)
    os.remove(output_video)
    os.remove(vid)
    shutil.rmtree(folder_path)
    print("DONE SLEEPING")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print("Elapsed time: {:.2f} seconds".format(elapsed_time))
    bucket_name='295b'
    url = s3.generate_presigned_url(ClientMethod='get_object',Params={'Bucket': bucket_name,'Key': output_video, 'ResponseContentType': 'video/mp4'})
    print(url)
    now = datetime.utcnow()
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
        
    # Read the image file
    frame = cv2.imread(folder_path + image_file)
    # Process the image and get the resized frame
    #resized_frame = process_image(image)
    resized_frame = cv2.resize(frame, (new_width, new_height))
    #resized_frame=frame
    faces = emotion_detector.detect_emotions(resized_frame)
    for face in faces:
        x, y, w, h = face['box']
        emotion = max(face['emotions'], key=face['emotions'].get)
        cv2.rectangle(resized_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(resized_frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    cv2.imwrite(folder_path + image_file, resized_frame)
    '''out.write(resized_frame)
    out.release()
    cv2.destroyAllWindows()
    s3 = boto3.client('s3')
    s3.upload_file(output_video, 'ipcamerastreaming', output_video)
    os.remove(output_video)
    shutil.rmtree(folder_path)
    print("DONE SLEEPING")
    end_time = time.time()
    elapsed_time = end_time - start_time
    print("Elapsed time: {:.2f} seconds".format(elapsed_time))'''
    

if __name__ == "__main__":
    '''num_partitions = 2
    threads = []
    for partition in range(num_partitions):
        partition_info = {"topic": "video-frames", "partition": partition}
        t = threading.Thread(target=consume, args=(partition_info,))
        t.start()
        threads.append(t)
        
    #partition_0 = {"topic": "video-frames", "partition": 0}
    #partition_1 = {"topic": "video-frames", "partition": 1}

    #t1 = threading.Thread(target=consume, args=(partition_0,))
    #t2 = threading.Thread(target=consume, args=(partition_1,))

    #t1.start()
    #t2.start()

    #t1.join()
    #t2.join()
    for t in threads:
        t.join()'''
    partition_info = {"topic": "emotion", "partition": 0}
    consume(partition_info)

