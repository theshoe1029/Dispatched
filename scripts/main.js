//************************************************************// 
//CREATED BY ADAM SCHUELLER IN 2018                           //
//************************************************************//


////////////////////////////////////////////////////
///GLOBAL VARIABLES                              ///
////////////////////////////////////////////////////


//Initialize map and map overlays
var map,heatmap,markers;
//Store the inputted coordinates and time
var inputLat,inputLng,inputTime;

//************************************************//
//SWITCHES FOR SHOWING AND HIDING ELEMENTS        //
//************************************************//

var predictionSwitch = false;
var heatmapSwitch = false;
var safetySwitch = false;
var graphPrediction = true;

var menu = document.getElementById("menu");
var intro = document.getElementById("intro");
var optimalServicesMap = document.getElementById("optimalServicesMap");
var wrapper = document.getElementById("wrapper");
var cookie = document.cookie;

//************************************************//
//ELEMENTS ON INDEX PAGE                          //
//************************************************//

//Get buttons for selecting map
var dispatch = document.getElementById("dispatch");
var heatMap = document.getElementById("heatMap");
var safetyMap = document.getElementById("safetyMap");

//Get elements for address and time submission
var address =  document.getElementById("address");
var timer = document.getElementById("timer");
var submit = document.getElementById("submit");

//Get containers for error messages
var timeError = document.getElementById("timeError");
var badAddress = document.getElementById("badAddress");

//Get containers for text below map
var dispatchInfo = document.getElementById("dispatchInfo");
var heatDescription = document.getElementById("heatDescription");
var safeDescription = document.getElementById("safeDescription");
var moreInfo = document.getElementById("moreInfo");

//************************************************//
//ELEMENTS ON DATA PAGE                           //
//************************************************//

var slideIndex = 1;
var avgTimeGraph = document.getElementById("avgDispatchTime");
var dataVisualizationButton = document.getElementById("dataVisualizationButton");
var responseTimesButton = document.getElementById("responseTimesButton");
var callFrequenciesButton = document.getElementById("callFrequenciesButton]");
var visualization = document.getElementById("visualization");
var responseTimes = document.getElementById("responseTimes");
var callFrequencies = document.getElementById("callFrequencies");


////////////////////////////////////////////////////
///INITIALIZATION FUNCTIONS                      ///
////////////////////////////////////////////////////


//************************************************//
//CONTROL INTRO ANIMATION                         //
//************************************************//

//Play intro animation the first time a user visits the site
function playIntro(){  
  console.log("/*CREATED BY ADAM SCHUELLER IN 2018*/");
  //If the user has not visited the site, animate the intro page
  if(cookie != 'played=true'){
    var img = document.getElementById("introLogo")
    var header = document.getElementsByTagName("h2");
    var text = document.getElementsByTagName("p");
    menu.style.display = "none";
    introLogo.style.opacity = 1;
    header[0].style.opacity = 1;
    text[0].style.opacity = 1; 
    text[1].style.opacity = 1;
    document.cookie = "played=true";
  }
  //If the user has visited the site skip the intro
  else{            
    intro.hidden = true;
    menu.hidden = false;
    wrapper.hidden = false;
    menu.style.display = "flex";
  }
}

//End the intro once a key is pressed
var fired = false;

document.onkeydown = function() {
    if(!fired) {
        fired = true;
        intro.hidden = true;
        menu.hidden = false;
        wrapper.hidden = false;
        menu.style.display = "flex";
    }
};

document.onkeyup = function() {
    fired = false;
};


////////////////////////////////////////////////////
///FUNCTIONS FOR INDEX PAGE                      ///
////////////////////////////////////////////////////


//************************************************//
//INITIALIZATION FUNCTIONS FOR WHEN THE PAGE LOADS//
//************************************************//

//JQuery function that sets the timer to the current time
//when the page loads
$(function(){  
  $('input[type="time"][id="timer"]').each(function(){    
    var d = new Date(),        
        h = d.getHours(),
        m = d.getMinutes();        
    if(h < 10) h = '0' + h; 
    if(m < 10) m = '0' + m; 
    $(this).attr({
      'value': h + ':' + m
    });
  });
}); 

//Function that runs when the page loads that initializes
//the google map
function initialize(points) {
  //Initialize global map and heatmap using the inputted points
  //for the heatmap
  initMap(points);

  //Autocomplete input in the address input textbox
  initAutocomplete();

  //Turn the heatmap off
  toggleHeatmap();
}

//Function that hides the map options when the address input box
//is clicked
function hideButtons(){
  dispatch.hidden = true;
  heatMap.hidden = true;
  safetyMap.hidden = true;
}

//This function intializes the gogole map and applies a 
//heatmap layer
function initMap(points){
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 13,
    mapTypeId: 'roadmap'
  });

  heatmap = new google.maps.visualization.HeatmapLayer({    
    data: points,
    map: map
  });
}

