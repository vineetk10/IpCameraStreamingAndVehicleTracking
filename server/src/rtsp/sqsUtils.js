const AWS = require('aws-sdk');

// Set up AWS credentials
const credentials = new AWS.Credentials({
    accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
});

// Set up the SQS client with the credentials
const sqs = new AWS.SQS({
  region: process.env.SQS_REGION,
  credentials: credentials
});


// Define the queue URL
const queueUrl = process.env.SQS_URL;

const delaySeconds = process.env.DELAY_SECONDS;

const maxMsgsPolled = process.env.MAX_MSGS_POLLED;


exports.sendMessage = (message) => {

    const params = {
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl,
        DelaySeconds: delaySeconds
      };
    
      sqs.sendMessage(params, (err, data) => {
        if (err) {
          console.log('Error sending message:', err);
        } else {
          console.log('Message sent:', data.MessageId);
        }
      });
}


exports.receiveMessage = (callback) => {
    const receiveParams = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxMsgsPolled,
        // VisibilityTimeout: 60,
        //WaitTimeSeconds: 20       
    };

    sqs.receiveMessage(receiveParams, (err, data) => {
        if (err) {
          console.log('Error receiving messages:', err)
          callback(err);
        } else if (data.Messages) {
          console.log('Received', data.Messages.length, 'messages');
          callback(null, data.Messages);
        }
    })
}


exports.deleteMessage = (receipt) => {
    const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };

    sqs.deleteMessage(deleteParams, (err, data) => {
        if (err) {
          console.log('Error deleting message:', err);
        } else {
          console.log('Message deleted:', data);
        }
    });
}




