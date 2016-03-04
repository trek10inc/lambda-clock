var AWS = require('aws-sdk');
var CWE = new AWS.CloudWatchEvents();

exports.handler = function(event, context) {
    
    var params = [];
    var params0 = {
      Name: 'LambdaClock_0',
      ScheduleExpression: 'cron(0/5 * ? * MON-SUN *)',
      State: 'ENABLED'
    };
    params.push(params0);
    params.push(JSON.parse(JSON.stringify(params0).replace(/0/g, '1')));
    params.push(JSON.parse(JSON.stringify(params0).replace(/0/g, '2')));
    params.push(JSON.parse(JSON.stringify(params0).replace(/0/g, '3')));
    params.push(JSON.parse(JSON.stringify(params0).replace(/0/g, '4')));
    var end_counter = 0;
    
    params.forEach(function(param)
    {
        CWE.putRule(param, function(err, data) {
          if (err) 
          {
              console.log(err, err.stack);
              context.done();
          }
          else
            {
                var target_params = {
                Rule: param.Name,
                Targets: [ 
                    {
                      Arn: event.function_arn,
                      Id: event.function_id
                    }
                ]}; 
                
                CWE.putTargets(target_params, function(err, data) {
                  if (err)
                  {
                      console.log(err, err.stack);
                      context.done();
                  }
                  else
                  {
                    if(end_counter == 4) context.done();
                    else end_counter += 1;
                  }
                });
            } 
        });
    });
};