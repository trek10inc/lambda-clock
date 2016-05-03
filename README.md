# LambdaClock

##DEPRECATED:

AWS Lambda now allows scheduling a one minute intervals. See [here](http://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-create-function.html).

~~Currently CloudWatch Event Rules can be scheduled at minimum intervals of 5 minutes.~~ At Trek10 we saw the need for a smaller interval, namely 1 minute. This need arose in the specifically context of handling autoscaling within ECS.

## LambdaClock Overview

<center>
![](http://i65.tinypic.com/2nhl3l4.jpg?raw=true)
</center>

There are five CloudWatch Event Rules each of which uses a cron expression for scheduling:

```
0/5 * ? * MON-SUN * // LambdaClock_0
1/5 * ? * MON-SUN * // LambdaClock_1
2/5 * ? * MON-SUN * // LambdaClock_2
...
...
```

Each one of these rules has a target of the LambdaClock function. This leads to the **obvious question**: "If an event triggers each minute why not have the event publish to an SNS topic and be done?" This is how the LambdaClock system began however, we saw inconsistent delays between the CloudWatch Event trigger time and publishing to an SNS topic or invoking a LambdaFunction. The problem might have ended there if the delays were consistentd. Over 4700 Cloud Watch events we saw an **average delay of 25s**. Worse yet some rules consistently invoked LambdaFunctions within 10s while other were regularly over 40s. Thankfully they tended to stay below 60s. 

The solution is simple; a Lambda function *(LambdaClock)* is the target of each CW event rule. LambdaClock calculates the time it must wait until the next minute by comparing the current time and the time the event was triggered. LambdaClock then uses ```setTimeout``` to wait until the 0th second of the next minute at which point it publishes to an SNS topic, which is also named LambdaClock. A second Lambda function was used to analyze the time it took for this SNS topic to invoke a subscribed Lambda, some prelimary results are shown below:

```
Average: 480.76ms
Standard Deviation: 294.57ms
Count: 5013 total invocations (~3.5 days)
Failures: 0 
Within One SD: 4047 
Within Two SD: 942 
Within Three SD: 10 
Beyond Three SD: 14
```

The ultimate goal was to achieve a scheduling period of one and thus far the LambdaClock system seems to be holding up nicely. 

### Getting Started 

Just download the LambdaClock.json file and use it to create a stack through CloudFormation and you'll have your very own LambdaClock SNS topic. Treat it well and don't feed it after midnight ... *works fine after midnight*

### Want to learn more about us? 

Check us out at https://www.trek10.com and don't be afraid to tweet at us https://twitter.com/trek10inc. Let us know what you think.




