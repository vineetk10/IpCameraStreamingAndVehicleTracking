from flask import Flask, jsonify, request, Response
import cv2
import numpy as np
import boto3
import re
import os
import io
from PIL import Image, ImageDraw, ImageFont
os.environ['AWS_ACCESS_KEY_ID'] = 'AKIASDHZS5MOEMCTAE5J'
os.environ['AWS_SECRET_ACCESS_KEY'] = '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'
app = Flask(__name__)

@app.route('/detect_license_plate', methods=['POST'])
def detect_license_plate():
    # Get the image file from the request
    image_file = request.files['image']
    image_bytes = image_file.read()

    # Initialize the Amazon Rekognition client
    rekognition = boto3.client('rekognition', region_name='us-east-2')

    # Call the detect_labels API to detect objects in the image
    '''response = rekognition.detect_labels(Image={'Bytes': image_bytes},MaxLabels=10,MinConfidence=50)

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
            print(t)
            print(text[t])
            lp=text[t]
            t_pre=re.sub(r'\W+', '', t)
            if(len(t_pre)==7 or len(t_pre)==6):
                digits = re.findall(r'\d', t_pre)
                if(len(digits)>=3):
                    license_plate_text+=t_pre
                    break
            #if license_plate['Left'] < text[t]['Left'] < license_plate['Left'] + license_plate['Width'] and license_plate['Top'] < text[t]['Top'] < license_plate['Top'] + license_plate['Height']:
                #license_plate_text += t
                #print(t+"top"+str(text[t]['Top'])+"H"+str(text[t]['Height']))

    regex = r'[A-Z0-9]{2,7}[A-Z0-9]*'
    match = re.search(regex, license_plate_text)
    ans=None
    print(license_plate_text)
    #return license_plate_text

    if(match):
        ans=match.group(0)

    #img = Image.open(image_file)
    #width, height = img.size
    
    #image = cv2.imread(image_file)
    image_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
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
    
        # Convert image to JPEG format and return as response
        #success, img_bytes = cv2.imencode('.jpg', image)
        img_bytes = cv2.imencode('.jpg', image)[1].tobytes()
        return Response(response=img_bytes, status=200, mimetype='image/jpeg')
        

    else:
        return Response(response=image_bytes, status=200, mimetype='image/jpeg')
    

    '''if license_plate:
        # Draw the bounding box around the license plate
        img = Image.open(image_file)
        draw = ImageDraw.Draw(img)
        left = img.width * license_plate['Left']
        top = img.height * license_plate['Top']
        right = left + img.width * license_plate['Width']
        bottom = top + img.height * license_plate['Height']
        draw.rectangle(((left, top), (right, bottom)), outline='red', width=3)

        # Add the license plate text to the image
        font = ImageFont.load_default()
        draw.text((left, bottom + 10), license_plate_text, font=font, fill='red')

        # Save the image to a bytes buffer
        img_buffer = io.BytesIO()
        img = img.convert('RGB')
        img.save(img_buffer, format='JPEG')
        img_bytes = img_buffer.getvalue()
        
        # Return the image bytes as a response
        return Response(response=img_bytes, status=200, mimetype='image/jpeg')
    else:
        return jsonify({'error': 'License plate not found in the image.'}), 400'''

if __name__ == '__main__':
    app.run()