//Function from https://developers.google.com/maps/documentation/javascript/examples/places-searchbox to
//autocomplete the address input
function initAutocomplete() {
  // Create the search box and link it to the UI element.
  var input = document.getElementById('address');
  var searchBox = new google.maps.places.SearchBox(input);  

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));      

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}   

//Function that stores the address in a global variable and checks that the
//time input has been correctly filled out
function submitAddress(){
  //Get the latitude and longitude of the location entered by the user and
  //store them globally
  var homeMarker = markers[0] 
  inputLat = homeMarker.getPosition().lat();
  inputLng = homeMarker.getPosition().lng(); 

  //Iterate through all data entries to ensure that the inputted address is within
  //the maximum and minimum latitude and longitude in the data entries
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {  
    //Initialize min and max values for latitude and longitude     
    var minLat = parseFloat(data[0].latitude);
    var maxLat = parseFloat(data[0].latitude);
    var minLng = parseFloat(data[0].longitude);
    var maxLng = parseFloat(data[0].longitude);

    //Iterate over all inputted values to find the min and max latitude and longitude
    for(i=0; i<data.length; i++){
      if (data[i].latitude > maxLat)maxLat = parseFloat(data[i].latitude);
      if (data[i].latitude < minLat)minLat = parseFloat(data[i].latitude);
      if (data[i].longitude > maxLng)maxLng = parseFloat(data[i].longitude);
      if (data[i].longitude < minLng)minLng = parseFloat(data[i].longitude);
    }

    //If the address is within the acceptable range check if the time is also valid
    if (minLat < inputLat && inputLat < maxLat && minLng < inputLng && inputLng < maxLng){    
      //If the time is within an acceptable range show the different map options and hide previous 
      //error messages
      if (timer.value != ''){
        //Show the different buttons for map options    
        dispatch.hidden = false; 
        heatMap.hidden = false;  
        safetyMap.hidden = false; 

        //Hide previous error messages
        badAddress.hidden = true;
        timeError.hidden = true;

        //Store the inputted time in minutes as a global variable
        var inputHour = parseInt(timer.value[0] + timer.value[1]);
        var inputMin = parseInt(timer.value[3] + timer.value[4]);
        inputTime = (inputHour)*60 + inputMin; 
      }
      //If the time is not valid show an error and clear the time input field
      else{    
        timeError.hidden = false;
        timeError.innerHTML="Please enter a valid time";
        timer.value=null;
      }
    }
    //If the address is outside the acceptable range show an error
    else{
      badAddress.hidden = false;      
    }
  });
}

//************************************************************//
//HELPER FUNCTIONS FOR MAKING AND SHOWING PREDICTIONS         //
//************************************************************//

//Function to convert timestamps into an associative array of values
function convertTimestamp(timestamp){
  var time = {};
  time['year'] = timestamp.slice(0,4);
  time['month'] = timestamp.slice(5,7);
  time['day'] = timestamp.slice(8,10);
  time['hour'] = parseFloat(timestamp.slice(11,13));
  time['minute'] = parseFloat(timestamp.slice(14,16));
  time['seconds'] = parseFloat(timestamp.slice(17,19));
  time['partial_seconds'] = parseFloat(timestamp.slice(20,27));

  return time;
}

//Function that returns the day of the week based on an inputted
//javascript date
function dayOfWeek(day){
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[day];
}

//Calculate the distance between two latitude and longitude points
function calculateDistance(lat1,lng1,lat2,lng2){
  var R = 6371e3; // metres
  var angle1 = lat1 * Math.PI / 180;
  var angle2 = lat2 * Math.PI / 180;
  var deltaAngle = (lat2-lat1) * Math.PI / 180;
  var deltaLambda = (lng2-lng1) * Math.PI / 180;

  var a = Math.sin(deltaAngle/2) * Math.sin(deltaAngle/2) +
          Math.cos(angle1) * Math.cos(angle2) *
          Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;          
}

//Function to sort an associative array
function sortAssociativeArray(arr){
  //Store the values in the associative array in a standard array
  //and sort the standard array
  var sortedOutput = {};
  var sortedValues = [];
  for (var key in arr){
    sortedValues.push(arr[key]);
  }
  sortedValues = sortedValues.sort(function(a, b){return b-a});

  //Pair all the keys with their values in the sorted array
  for (i=0;i<sortedValues.length;i++){
    for (var key in arr){        
      if (arr[key] == sortedValues[i]){
        sortedOutput[key] = sortedValues[i];
      }
    }
  }
  return sortedOutput;
}

//******************************************************************//
//FUNCTIONS TO CONTROL REPRESENTING THE DISPATCH PREDICTION         //
//******************************************************************//

//Function called when the more info button is pressed that hides the 
//graph and displays the full prediction statistics
function info(){
  graphPrediction = !graphPrediction;
  showPredictionGraph();
}

