var AWS = require('aws-sdk');
var sns = new AWS.SNS();
exports.handler = function(event, context) {
    var publish = function(SNS_params) 
    {
        sns.publish(SNS_params, function(err, data) 
        {
            if (err) console.log(err, err.stack); 
            else 
            {
                var published_seconds = new Date().getSeconds();
                console.log('Published to SNS at:', published_seconds, 'seconds');
            }
            context.done();
        });
    }
    now = new Date();
    time_of_function = String(now.getHours()) + ':' + String(now.getMinutes()) + ':' + String(now.getSeconds());
    function_seconds = now.getMinutes()*60 + now.getSeconds()*1;
    
    time_of_event = event.time.split('T')[1].replace(/Z/g, '');
    date = event.time.split('T')[0];

    event_seconds = time_of_event.split(':')[1]*60 + time_of_event.split(':')[2]*1;
    time_difference = function_seconds - event_seconds;

    rule = event.resources[0].split('/')[1]

    console.log('Event Triggered At: ', time_of_event);
    console.log('Function Running At: ', time_of_function);
    console.log('Time Elapsed: ', time_difference);
    console.log('Associated Rule: ', rule);

    var message = String(rule) + '+' + String(time_of_event);
    var SNS_params = {
      Message: message,
      TargetArn: 'SNS topic ARN goes here' // Change this line
    };

    now_seconds = new Date().getSeconds(); now_seconds = now_seconds*1;
    if (time_difference <= 55 && now_seconds <= 55) 
    {
        delay = (59 - now.getSeconds()*1)*1000;
        setTimeout(function() { publish(SNS_params); }, delay);
    }
    else
    {
        console.log('Time Difference Too Great: No Publish to SNS Topic ');
        context.done();
    }
};