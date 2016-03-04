var AWS = require('aws-sdk');

// Change region to match your table's region
options = { "region": "us-east-1" };
var dynamodb = new AWS.DynamoDB.DocumentClient(options);

exports.handler = function(event, context) {

    // *****
    // Change this params object to match your table and it's indices
    // *****
    var params = {
        TableName : 'YOUR_DYNAMODB_TABLE_NAME',
        AttributesToGet: [ 'Function_Time', 'Error_Message' ]
    };

    dynamodb.scan(params, function(err, data) {
        if(err)
        {
           console.log(err); 
           context.done();
        }
        else
        {
            var times = [];
            var sum = 0;
            var count = 0;
            var seconds = 0;
            var ms = 0;
            var failures = 0;
            var max = -1;
            var min = 10000;

            data.Items.forEach(function(item) // HH:MM:SS:000
            {   
                var diff;                       
            
                seconds = item.Function_Time.split(':')[2];
                ms = item.Function_Time.split(':')[3];
                
                if(seconds > 45) // Before the  minute
                {
                    seconds = 60 - seconds*1;
                    diff = (seconds*1000)-ms*1;
                    times.push(diff);
                    count ++;
                    sum += diff;
                }
                else if(seconds < 15) // After or on the minute
                {
                    diff = (seconds*1000)+ms*1;
                    times.push(diff);
                    count ++;
                    sum += diff;
                }
                else // function did not execute within 15 seconds of minute
                {
                    failures ++;
                    return;
                }
                
                if (diff > max) max = diff;
                if (diff < min) min = diff;
            });
            
            var average = sum/count;
            var sqr_mean_diff_sum = 0;
            
            times.forEach(function(time)
            {
                sqr_mean_diff_sum += Math.pow((time - average),2);
            });
            
            var standard_deviation = Math.sqrt(sqr_mean_diff_sum/count);
            
            var one_std = 0;
            var two_std = 0;
            var three_std = 0;
            var beyond_three = 0;
            
            times.forEach(function(time)
              {
                if (Math.abs(time - average) < standard_deviation) one_std += 1;
                else if (Math.abs(time - average) < standard_deviation*2) two_std += 1;
                else if (Math.abs(time - average) < standard_deviation*3) three_std += 1; 
                else beyond_three += 1;
              }
            );
            
            console.log(
                "\n", "--- SNS Response Function ---",
                "\n", "Max", max, "\n",
                "Min", min, "\n",
                "Average", average, "\n",
                "Standard Deviation", standard_deviation, "\n",
                "Count", count, "\n",
                "Failures", failures, "\n",
                "Within One STD", one_std, "\n",
                "Within Two STD", two_std, "\n",
                "Within Three STD", three_std, "\n",
                "Beyond Three STD", beyond_three
            );

            context.done();
        } 
    });
};