//Function called when the display prediction button is pressed that toggles 
//between showing and hiding the graph
function prediction(){
  predictionSwitch = !predictionSwitch;
  showPredictionGraph();
}

//Function that visualizes or destroys the graph of predictions
function drawPredictionGraph(predictions, destroy){
  var ctx = document.getElementById("chart").getContext('2d');  

  //Convert the associative array of prediction percentages to label and data 
  //arrays that can be graphed
  var predictionLabels = [];
  var predictionData = [];
  for (var key in predictions){
    predictionLabels.push(key);
    predictionData.push(predictions[key]);
  }

  Chart.defaults.global.defaultFontSize = 10;
  //Create a bar chart containing the top five predictions
  var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: predictionLabels.splice(0,5),
            datasets: [{
                label: '% chance of dispatch needed (top 5)',
                data: predictionData.splice(0,5),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    fontSize: 12,
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
  });
  //Destroy the graph by removing it's div and then adding a new empty canvas
  if(destroy){
    $('#chart').remove();    
    $('#wrapper').append('<canvas id="chart" height="350" hidden="true"><canvas>');
    if(predictionSwitch==false){
      $('#moreInfo').remove();
      $('#infoContainer').remove();
      $('#wrapper').append('<div id="infoContainer"><input type="button" id="moreInfo" value="More Info" hidden="true" onclick="info()"></div>');
    }
  }
  //If the graph is not supposed to be destroyed remove the moreInfo button and add it again so that
  //it is below the graph
  else{
    $('#dispatchInfo').empty();
    $('#moreInfo').remove();
    $('#infoContainer').remove();
    $('#wrapper').append('<div id="infoContainer"><input type="button" id="moreInfo" value="More Info" onclick="info()"></div>');
  }
}

//This function reads the inputted dataset and based on the time and location
//predicts which dispatch is most likely to be required
function showPredictionGraph(){  
  //Get the container for the map
  var map = document.getElementById("map"); 
  //Get the container containing the full prediction statistics
  var moreInfo = document.getElementById("moreInfo");

  var probability = {};
  var sumOfScores = 0;
 
  //Read the csv dataset
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {  
    //Iterate over each entry in the dataset           
    for(i=0; i<data.length; i++){    
      //Store the entry time of the current entry in minutes
      var entryHour = parseInt(convertTimestamp(data[i].received_timestamp).hour);
      var entryMin = parseInt(convertTimestamp(data[i].received_timestamp).minute);
      var entryTime = (entryHour)*60 + entryMin; 

      //Store the entry latitude and longitude
      var entryLat = parseFloat(data[i].latitude);
      var entryLng = parseFloat(data[i].longitude);   

      //Store the type of the entry
      var type = (data[i].unit_type);

      //Calculate the distance from the inputted location to the entry
      var d = calculateDistance(inputLat,inputLng,entryLat,entryLng);          

      //Initialize timeAdjust so that the probability of the entry type increases the closer
      //the inputted time is to the entry time
      if (inputTime == entryTime){
        var timeAdjust = 1;
      }
      else{
        var timeAdjust = (inputTime/(Math.abs(inputTime-entryTime)));
      }
      //Initialize distAdjust so that the probability of the entry type increases the closer the 
      //inputted distance is to the entry distance
      var distAdjust = 1/d;

      //Recalculate the sum of probability scores for the entry type
      if (type in probability){
        probability[type] += distAdjust*timeAdjust;
        sumOfScores += distAdjust*timeAdjust;
      }
      else{
        probability[type] = distAdjust*timeAdjust;
        sumOfScores += distAdjust*timeAdjust;
      }          
    }    
    //Calculate the probability of each call type in the dataset
    for (var key in probability){
      probability[key] = (probability[key]/sumOfScores)*100;                    
    } 

    probability = sortAssociativeArray(probability);        

    //Display the prediction in either graph or text form
    if (predictionSwitch){
      dispatch.value = "Hide Dispatch Statistics";

      //Shrink the map to show the graph
      if (badAddress.hidden) map.style.height="30%";  

      //Hide the input fields
      address.hidden = true;
      timer.hidden = true;
      submit.hidden = true; 

      //Disable the other maps to avoid errors
      heatMap.disabled = true;
      safetyMap.disabled = true;
      moreInfo.hidden = false;

      //If graphPrediction is true display the graph and hide 
      //any extra information
      if(graphPrediction){
        drawPredictionGraph(probability, false);
        dispatchInfo.hidden = true;
      }
      //Otherwise destroy the graph and show a full list of probabilities
      else{
        moreInfo.value = "Less Info";

        //Destroy the graph
        drawPredictionGraph(probability, true);

        //Add each type and its probability as a new paragraph to the dispatchInfo div element
        var probabilityString = '';

        for (var key in probability){
          probabilityString = key + ': ' + String(probability[key]).substr(0,6) + '% chance of dispatch';
          $('#dispatchInfo').append('<p>' + probabilityString + '</p>');
        }

        //Show the extra info
        dispatchInfo.hidden = false;        
      }
    }
    //Hide the prediction and reset the map size
    else{  
      dispatch.value = "Dispatch Statistics";
      badAddress.hidden = true; 

      //Reset the map size      
      map.style.height="60%";

      //Show all the input fields
      address.hidden = false;
      timer.hidden = false;
      submit.hidden = false;

      //Enable all map options
      heatMap.disabled = false;
      safetyMap.disabled = false;

      //Hide the full info div and button
      moreInfo.hidden = true;
      dispatchInfo.hidden = true;

      //Destroy the graph
      drawPredictionGraph(probability, true);
    }   
  }); 
}

