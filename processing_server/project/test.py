import concurrent.futures
import queue
from flask import Flask
from threading import Lock
app = Flask(__name__)
executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)
requests_queue = queue.Queue()
request_lock = Lock()
import time

def process_frame(image_file):
    # your code to process the image frame goes here
    print("SLEEPING")
    time.sleep(10)
    print(image_file+"done")
    print("DONE!!")


def process_queue():
    while True:
        try:
            image_file = requests_queue.get(block=False)
        except request_queue.Empty:
            break
        else:
            executor.submit(process_frame, image_file)

@app.route('/extract_frames', methods=['GET'])
def process_image():
    #requests_queue.put(image_fiile)
    image_url='test'
    with request_lock:
        requests_queue.put(image_url)
    executor.submit(process_queue)
    return "Request received and will be processed soon."

if __name__ == '__main__':
    app.run()

