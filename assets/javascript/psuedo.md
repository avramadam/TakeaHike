**Google Geo API**
we used the geocoding api to take an address input & convert it to lat and long

	TODO: implement some sort of form validation so the user cant just throw a city or state or cross-streets and get a lat
		  and long.
		  - specificly we want a street address in the form of Street, city, state, zip? or just street city state, or just zip?
		  - we have options because that api is magical, it'll take almost anything and give you an output 

**Sunrise/Sunset**
this is a fairly simple API, take the lat and long, and it gives you sunrise and sunset times. we want to display those along with each result we get for hiking options, or maybe we just display those times on top of our list of options in a cool looking way?
Times will be the same for all these options anyway.

**Hiking Project**
takes lat/long inputs and returns trails
	takes arguments such as trail quality (star rating), distance (max or min length)
	