//******************************************************************//
//FUNCTIONS TO GENERATE AND TOGGLE THE HEATMAP                      //
//******************************************************************//

//Function to show and hide the heatmap
function toggleHeatmap() {  
  heatmap.setMap(heatmap.getMap() ? null : map);  
}

//Use the dataset to generate a heatmap using each dispatch request and the
//urgency of the request
function setHeatmap() {    
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) { 
    //Iterate through all entries in the dataset and add them to the heatmap
    //with a weight equal to the final priority of the call
    var points = new Array(data.length);
    for (i=0;i<data.length;i++){     
      var urgency = parseInt(data[i].final_priority);
      var dataLat = data[i].latitude;
      var dataLng = data[i].longitude; 
      var loc = {location: new google.maps.LatLng(dataLat, dataLng), weight: urgency};
      points[i] = loc;     
    }    
    initialize(points);            
  });
}

//Function that shows and hides input options when the heatmap display button
//is clicked
function displayHeatmap(){  
  heatmapSwitch = !heatmapSwitch;
  if (heatmapSwitch){    
    heatMap.value = "Hide Heat Map";
    heatDescription.hidden = false;

    //Zoom out to provide a better view of the heatmap
    map.setZoom(map.getZoom()-3);

    //Hide the address and time inputs
    address.hidden = true;
    timer.hidden = true;
    submit.hidden = true;

    //Disable the other map options
    dispatch.disabled = true;
    safetyMap.disabled = true;
  }
  else{
    heatMap.value = "Heat Map";
    heatDescription.hidden = true;

    //Reset the zoom
    map.setZoom(map.getZoom()+3); 

    //Show the address and time inputs
    address.hidden = false;
    timer.hidden = false;
    submit.hidden = false;

    //Enable the other map options
    dispatch.disabled = false;
    safetyMap.disabled = false;
  }
  //Toggle view of the heatmap
  toggleHeatmap();
}

//******************************************************************//
//FUNCTIONS FOR DETERMINING AND VISUALIZING THE SAFEST AREAS        //
//******************************************************************//


//Function to generate circles over the least safe areas
function generateCircles(){
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {
    var districtLocations = {};
    var districtEntries = {};
    var dimensions = {};

    //This loop sums the coordinates of all non-medical calls in each district so that
    //the average location of a call can be determined for each district
    for(i=0; i<data.length; i++){
      var district = data[i].supervisor_district;
      var entryLat = parseFloat(data[i].latitude);
      var entryLng = parseFloat(data[i].longitude);
      var callType = data[i].call_type;
                                    
      if (callType != 'Medical Incident'){          
        if(district in districtLocations){                            
            districtLocations[district]['lat'] += entryLat;
            districtLocations[district]['lng'] += entryLng;
            districtEntries[district] += 1;  
        } 
        else{
            districtLocations[district] = {'lat':entryLat,'lng':entryLng};          
            districtEntries[district] = 1;            
        } 
      }
    }
    
    //Calculate the average call location to find the center of the circle for that district
    var optimalLat = {};
    var optimalLng = {};
    for (var district in districtLocations){
      optimalLat[district] = districtLocations[district]['lat']/parseFloat(districtEntries[district]);
      optimalLng[district] = districtLocations[district]['lng']/parseFloat(districtEntries[district]);  
    }

    //Calculate the average distance from a call to the center of the circle for each district
    //to find the radius of the circle for that district
    var distanceFromOptimal = {}    
    var radius = {}
    for (i=0; i<data.length; i++){
      var district = data[i].supervisor_district;
      var entryLat = parseFloat(data[i].latitude);
      var entryLng = parseFloat(data[i].longitude);
      var callType = data[i].call_type;
                                    
      if (callType != 'Medical Incident'){          
        if(district in distanceFromOptimal){                            
            distanceFromOptimal[district] += calculateDistance(entryLat,entryLng,optimalLat[district],optimalLng[district]);           
        } 
        else{
          distanceFromOptimal[district] = calculateDistance(entryLat,entryLng,optimalLat[district],optimalLng[district]);                     
        } 
      }
    }
     
    //Store the circles for each district in an array so that they can be drawn     
    var circles = [];
    for (var district in districtLocations){
      var circle = {};
      circle["center"] = {'lat':optimalLat[district],'lng':optimalLng[district]};
      circle["radius"] = (distanceFromOptimal[district]/districtEntries[district]);
      circles.push(circle)  
    }    

    displaySafest(circles);
  });
}

