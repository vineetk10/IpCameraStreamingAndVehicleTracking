from kafka import KafkaConsumer, TopicPartition
import cv2
import json
import os
import boto3
import cv2
from fer import FER
import numpy as np
os.environ['AWS_ACCESS_KEY_ID'] = 'AKIASDHZS5MOEMCTAE5J'
os.environ['AWS_SECRET_ACCESS_KEY'] = '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'
# set up the consumer configuration
consumer_config = {
    'bootstrap_servers': ['localhost:9092'],
    'group_id': 'my-group'
}

# create the Kafka consumer group
consumer_group = KafkaConsumer(group_id=consumer_config['group_id'], 
                               bootstrap_servers=consumer_config['bootstrap_servers'])

# assign the consumers to specific partitions
consumer1_partition = TopicPartition('video-frames', 0)
consumer2_partition = TopicPartition('video-frames', 1)

# assign the partitions to the consumers
consumer_group.assign([consumer1_partition, consumer2_partition])

def process_frames(folder_path):
    emotion_detector = FER()
    
    # Define the emotion labels
    emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
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
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    output_video=folder_path[0:-1]+'.avi'
    #first_file=folder_path+image_files[0]
    #first_image = cv2.imread(first_file)
    #frame_size = (first_image.shape[1], first_image.shape[0])
    out = cv2.VideoWriter(output_video, fourcc, 30, (new_width,new_height))
    if not os.path.exists(folder_name):
        os.makedirs(folder_name)
    for image_file in image_files:
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

        out.write(resized_frame)
    out.release()
    cv2.destroyAllWindows()
    s3 = boto3.client('s3')
    s3.upload_file(output_video, 'ipcamerastreaming', output_video)

# read messages from the partitions indefinitely
while True:
    messages = consumer_group.poll(1000)
    for partition in consumer_group.assignment():
        if partition in messages:
            for message in messages[partition]:
                #consumer_id = consumer_group._consumer_id
                print(f" Partition: {partition} | Message: {message.value.decode('utf-8')}")
                print("inside process_frames!!")
                msg=json.loads(message.value.decode('utf-8'))
                print(msg['message_id'])
                process_frames(msg['message_id'])
                print("outside the method")


