## Dispatched ##

Dispatched is an app for mapping and visualizing emergency call data from the San Fransisco police department. This web app is my submission for the Capital One Software Engineering Summit.

To create this app I made extensive use of Javascript for graphing and mapping interesting features of the given dataset. The site also makes use of the following frameworks:
* [D3.js](https://d3js.org/) for parsing CSV data
* [Google Maps API](https://developers.google.com/maps/) to create maps and find addresses,
* [Chart.js](http://www.chartjs.org/) for drawing a variety of graphs

## Site Outline ##
This site was designed to meet the following deliverables:

 1.  *Data Visuals: Display or graph 3 metrics or trends from the data set that are interesting to you.*
The data page opens with a slideshow style menu that can be manually controlled to show three different graphs highlighting trends in traffic accidents that occur late at night. These graphs highlight the days of the week on which the most accidents occur, the hours during which the most accidents occur, and the districts in which the most accidents occur. These graphs were designed to inform users of how best to handle travel during the night.

*2.  Given an address and time, what is the most likely dispatch to be required?*
The map page opens with input fields for an ​address and a time. After the user provides a valid address and time, the site determines the type of the response unit that is most likely to be needed at the time and address provided. The site then graphs the five most probable vehicle types needed, and can also be navigated to show the full list of probabilities for every unit type.

*3.  Which areas take the longest time to dispatch to on average? How can this be reduced?*
The button on the data page labeled "Response Times" provides statistics on the average dispatch time for each supervisor district. The page has a horizontal bar graph to show the average dispatch time for each district. From this graph, it is clear that districts 6 and 7 have the longest dispatch times. The page also contains a table showing which unit types are most frequently called upon in districts 6 and 7, and concludes with a solution for how to reduce the response times in these districts.

It also contains all the provided bonus features:

 *1. Heat maps: Add heat maps that show dispatch frequency, urgency over the city.*
The button on the maps page labeled "Heat Map" draws a heatmap over the region around the inputted address. The heatmap is generated using each call as a point. These points are also weighted by the final urgency of the call.

 *2. Crime correlation: Based on the type of dispatch and the frequency of dispatch, show the most calm and safe neighborhoods in the city.*
The button on the maps page labeled "Safety Map" generates circles highlighting the area around which the majority of calls occur in each district. The circles also ignore medical incidents so that they highlight only alarms, fires, traffic accidents, and other events that would make a neighborhood disruptive and unsafe.

 *3.  Preparing for the future: Which areas are experiencing the greatest increase in dispatch calls? Where and what type of dispatch service would you place to help with the rate of increasing calls?*
The button on the data page labeled "Call Frequencies" visualizes the change in daily calls for each district. It graphs the districts that experienced a positive increase in calls over the time interval the provided data was taken. It also provides a map showing where the average call of any types occurs.

## Author ##
This application was created by Adam Schueller. If you have any questions feel free to email me at as174@rice.edu.