//Function to draw the inputted circles
function displaySafest(circles){
  safetySwitch = !safetySwitch;

  if (safetySwitch){    
    //Zoom out and hide all other input fields
    map.setZoom(map.getZoom()-5);
    safeDescription.hidden = false;    
    address.hidden = true;
    timer.hidden = true;
    submit.hidden = true;

    //Disable the other map options
    dispatch.disabled = true;
    heatMap.disabled = true;
    safetyMap.value = "Hide Safest Areas";

    //Iterate over each inputted circle and draw them on the map
    for(i=0; i<circles.length; i++){
      var cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: circles[i].center,
        radius: circles[i].radius
      });
      markers.push(cityCircle);
    }
  }
  else{    
    //Show the other inputs and hide the safety map description
    map.setZoom(map.getZoom()+5);
    safeDescription.hidden = true;    
    address.hidden = false;
    timer.hidden = false;
    submit.hidden = false;

    //Destroy the circles on the map
    for (var i in markers){
      markers[i].setMap(null);
    }

    //Enable the other map options
    dispatch.disabled = false;
    heatMap.disabled = false;
    safetyMap.value = "Safest Areas";  
  }
  //Refresh the map to show the change in the circles
  google.maps.event.trigger(map, 'resize');
}


////////////////////////////////////////////////////
///FUNCTIONS FOR DATA PAGE                       ///
////////////////////////////////////////////////////


//************************************************//
//INITIALIZATION FUNCTIONS FOR WHEN THE PAGE LOADS//
//************************************************//

//Draw graphs for data page
function drawData(){
  //Select which of the three crash data graphs to show
  selectGraphVisual(slideIndex);  
  //Graph crash data
  generateWeekdayCrashes();
  generateDistrictCrashes();
  generateHourlyCrashes();

  //Graph the average response times
  generateAvgGraph();
  //Graph call frequency trends
  generateFrequencyGraph();
}

//Function to create a map to show the optimal locations for placing additional units
function dataPageMap(){ 
  optimalServicesMap = new google.maps.Map(document.getElementById('optimalServicesMap'), {
    center: {lat: 37.7749, lng: -122.4194},
    zoom: 12,
    mapTypeId: 'roadmap'
  });
}

//********************************************//
//FUNCTIONS TO VISUALIZE CRASH DATA           //
//********************************************//

//Control for choosing which crash data graph to show
function shiftGraph(n){
  selectGraphVisual(slideIndex += n);
}

//Display the chosen graph
function selectGraphVisual(n){
  var i;
  var x = document.getElementsByClassName("dataVisualization");
  var analysis = document.getElementsByClassName("visualizationAnalysis");

  //Hide all graphs and analysis paragraphs other than the selected one
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";
     analysis[i].style.display = "none";  
  }    

  //Show the selected graph and accompanying analysis
  x[slideIndex-1].style.display = "block";
  analysis[slideIndex-1].style.display = "block";
}

//Generate a graph showing how many crashes occur late at night
//on each weekday
function generateWeekdayCrashes(){
  var counts = {};  
 
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {    
    for(i=0; i<data.length; i++){
      var receivedTime = data[i].received_timestamp;
      var hour = convertTimestamp(receivedTime).hour;
      var modifiedTimesamp = convertTimestamp(receivedTime).month + '/' + convertTimestamp(receivedTime).day + '/' + convertTimestamp(receivedTime).year;            
      var call_type = data[i].call_type;
      
      //Find the day of the week for the current entry
      var date = new Date(modifiedTimesamp);  
      var dayCount = date.getDay();
      var weekday = dayOfWeek(date.getDay());      

      //Add to the count if the current entry is a collision that occured late at night
      if((hour <= 4 || hour >= 22) && call_type == "Traffic Collision"){           
        if (dayCount in counts){
          counts[dayCount] += 1;
        }
        else{
          counts[dayCount] = 1;
        }  
      }
    } 
    
    //Sort the array of counts so that they are displayed in the order of
    //the days of the week    
    var sortedCount = {}
    for(i=0; i<7; i++){      
      var weekday = dayOfWeek(i);
      sortedCount[weekday] = 0;
      for(var key in counts){
        if(key == i){
          sortedCount[weekday] = counts[i];
        }
      }
    }
    
    //Graph the counts
    showWeekdayCrashes(sortedCount);                
  });   
}

//Create a line graph of the number of crashes that occur on each day of the week
function showWeekdayCrashes(sortedCount){  
  var points = []
  var days = []
  for (var day in sortedCount){
    points.push(sortedCount[day]);
    days.push(day);
  }  
  var ctx = document.getElementById("weekdayCrashes").getContext('2d');
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
          label: 'Traffic Collisions Between 10pm and 4am',
          data: points,
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
              'rgba(255,99,132,1)'
          ],
          borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{                  
            ticks: {
                beginAtZero:true
            }
        }]
      }
    }
  });
}

