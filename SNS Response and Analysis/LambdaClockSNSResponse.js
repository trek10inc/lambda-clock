var AWS = require('aws-sdk');

// Change region to match your table's region
options = { "region": "us-east-1" };
var dynamodb = new AWS.DynamoDB.DocumentClient(options);

exports.handler = function(event, context) {
    
    now = new Date();
    time_of_function = String(now.getHours()) + ":" + String(now.getMinutes()) + ":" + String(now.getSeconds()) + ":" + String(now.getMilliseconds());
    
    rule = event.Records[0].Sns.Message.split('+')[0];
    time_of_event = event.Records[0].Sns.Message.split('+')[1];
    
    // Note: There will be one function call at the start of every day where the date of the CW event response function
    // will not match the date of in this function
    date = event.Records[0].Sns.Timestamp.split('T')[0]; 

    console.log("CloudWatch event rule: ", rule);
    console.log("Time CW Event Triggered: ", time_of_event);
    console.log("Time during function execution: ", time_of_function);
    
    // *****
    // Change this params object to match your table and it's indices
    // *****
    var params = {
        TableName:"YOUR_DYNAMODB_TABLE_NAME",
        Item:{
            "SNS_Message_ID": String(event.Records[0].Sns.MessageId), 
            "Date": String(date), 
            "Rule": String(rule),
            "Event_Time": String(time_of_event),
            "Function_Time": String(time_of_function),
            "Error_Message": "No Error"
        }
    };
    
    dynamodb.put(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log("put data to YOUR_DYNAMODB_TABLE_NAME table", data);
      context.done();
    });
    
};