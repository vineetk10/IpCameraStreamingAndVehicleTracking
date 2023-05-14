import boto3
import os
from kafka import KafkaConsumer

# set up Kafka consumer
consumer = KafkaConsumer('s3_urls', bootstrap_servers=['localhost:9092'])

# set up S3 client
s3 = boto3.client('s3')

# process each S3 URL from Kafka topic
for message in consumer:
    s3_url = message.value.decode('utf-8')
    print(f"Processing S3 URL: {s3_url}")

    # extract the bucket name and prefix from the S3 URL
    # assuming the URL is of the form: s3://<bucket_name>/<prefix>
    s3_path = s3_url.replace('s3://','')
    bucket_name, prefix = s3_path.split('/', 1)

    # get a list of all objects in the S3 bucket with the specified prefix
    objects = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)['Contents']

    # sort the objects by key (i.e., filename) to ensure they are processed in order
    objects = sorted(objects, key=lambda obj: obj['Key'])

    # process each object in the S3 bucket
    for obj in objects:
        # read the contents of the file into a variable
        file_content = s3.get_object(Bucket=bucket_name, Key=obj['Key'])['Body'].read()

        # process the file contents here
        # ...

        # delete the file from S3
        s3.delete_object(Bucket=bucket_name, Key=obj['Key'])
        print(f"Deleted S3 object: {obj['Key']}")

    # delete the directory from S3
    s3.delete_object(Bucket=bucket_name, Key=prefix[:-1])
    print(f"Deleted S3 directory: {prefix[:-1]}")