//Generate a graph showing which districts have the most crashes
function generateDistrictCrashes(){
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {  
    var counts = {}       
    for(i=0; i<data.length; i++){              
      var district = data[i].supervisor_district;
      var call_type = data[i].call_type;
      var timestamp = data[i].received_timestamp;
      var hour = convertTimestamp(timestamp).hour;

      //Count all the crashes that occur in each district between 10pm and 4am
      if((hour <= 4 || hour >= 22) && call_type == "Traffic Collision"){       
        if (district in counts){
          counts[district] += 1;
        }
        else{
          counts[district] = 1;
        }   
      }  
    }          
    //Graph the counts
    showDistrictCrashes(counts);       
  });
}

//Create a bar graph of the number of crashes that occur in each district
function showDistrictCrashes(accidentCounts){
  var ctx = document.getElementById("crashDistricts").getContext('2d');  

  //Convert the associative array of counts to label and data 
  //arrays that can be graphed
  var labels = [];
  var data = [];
  for (var key in accidentCounts){
    labels.push("District " + key);
    data.push(accidentCounts[key]);
  }

  var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Traffic Collisions by District from 10pm to 4am',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{                    
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
  });
}

//Generate a graph showing the hour when crashes occur late at night
function generateHourlyCrashes(){
  var crashes = {};  
 
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {    
    for(i=0; i<data.length; i++){
      var receivedTime = data[i].received_timestamp;      
      var hour = convertTimestamp(receivedTime).hour;
      var call_type = data[i].call_type;

      //Count all the crashes that occur within 10pm and 4am and map the count
      //to the hour when the crash occured
      if((hour <= 4 || hour >= 22) && call_type == "Traffic Collision"){           
        if (hour in crashes){
          crashes[hour] += 1;
        }
        else{
          crashes[hour] = 1;
        }  
      }
    }      
    //Graph the counts
    showHourlyCrashes(crashes);                
  });   
}

//Generate a line graph showing the number of crashes that occur by hour
function showHourlyCrashes(crashCount){
  crashes = []
  hours = []
  currentHour = 22;

  //Create labels for times from 10pm to 4am
  while(currentHour != 5){
    //If the hour has reached 24 set it to 0 for am  
    var hourLabel;   
    if(currentHour == 24){
      currentHour = 0;
    }

    //Give each time a label based on wether it occurs in the am or pm
    if(currentHour > 12){
      hourLabel = String(currentHour-12) + ':' + '00 PM';
    }
    else if(currentHour == 0){
      hourLabel = "12:00 AM";
    }
    else{
      hourLabel = String(currentHour) + ':' + '00 AM';
    }

    //Store the new label and the crash count in arrays so they can be graphed
    crashes.push(crashCount[currentHour]);
    hours.push(hourLabel);
    //Increment the current hour
    currentHour++;    
  }  

  var ctx = document.getElementById("hourlyCrashTrend").getContext('2d');
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{          
          label: 'Traffic Collisions Between 10pm and 4am',
          data: crashes,
          backgroundColor: [
              'rgba(54, 162, 235, 0.2)'
          ],
          borderColor: [
              'rgba(54, 162, 235, 0.2)'
          ],
          borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{                  
            ticks: {
                beginAtZero:true
            }
        }]
      }
    }
  });
}

//********************************************************//
//FUNCTIONS TO GRAPH THE AVERAGE RESPONSE TIME            //
//********************************************************//

//Calculate how long it took in minutes for a call to get a response
function getResponseTime(start,end){
  var startTimes = convertTimestamp(start);
  var endTimes = convertTimestamp(end);
  
  //Calculate the total start and end times in seconds
  var totalStart = (startTimes.hour*3600) + (startTimes.minute*60) + startTimes.seconds + (startTimes.partial_seconds*1000000)
  var totalEnd = (endTimes.hour*3600) + (endTimes.minute*60) + endTimes.seconds + (endTimes.partial_seconds*1000000)

  if (startTimes.day != endTimes.day){
    totalEnd += (24*3600);
  }

  //If the call took more than an hour calculate the number of hours it took
  if((totalEnd-totalStart)>3600){
    var hours = ((totalEnd-totalStart) - (totalEnd-totalStart)%3600)/3600; 
  }
  else{
    var hours = 0;
  }
  //If the call took more than a minute calculate the number of minutes it took
  if((totalEnd-totalStart)>60){ 
    var minutes = ((totalEnd-(hours*3600)-totalStart)-(totalEnd-(hours*3600)-totalStart)%60)/60; 
  }
  else{
    var minutes = 0;
  }
  //Calculate seconds as the end time minus the hours and minutes previously calculated
  var seconds = (totalEnd-(hours*3600)-(minutes*60)-totalStart); 

  //Return the response time in minutes
  return (hours*60)+minutes+(seconds/60.0);
}

