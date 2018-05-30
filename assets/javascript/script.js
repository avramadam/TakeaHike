$(document).ready(function () {

	$("#formdiv").hide();
	$("#infobox").hide();
	$("#results").hide();
	$("#newsearchbutton").hide();
	$("#localconditions").hide();
	$("#commentbutton").hide();
	$("#commentpanel").hide();
	$("#generatedcomments").hide();

	function start() {
		$("#startbutton").hide();
		$("#formdiv").show();
		$("#infobox").show();
		$("#aboutus").hide();
		$("#generatedcomments").hide();
	}

	function showresults() {

		$("#startbutton").hide();
		$("#formdiv").hide();
		$("#localconditions").show();

		$("#results").show();
		$("#newsearchbutton").show();
		$("#aboutus").hide();
		$("#commentbutton").show();

	}

	function reset() {

		$("#generate").empty("");
		$("#formdiv").show();
		$("#infobox").hide();
		$("#results").hide();
		$("#newsearchbutton").hide();
		$("#localconditions").hide();
		$("#commentbutton").hide();
		$("#commentpanel").hide();
		$("#generatedcomments").hide();
	}

	// this function wasn't working when it was named comment, so i renamed it and now it works. Presto change-o!
	function momment() {
		$("#formdiv").hide();
		$("#commentpanel").show();
		$("#results").hide();
		$("#generatedcomments").show();
		$("#localconditions").hide();
	}

	$(function () {
		$("#datepicker").datepicker();
	});

	$(function () {
		$("#datepicker2").datepicker();
	});

	$('#start').on('click', function (event) {
		event.preventDefault();
		start();
	});

	$('#newsearch').on('click', function (event) {
		event.preventDefault();
		reset();

	});

	// this was also renamed to coincide with our function
	$('#comment').on('click', function (event) {
		event.preventDefault();
		momment();

	});

	//when we click sumbit, grab our address, clear the field, and give it to our URL generator
	$('#add-info').on('click', function (event) {

		event.preventDefault();
		//run our validation function(w/true parameter) and if it is true continue on with the rest of our logic
		//this prevents the button from working if the input text is empty
		if (validate(true)) {
			var address = $('#address-input').val().trim();
			$('#address-input').val('');
			$('#city-input').val('');
			//start the chain of api calls by calling our queryurl generator for google geo with the address the user gives us
			generateGeoURL(address);
			//results starts displaying, not sure if that logic can be combined with anything else
			showresults();
		}
	});

	//accept the address entered from landing page and generate our queryURL with it
	function generateGeoURL(userAddress) {

		var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?";
		queryURL += "address=" + userAddress + "&key=AIzaSyCKCcf4NKf1sMMm9qsZItERp1W85V--pzk";
		//send our new url to our ajax call
		returnGeo(queryURL);

	};

	//use our newly generated queryURL , ajax call returns lat and log(along with a bunch of other stuff)
	function returnGeo(queryURL) {
		console.log("url: " + queryURL);
		$.ajax({
			url: queryURL,
			method: "GET"
		}).then(function (response) {
			console.log(response);

			console.log(response.results["0"].geometry.location.lat);
			console.log(response.results["0"].geometry.location.lng);

			var lat = response.results["0"].geometry.location.lat;
			var long = response.results["0"].geometry.location.lng;

			//these two are dummy hardcoded values that we are passing
			var date = "today";
			var dist = 10;
			//create the sunrise/sunset url
			//give our shiny new lat and long to the trail results function
			returnTrailResults(lat, long, dist);
			getWeather(lat, long);

		}).fail(function (err) {
			console.log(err);
		});
	}

	//this get our actual trail details
	function returnTrailResults(lat, lon, dist) {
		var queryURL = "https://www.hikingproject.com/data/get-trails?lat=" + lat + "&lon=" + lon + "&maxDistance=" + dist + "&key=200230247-4291e640db33e0c7d20a9bc2037f8e20";
		$.ajax({
			url: queryURL,
			method: "GET"
		}).then(function (response) {
			console.log(response);
			for (var x = 0; x < response.trails.length; x++) {
				console.log(response.trails[x].name);
				console.log(response.trails[x].location);
				console.log(response.trails[x].length);
				console.log(response.trails[x].stars);
				console.log(response.trails[x].summary);

				//adding in my code to display the results in an individual div per trail

				//first place all relevant results in variables
				var trailName = response.trails[x].name;
				var trailLocation = response.trails[x].location;
				var trailLength = response.trails[x].length;
				var trailRating = response.trails[x].stars;
				var trailSummary = response.trails[x].summary;
				var trailUrl = response.trails[x].url;

				//this will dynamically generate the div to contain the trail info
				var trailHolder = $("<div class='trail'>");

				var trailLink = $("<a target='_blank' href=" + "'" + trailUrl + "'" + "></a>");
				var nameTag = $("<p class='title'>").text(trailName);
				trailLink.append(nameTag);
				var linebreak = $("<hr>");
				var locationTag = $("<p>").text("Location: " + trailLocation);
				var lengthTag = $("<p>").text("Length: " + trailLength + " miles");
				var ratingTag = $("<p>").raty({ score: trailRating, readOnly: true, path: 'assets/images/' });
				//var ratingTag = $("<p>").text("Rating: " + trailRating + " stars");
				var linebreak2 = $("<hr width='100%' align='left'>");
				var summaryTag = $("<p>").text(trailSummary);

				//populate the divs
				trailHolder.append(trailLink);
				trailHolder.append(linebreak);
				trailHolder.append(locationTag);
				trailHolder.append(lengthTag);
				trailHolder.append(ratingTag);
				trailHolder.append(linebreak2);
				trailHolder.append(summaryTag);

				//display them on the page 
				$("#generate").append(trailHolder);

			}
		});
	}

	//this handles our user input validation, the address field cannot be empty
	$('#address-input').keyup(function (event) {
		validate();
	});
	//validate function that determines if address input is empty, if it is 
	function validate(showError) {
		var input = $('#address-input');
		var errorText = $('#err-span');
		address = input.val();
		//add valid class if there is text in the input and return true
		if (address) {
			input.removeClass('invalid').addClass('valid');
			return true;
			//switch to invalid if its empty, if showError parameter is true also display our extra validation text and return false
		} else {
			input.removeClass('valid').addClass('invalid');

			if (showError === true) {
				errorText.removeClass('error').addClass('error_show');
			}
			return false;
		}
	}

	//---------------------------------------------------------------------------------------------------------------------
	// This is our API key for our own weather div 
	var APIKey = "166a433c57516f51dfab1f7edaed8413";
	function getWeather(lat, lon) {
		// Here we are building the URL we need to query the database
		var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon
			+ "&units=imperial&appid=" + APIKey;
		var timeURL = "https://maps.googleapis.com/maps/api/timezone/json?" +
			"location=" + lat + "," + lon + "&timestamp=1458000000&"
			+ "key=AIzaSyBioWxVvt0hksSzteSItrWQ-cq0RgoBz_k";


		$.ajax({
			url: timeURL,
			method: "GET"
		}).then(function (result) {
			//Here we run our AJAX call to the OpenWeatherMap API
			$.ajax({
				url: queryURL,
				method: "GET"
			})
				// We store all of the retrieved data inside of an object called "response"
				.then(function (response) {

					// Log the queryURL
					console.log(queryURL);
					console.log(timeURL);

					// Log the resulting object
					console.log(result);
					console.log(response);

					// Transfer content to HTML
					$(".city").html("<h1><b>" + response.name + " Local Conditions</h1></b>");
					$(".temp").text("Temperature:  " + response.main.temp + "° F");
					$(".description").text("Description: " + response.weather[0].description);
					var iconCode = response.weather[0].icon;
					var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";
					$(".weather").text("Weather: " + response.weather[0].main);
					$(".icon").html("<img src='" + iconUrl + "'>");
					$(".wind").text("Wind Speed: " + response.wind.speed);
					$(".humidity").text("Humidity: " + response.main.humidity);

					//Takes the time and converts it from unix to LTS and then finds and converts 
					//time zone.
					var sunTimes = moment.unix(response.sys.sunrise);
					var zoneA = (result.timeZoneId);
					console.log(zoneA);
					var zone = moment(sunTimes).tz(zoneA).format("LTS");
					$(".sunrise").text("Sunrise: " + zone);
					var setTime = moment.unix(response.sys.sunset);
					var zones = (setTime).tz(zoneA).format("LTS");
					$(".sunset").text("Sunset: " + zones);

					// Log the data in the console as well
					console.log("Temperature (F): " + response.main.temp);
					console.log("Description: " + response.weather.description);
					console.log("Weather: " + response.weather.main);
					console.log("Icon: " + response.weather.icon);
					console.log("Wind Speed: " + response.wind.speed);
					console.log("Humidity: " + response.main.humidity);
					console.log("Sunrise " + sunTimes);
					console.log("Sunset " + setTime);
				});
		});

	}

	//everything below this is me (ryan) setting up firebase for the comments section

	// Initialize Firebase
	var config = {
		apiKey: "AIzaSyBS0a25AzSZao_VpeurhbiLr3hDs8tfE_Y",
		authDomain: "takeahike-16cb4.firebaseapp.com",
		databaseURL: "https://takeahike-16cb4.firebaseio.com",
		projectId: "takeahike-16cb4",
		storageBucket: "takeahike-16cb4.appspot.com",
		messagingSenderId: "1092263463868"
	};

	firebase.initializeApp(config);

	//store the data form the database in a variable
	var database = firebase.database();

	//initialize values
	var name = "";
	var date = "";
	var comment = "";

	// Capture Button Click
	$("#add-comment").on("click", function (event) {

		//prevents page from refreshing
		event.preventDefault();

		//manipulates html view
		// comment();
		// postcomment();

		// the logic for storing and retrieving the train info
		// Don't forget to provide initial data to your Firebase database. (see lines 140-143)
		name = $("#commentname-input").val().trim();
		date = $("#datepicker2").val().trim();
		comment = $("#commenttext").val().trim();


		//organize the way our info will be pushed to the server
		//this will create a local temporary object to hold our data (from timesheetlogic.js)
		var newComment = {
			name: name,
			date: date,
			comment: comment,
			dateAdded: firebase.database.ServerValue.TIMESTAMP

		};

		// Uploads comment data to the database
		database.ref().push(newComment);

		// Logs everything to console
		console.log(newComment.name);
		console.log(newComment.date);
		console.log(newComment.comment);

		//clears the input boxes for the next comment
		$("#commentname-input").val(" ");
		$("#datepicker2").val(" ");
		$("#commenttext").val(" ");
		$("generatedcomments").show();

	});

	//code and explanation taken from recent-user-with-all-users-solved.html
	// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
	database.ref().on("child_added", function (childSnapshot) {

		console.log(childSnapshot.val());

		// Store everything into a variable.
		var name = childSnapshot.val().name;
		var date = childSnapshot.val().date;
		var comment = childSnapshot.val().comment;

		// Log everything that's coming out of snapshot
		console.log(childSnapshot.val().name);
		console.log(childSnapshot.val().date);
		console.log(childSnapshot.val().comment);

		$("#comment-table > tbody").prepend("<tr><td class='commenttd'>" + name + "</td><td class='commenttd'>" + date + "</td><td class='commenttd'>" + comment + "</td></tr>");

		// Handle the errors
	}, function (errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});

});




