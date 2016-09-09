//set a variable to hold all page information
var pubWalk = {
  map: null,
  xmlDoc: null,
  markers: null,
  infoWindow: null,
  streetView: null,
  lists: null,
  desc: null,
  images: null,
  table: null,
  directionsRender: null,
  directionsService: null,
  request: null
};
//load in the XML file
pubWalk.loadXml = function(){
//check which browser is being used
  if (document.all)
	{
		// if using Internet Explorer, create a blank document
		pubWalk.xmldoc = new ActiveXObject("MSXML2.DOMDocument");
	}
	else
	{
		pubWalk.xmldoc = document.implementation.createDocument("", "test", null);

	}	
	// Synchronously load and parse the xml file into the blank document	
	pubWalk.xmldoc.async = false;
	pubWalk.xmldoc.load("mypubWalk.xml");	
}

function mouseOverMarker(marker)
{
	//iterate through the markers to find out which one was clicked
	for (var x = 0; x < pubWalk.markers.length; x++)
	{
		if (marker == pubWalk.markers[x])
		{
			pubWalk.infoWindow.setContent("<div class=\"contentWindow\">" +
											pubWalk.images[x] +
											"<span class=\"contentWindowSpan\">" + pubWalk.lists.nameList[x].firstChild.nodeValue + "</span>" +
											"<br /> " +
											pubWalk.lists.descList[x].firstChild.nodeValue +
											"</div>");
			pubWalk.infoWindow.setPosition(new google.maps.LatLng(pubWalk.lists.latList[x].firstChild.nodeValue, pubWalk.lists.longList[x].firstChild.nodeValue));
			pubWalk.infoWindow.open(pubWalk.map);
			break;
		}
	}
}

