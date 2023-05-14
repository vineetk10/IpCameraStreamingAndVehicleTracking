import cv2
import boto3
import os

from fer import FER
from moviepy.video.io.VideoFileClip import VideoFileClip
from moviepy.video.VideoClip import ImageClip

# Define the emotion labels
emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Create an instance of the emotion detection algorithm
emotion_detector = FER()

# Define the input and output paths
input_path = '739ae2b2-8b47-4e4d-93c1-c90c0e5ab6fd_1'
output_path = 's3://ipcamerastreaming/output.mp4'

# Define the new video dimensions
new_width = 480
new_height = 270

# Get a list of all the image files in the input folder
image_files = [f for f in os.listdir(input_path) if f.startswith('frame') and f.endswith('.jpg')]

# Sort the image files by their frame number
image_files.sort(key=lambda x: int(x.split('frame')[1].split('.jpg')[0]))

# Create a list to store the processed frames
frames = []
fps=25
# Process each image in the input folder
for image_file in image_files:
    # Read the next image file
    image_path = os.path.join(input_path, image_file)
    image = cv2.imread(image_path)

    # Resize the image
    resized_image = cv2.resize(image, (new_width, new_height))

    # Detect faces in the resized image and label them with the detected emotion
    faces = emotion_detector.detect_emotions(resized_image)
    for face in faces:
        x, y, w, h = face['box']
        emotion = max(face['emotions'], key=face['emotions'].get)
        cv2.rectangle(resized_image, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(resized_image, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    # Convert the image to RGB format
    rgb_image = cv2.cvtColor(resized_image, cv2.COLOR_BGR2RGB)

    # Add the processed image to the list of frames
    frames.append(rgb_image)

# Create a video clip from the processed frames
clip = ImageClip(frames[0])
for frame in frames[1:]:
    clip = clip.set_duration(1/fps).concatenate(ImageClip(frame))

# Write the video clip to the output file
clip.write_videofile(output_path, codec='libx264', fps=fps)

# Upload the output file to S3
s3 = boto3.resource('s3')
s3.meta.client.upload_file(output_path, 'ipcamerastreaming', 'output.mp4')

