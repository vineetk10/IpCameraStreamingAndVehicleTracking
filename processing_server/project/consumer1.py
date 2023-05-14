from kafka import KafkaConsumer, TopicPartition

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

# read exactly one message from each partition
for partition in consumer_group.assignment():
    messages = consumer_group.poll(1000, 1)
    if partition in messages:
        for message in messages[partition]:
            print(f"Consumer: {consumer_group.member_id} | Partition: {partition} | Message: {message.value.decode('utf-8')}")