//Generate a graph of how long the average call takes to respond to
function generateAvgGraph(){
  var sums = {};
  var count = {};
  var graph = {};
  var unitsNeeded = {'6':{}, '7':{}};

  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {             
    for(i=0; i<data.length; i++){
      var receivedTime = data[i].received_timestamp;
      var onSiteTime = data[i].dispatch_timestamp;    
      var neighborhood = (data[i].supervisor_district);        
      var unit_type = data[i].unit_type;
      var timeElapsed = getResponseTime(receivedTime,onSiteTime);            

      //Count how many units neighborhoods 6 and 7 need as they have the longest
      //response times
      if(neighborhood == 7 || neighborhood == 6){            
        if(unit_type in unitsNeeded[neighborhood]){
          unitsNeeded[neighborhood][unit_type] += 1;
        }
        else{                    
          unitsNeeded[neighborhood][unit_type] = 1;
        }
      }      

      //Sum the total response times for each neighborhood so they can be averaged
      //later
      if (neighborhood in sums){
        sums[neighborhood] += timeElapsed;
        count[neighborhood] += 1;
      }
      else{
        sums[neighborhood] = timeElapsed;
        count[neighborhood] = 1;
        graph[neighborhood] = null;                               
      }      
    }

    //Calculate the average response time for each district
    for (var key in sums){
      graph[key] = sums[key]/count[key];                    
    }
    
    unitsNeeded['6'] = sortAssociativeArray(unitsNeeded['6']);
    unitsNeeded['7'] = sortAssociativeArray(unitsNeeded['7']);

    //Generate a table showing how many of each type of unit districts 6 and 7 use to show which
    //ones they need
    var tableHeaders = ["DISTRICT"];
    var d6Elements = ["District 6"];
    var d7Elements = ["District 7"];
    for (var key in unitsNeeded['6']){
      tableHeaders.push(String(key));
      d6Elements.push(unitsNeeded['6'][key]);
    }    
    for (var key in unitsNeeded['7']){
      d7Elements.push(unitsNeeded['7'][key]);
    }

    tableHeaders = tableHeaders.splice(0,8);
    d6Elements = d6Elements.splice(0,8);
    d7Elements = d7Elements.splice(0,8);

    for (i=0; i<tableHeaders.length; i++){
      if (i==1 || i==2){
        $('#titles').append('<th style="color: black; background-color: lightgreen;">' + tableHeaders[i] + '</th>');
      }
      else{
        $('#titles').append('<th>' + tableHeaders[i] + '</th>');
      }
    }
    for (i=0; i<d6Elements.length; i++){
      if (i==1 || i==2){
        $('#d6').append('<td style="color: black; background-color: lightgreen;">' + d6Elements[i] + '</td>');
      }
      else{
        $('#d6').append('<td>' + d6Elements[i] + '</td>');
      }
    }
    for (i=0; i<d7Elements.length; i++){
      if (i==1 || i==2){
        $('#d7').append('<td style="color: black; background-color: lightgreen;">' + d7Elements[i] + '</td>');
      }
      else{
        $('#d7').append('<td>' + d7Elements[i] + '</td>');
      }
    }

    //Graph the average response time
    graphAverages(graph);
  }); 
}

//Create a bar graph of the average response time for each district
function graphAverages(averages){
  var ctx = document.getElementById("avgDispatchTime").getContext('2d');
  var averageLabels = [];
  var averageData = [];
  for (var key in averages){
    averageLabels.push("District " + key);
    averageData.push(averages[key])
  }
  var chart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: averageLabels,
            datasets: [{
                label: 'Average Dispatch Times (in minutes)',
                data: averageData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{                  
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
  });
}

//******************************************************//
//FUNCTIONS TO FIND THE CHANGE IN DAILY CALLS           //
//******************************************************//

//Generate a graph of how the number of calls received per day changes
//over the duration of the dataset
function generateFrequencyGraph(){
  var sums = {};
  var count = {};
  var graph = {}
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {    
    var districtCounts = {};
    var positiveDistricts = [];
    var totalDistricts = 0;
    var totalDays = 0;

    //Count the number of districts and initialize the associative array corresponding
    //to each district
    for(i=0; i<data.length;i++){
      var district = data[i].supervisor_district;
     
      if(district in districtCounts == false){
        totalDistricts += 1
      }
      districtCounts[district] = {}
    }     

    //Calculate how many calls occur in each district on each day of the week
    for(i=0; i<data.length; i++){
      var district = data[i].supervisor_district;
      var receivedTime = data[i].received_timestamp;
      var day = convertTimestamp(receivedTime).day;

      if (day in districtCounts[district]){
        districtCounts[district][day] += 1;
      }
      else{
        totalDays += 1;
        districtCounts[district][day] = 1;
      }  
    }      

    //Calculate the change in the number of daily calls for each district over each day in the dataset
    for (var district in districtCounts){
      graph[district] = 0;
      for(var day in districtCounts[district]){ 
        nextDay = String(parseFloat(day) + 1)
        if (nextDay in districtCounts[district]){
          graph[district] += (districtCounts[district][nextDay] - districtCounts[district][day]);
        }
      }

      //If a district does not have a positive change in the number of calls per day remove
      //it from the graph
      if(graph[district] > 0){ 
        graph[district] = graph[district]/totalDays;
        positiveDistricts.push(district);
      }
      else{
        delete graph[district];
      }
    }  
    
    //Graph the change in the number of calls    
    graphFrequency(graph);
    //Find the optimal location for additional units
    findOptimalServicesLocations(positiveDistricts);
  });
}

