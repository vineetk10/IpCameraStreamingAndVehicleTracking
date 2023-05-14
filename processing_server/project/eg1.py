import cv2
from fer import FER
import numpy as np
import os

# Load the FER model
emotion_detector = FER()

# Define the emotion labels
emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# Open the input video stream
cap = cv2.VideoCapture('video1.mp4')

new_width = 480
new_height = 270
# Get the video codec and frame dimensions
fps = int(cap.get(cv2.CAP_PROP_FPS))
frame_size = (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)))

# Process each frame in the video stream
drop_rate=0.8
frame_num = 0
while cap.isOpened():
    # Read the next frame
    ret, frame = cap.read()
    if not ret:
        break
    if np.random.random() < drop_rate:
        continue
    # Resize the frame
    resized_frame = cv2.resize(frame, (new_width, new_height))

    # Detect faces in the resized frame
    faces = emotion_detector.detect_emotions(resized_frame)

    # Draw bounding boxes around the faces and label them with the detected emotion
    for face in faces:
        x, y, w, h = face['box']
        emotion = max(face['emotions'], key=face['emotions'].get)
        cv2.rectangle(resized_frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.putText(resized_frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)

    # Save the processed frame as an image file
    filename = f"frame_{frame_num:04d}.jpg"
    cv2.imwrite(filename, resized_frame)
    frame_num += 1

# Release the video stream object
cap.release()
