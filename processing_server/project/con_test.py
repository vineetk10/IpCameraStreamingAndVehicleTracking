from kafka import KafkaConsumer, TopicPartition
import threading
import json

def process_frames(message_id):
    # lengthy processing function
    print(f"Processing message {message_id} in thread {threading.current_thread().name}")

# Kafka consumer configuration
KAFKA_BROKER_URL = "localhost:9092"
TOPIC_NAME = "video-frames"
GROUP_ID = "my-group"

# Create Kafka consumers
consumer1 = KafkaConsumer(TOPIC_NAME, group_id=GROUP_ID, bootstrap_servers=KAFKA_BROKER_URL, enable_auto_commit=True, auto_offset_reset="latest")
consumer2 = KafkaConsumer(TOPIC_NAME, group_id=GROUP_ID, bootstrap_servers=KAFKA_BROKER_URL, enable_auto_commit=True, auto_offset_reset="latest")

# Assign partitions to consumers
consumer1.assign([TopicPartition('video-frames', 0)])
consumer2.assign([TopicPartition('video-frames', 1)])

# Define function to run in each thread
def consume_messages(consumer):
    while True:
        messages = consumer.poll(1000)
        for partition in consumer.assignment():
            if partition in messages:
                for message in messages[partition]:
                    message_value = message.value.decode("utf-8")
                    message_id = json.loads(message_value)['message_id']
                    print(f"Partition: {partition} | Message: {message_value}")
                    t = threading.Thread(target=process_frames, args=(message_id,))
                    t.start()

# Start threads to consume messages from each partition
t1 = threading.Thread(target=consume_messages, args=(consumer1,))
t2 = threading.Thread(target=consume_messages, args=(consumer2,))
t1.start()
t2.start()