function mouseOffMarker(marker)
{
	pubWalk.infoWindow.setMap(null);	
}
//function runs when a marker is clicked
function clickMarker(marker)
{
   for ( var x = 0; x < pubWalk.markers.length; ++x )
   {
     if ( pubWalk.markers[x] == marker ) 
     {
		//change Pegman's position in the street view
		pubWalk.streetView.setPosition(pubWalk.markers[x].getPosition());
		//change Pegman's view to face the restaurant
		pubWalk.streetView.setPov({
		heading: parseFloat(pubWalk.lists.headingList[x].firstChild.nodeValue),
		pitch: parseFloat(pubWalk.lists.pitchList[x].firstChild.nodeValue),
		zoom: parseInt(pubWalk.lists.zoomList[x].firstChild.nodeValue)
		});	
		//change the description of the restaurant on the web page
		pubWalk.desc.innerHTML = "<span class=\"contentWindowSpan\">" + pubWalk.lists.nameList[x].firstChild.nodeValue + "</span> - " + pubWalk.lists.descList[x].firstChild.nodeValue;
		//find the distance between the last restaurant and the new one
		findDistance(x);
		break;
     }
   }   
}
function findDistance(index)
{	
	//create two variables that refer to the images on the web page
	var destination = document.getElementById('destination');
	var origin = document.getElementById('origin');
	//change the src and the alt of the origin image to those of the destination
	origin.src = destination.src;
	origin.alt = destination.alt;
	//change the src and the alt of the destination image to the index of the marker that was clicked
	destination.src = "http://cbk0.google.com/cbk?output=thumbnail&w=100&h=75&panoid=" + pubWalk.lists.panoidList[index].firstChild.nodeValue + "&yaw=" + pubWalk.lists.headingList[index].firstChild.nodeValue + "&pitch=" + pubWalk.lists.pitchList[index].firstChild.nodeValue;
	destination.alt = 'image of ' + pubWalk.lists.nameList[index].firstChild.nodeValue;
	//change the name of the origin restaurant to that of the destination
	document.getElementById('originName').innerHTML = document.getElementById('destinationName').innerHTML;
	//change the name of the destination restaurant to that of the index of the marker that was clicked
	document.getElementById('destinationName').innerHTML = pubWalk.lists.nameList[index].firstChild.nodeValue;
	//create a variable to store the old destination
	var oldDestination = pubWalk.request.destination;
	 //create a new request with the new origin and destination
	pubWalk.request = {
		origin: oldDestination, // make the origin the old destination, create a new destination and take a walk
		destination: new google.maps.LatLng(pubWalk.lists.latList[index].firstChild.nodeValue, pubWalk.lists.longList[index].firstChild.nodeValue),
		travelMode: google.maps.DirectionsTravelMode.WALKING
	}
	//query whether it is possible to get to the two locations by road
	sendDistanceRequest(pubWalk.request);
}
function sendDistanceRequest(request){
	pubWalk.directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
         // Display the distance:
         document.getElementById('distance').innerHTML = 
            response.routes[0].legs[0].distance.value;
         // Display the duration:
         document.getElementById('duration').innerHTML = 
            response.routes[0].legs[0].duration.value;
         pubWalk.directionsRender.setDirections(response);
    }
   });
}
pubWalk.init = function() {

	//load the XML file
	pubWalk.loadXml();
	//create pointers for the arrays in pubWalk.lists
	pubWalk.lists = {
	nameList: pubWalk.xmldoc.getElementsByTagName("name"),
	latList: pubWalk.xmldoc.getElementsByTagName("lat"),
	longList: pubWalk.xmldoc.getElementsByTagName("long"),
	panoidList: pubWalk.xmldoc.getElementsByTagName("panoid"),
	visitedList: pubWalk.xmldoc.getElementsByTagName("visited"),
	descList: pubWalk.xmldoc.getElementsByTagName("desc"),
	headingList: pubWalk.xmldoc.getElementsByTagName("heading"),
	pitchList: pubWalk.xmldoc.getElementsByTagName("pitch"),
	zoomList: pubWalk.xmldoc.getElementsByTagName("zoom")
	};
	
	//create a variable for a default restaurant where the centre of the map and the view begin
	var defaultRest = 15;	
	var defaultCentre = new google.maps.LatLng(pubWalk.lists.latList[defaultRest].firstChild.nodeValue, pubWalk.lists.longList[defaultRest].firstChild.nodeValue);
	
  // Create single instance of a Google Map.
	var mapOptions = {
		zoom: 18,
		panControl: true,
		panControlOptions:{
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.RIGHT_BOTTOM
		},
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.TOP_LEFT
		},
		streetViewControl: false,
		mapTypeControl: true,
		mapTypeControlStyleOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
			position: google.maps.ControlPosition.BOTTOM_LEFT
		},
		mapTypeId: google.maps.MapTypeId.HYBRID,
		center: defaultCentre
  };
  //actualise the map and show it on the map-canvas
  pubWalk.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  
  //store the variables that apply to the panorama option
  var panoOptions = {
      addressControl: true,
      addressControlOptions: {
         style: {backgroundColor: 'white', color: 'black'}
      },
      position: defaultCentre,
	  //set the angle of view of the street view.
      pov: {
         heading: parseFloat(pubWalk.lists.headingList[defaultRest].firstChild.nodeValue),
         pitch: parseFloat(pubWalk.lists.pitchList[defaultRest].firstChild.nodeValue),
         zoom: parseInt(pubWalk.lists.zoomList[defaultRest].firstChild.nodeValue)
      }
	};
	//actualise the street view and show it on the street-canvas
	pubWalk.streetView = new  google.maps.StreetViewPanorama(document.getElementById("street-canvas"), panoOptions);
	//associate the street view with the map
	pubWalk.map.setStreetView(pubWalk.streetView);
	
	
	pubWalk.markers = Array();
	pubWalk.images = Array();
	
	for (var i = 0; i < pubWalk.lists.nameList.length; i++)
	{	
		pubWalk.images[i] = "<image class=\"contentImage\" width=\"100\" height=\"75\" src=\"http://cbk0.google.com/cbk?output=thumbnail&w=120&h=100&panoid=" + pubWalk.lists.panoidList[i].firstChild.nodeValue + "&yaw=" + pubWalk.lists.headingList[i].firstChild.nodeValue + "&pitch=" + pubWalk.lists.pitchList[i].firstChild.nodeValue + "\" />"
		var myIcon = new google.maps.MarkerImage("http://www.google.com/intl/en_us/mapfiles/ms/micons/red-pushpin.png");
		
		if (pubWalk.lists.visitedList[i].getAttribute("visited") == "visited")
		{
			myIcon = new google.maps.MarkerImage("http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-pushpin.png");
			//alert("found");
		}
		
		pubWalk.markers[i] = new google.maps.Marker({
			position: new google.maps.LatLng(pubWalk.lists.latList[i].firstChild.nodeValue, pubWalk.lists.longList[i].firstChild.nodeValue),
			title: pubWalk.lists.nameList[i].firstChild.nodeValue,
			icon: myIcon
		});
		//yehaahe
		google.maps.event.addListener(pubWalk.markers[i], 'mouseover', function() {
			mouseOverMarker(this)
		});
		
		google.maps.event.addListener(pubWalk.markers[i], 'mouseout', function() {
			mouseOffMarker(this)
		});
		
		google.maps.event.addListener(pubWalk.markers[i], 'click', function() {
			clickMarker(this)
		});
		pubWalk.markers[i].setMap(pubWalk.map);
	}
	pubWalk.desc = document.getElementById('pub-desc');
	pubWalk.desc.innerHTML = "<span class=\"contentWindowSpan\">" + pubWalk.lists.nameList[defaultRest].firstChild.nodeValue + "</span> - " + pubWalk.lists.descList[defaultRest].firstChild.nodeValue;
	
	pubWalk.infoWindow = new google.maps.InfoWindow({
	disableAutoPan: true
	});
	
	//set the default names
	document.getElementById('originName').innerHTML = pubWalk.lists.nameList[8].firstChild.nodeValue;
	document.getElementById('destinationName').innerHTML = pubWalk.lists.nameList[defaultRest].firstChild.nodeValue;
	
	//create an image for the destination
	var destination = document.createElement('img');
	destination.alt = 'image of' + pubWalk.lists.nameList[defaultRest].firstChild.nodeValue;
	destination.src = "http://cbk0.google.com/cbk?output=thumbnail&w=100&h=75&panoid=" + pubWalk.lists.panoidList[defaultRest].firstChild.nodeValue + "&yaw=" + pubWalk.lists.headingList[defaultRest].firstChild.nodeValue + "&pitch=" + pubWalk.lists.pitchList[defaultRest].firstChild.nodeValue;
	destination.id = 'destination';
	//create an image for the origin
	var origin = document.createElement('img');
	origin.src = "http://cbk0.google.com/cbk?output=thumbnail&w=100&h=75&panoid=" + pubWalk.lists.panoidList[8].firstChild.nodeValue + "&yaw=" + pubWalk.lists.headingList[8].firstChild.nodeValue + "&pitch=" + pubWalk.lists.pitchList[8].firstChild.nodeValue;
	origin.alt = 'image of' + pubWalk.lists.nameList[8].firstChild.nodeValue;
	origin.id = 'origin';
	//append the images to the web page table
	document.getElementById('destinationImg').appendChild(destination);
	document.getElementById('originImg').appendChild(origin);
	
	pubWalk.directionsService = new google.maps.DirectionsService();
	pubWalk.directionsRender = new google.maps.DirectionsRenderer();
	pubWalk.directionsRender.setMap(pubWalk.map);
	//create a new request for new journey
	pubWalk.request = {
       origin: new google.maps.LatLng(pubWalk.lists.latList[8].firstChild.nodeValue, pubWalk.lists.longList[8].firstChild.nodeValue), 
       destination: new google.maps.LatLng(pubWalk.lists.latList[defaultRest].firstChild.nodeValue, pubWalk.lists.longList[defaultRest].firstChild.nodeValue),
       travelMode: google.maps.DirectionsTravelMode.WALKING
   };   
   sendDistanceRequest(pubWalk.request);	
};
