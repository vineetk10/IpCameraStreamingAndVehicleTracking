import cv2
import os
import boto3
import cv2
from fer import FER
import numpy as np

# Load the FER model
emotion_detector = FER()

# Define the emotion labels
emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
# Define the path to the folder containing the image files
folder_path = "739ae2b2-8b47-4e4d-93c1-c90c0e5ab6fd_1/"

# Get a list of all the image files in the folder
file_list = os.listdir(folder_path)
image_files = [f for f in file_list if f.endswith(".jpg") or f.endswith(".png")]

# Sort the image files in ascending order based on the frame number in the file name
image_files.sort(key=lambda x: int(x.split("frame")[1].split(".")[0]))

# Define the video writer object
#fourcc = cv2.VideoWriter_fourcc(*'mp4v')
#video_writer = cv2.VideoWriter('output.mp4', fourcc, 30.0, (640, 480))
new_width = 480
new_height = 270
frame_num=1
folder_name = "fold"
# Create a VideoWriter object to write the output video
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter('test.avi', fourcc, 30, (new_width,new_height))
if not os.path.exists(folder_name):
    os.makedirs(folder_name)
# Loop through each image file, process it, and append it to the video
for image_file in image_files:
    # Read the image file
    frame = cv2.imread(folder_path + image_file)

    # Process the image and get the resized frame
    #resized_frame = process_image(image)
    resized_frame = cv2.resize(frame, (new_width, new_height))
    faces = emotion_detector.detect_emotions(resized_frame)
    for face in faces:
        x, y, w, h = face['box']
        emotion = max(face['emotions'], key=face['emotions'].get)
        cv2.rectangle(resized_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(resized_frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    
    # Append the resized frame to the video
    #filename = f"frame_{frame_num:04d}.jpg"
    #cv2.imwrite(filename, resized_frame)
    #/filename = os.path.join(folder_name, f"frame_{frame_num:04d}.jpg")
    #/cv2.imwrite(filename, resized_frame)
    #/frame_num += 1
    out.write(resized_frame)
    #video_writer.write(resized_frame)

# Release the video writer object
#video_writer.release()
out.release()


cv2.destroyAllWindows()
# Upload the resulting video to S3
s3 = boto3.client('s3')
#s3://ipcamerastreaming/video1.mp4
#bucket_name = 'ipcamerastreaming'
#object_key = 'output.mp4'
#s3.Bucket(bucket_name).upload_file(object_key, object_key)
#s3.upload_file('test.avi', 'ipcamerastreaming', 'test.avi')
# Upload the video to S3
s3.upload_file('test.avi', 'ipcamerastreaming', 'test.avi')