//Create a bar graph of the districts that saw an increase in the number
//of calls received per day
function graphFrequency(changeInCalls){
  var ctx = document.getElementById("frequencyTrend").getContext('2d');
  var labels = [];
  var data = [];
  for (var key in changeInCalls){
    labels.push("District " + key);
    data.push(changeInCalls[key])
  }
  var chart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Increase in Number of Calls Per Day',
              data: data,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderWidth: 1
          }]
      }
  });
}

//Find the optimal location for additional service units in the districts
//that saw an increase in the number of calls received per day
function findOptimalServicesLocations(increasedDistricts){
  d3.csv("sfpd-dispatch/sfpd_dispatch_data_subset.csv", function(data) {    
    var districtLocations = {};
    var districtEntries = {};    
    var unitsNeeded= {};

    //Initialize the location and entry count for each district
    for(i=0;i<increasedDistricts.length;i++){ 
      districtLocations[increasedDistricts[i]] = {'lat':0,'lng':0};      
      districtEntries[increasedDistricts[i]] = 0;  
      unitsNeeded[increasedDistricts[i]] = {};    
    }     
    
    //Sum the latitude and longitude of each entry in each district
    //with either a medic or engine unit type
    for(i=0; i<data.length; i++){
      var district = data[i].supervisor_district;
      var entryLat = parseFloat(data[i].latitude);
      var entryLng = parseFloat(data[i].longitude);
      var unitType = data[i].unit_type;
                                    
      if(district in districtLocations){
        if(unitType in unitsNeeded[district]){
          unitsNeeded[district][unitType] += 1;
        }
        else{
          unitsNeeded[district][unitType] = 1;
        }
        if (unitType == 'MEDIC' || unitType == 'ENGINE'){                         
          districtLocations[district]['lat'] += entryLat;
          districtLocations[district]['lng'] += entryLng;
          districtEntries[district] += 1;    
        }
      }  
    }

    //Calculate the average latitude and longitude of a call in each district
    //and palce a marker at that location
    for (var district in districtLocations){
      var optimalLat = districtLocations[district]['lat']/parseFloat(districtEntries[district]);
      var optimalLng = districtLocations[district]['lng']/parseFloat(districtEntries[district]);
      var marker = new google.maps.Marker({
        position: {lat: optimalLat, lng: optimalLng},
        map: optimalServicesMap,
        label: district,              
      });     
    }

    //Initialize arrays to hold the data for a table displaying the number of calls requiring
    //either a medic or engine
    var elements = {};
    var tableHeaders = ["DISTRICT"];
    var headersGenerated = false;
    for(district in unitsNeeded){
      unitsNeeded[district] = sortAssignedArray(unitsNeeded[district]);
      var description = "District " + district
      elements[district] = [description];
    }
    
    //Store the name of the district and the top 7 unit types needed
    //in arrays to fill out the table
    for (var district in elements){     
      for(var type in unitsNeeded[district]){
        if(headersGenerated == false){
          tableHeaders.push(type);
        }            
        elements[district].push(unitsNeeded[district][type]);   
      }
      if(headersGenerated == false){  
        tableHeaders = tableHeaders.splice(0,8);
        headersGenerated = true;    
      }
      elements[district] = elements[district].splice(0,8);
    }

    //Fill out the table using the unit counts for each district
    for (i=0; i<tableHeaders.length; i++){
      //Color the top two unit types needed in green
      if (i==1 || i==2){
        $('#frequencyTitles').append('<th style="color: black; background-color: lightgreen;">' + tableHeaders[i] + '</th>');
      }
      else{
        $('#frequencyTitles').append('<th>' + tableHeaders[i] + '</th>');
      }
    }
    for(var district in elements){
      var tag = "#f" + String(district);
      for (i=0;i<elements[district].length; i++){              
        if(i==1||i==2){
          $(tag).append('<td style="color: black; background-color: lightgreen;">' + elements[district][i] + '</td>');
        }
        else{
          $(tag).append('<td>' + elements[district][i] + '</td>');
        }
      }
    }    
  });
}
}