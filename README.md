Bicycle Route Tracking Application

This project is an interactive web application for cyclists that allows tracking and recording routes, calculating the distance traveled, time elapsed, and calories burned during a bicycle ride. It uses the Google Maps API for route tracking and visualization.

Features

Real-Time Tracking: Uses geolocation to follow the user's route in real time.
Distance and Time Recording: Calculates the distance traveled and the time elapsed during the ride.
Calorie Burn Calculation: Estimates the calories burned based on the distance traveled and MET (Metabolic Energy Expenditure).
Route History: Saves and displays the history of past routes with details like distance, time, and calories burned.
Route Visualization on the Map: Shows previous routes on the map for review and future reference.
Pause and Resume Routes: Allows the user to pause and resume tracking as needed.
Technologies Used

HTML and CSS for the structure and style of the user interface.
JavaScript for the logic of tracking and calculating routes.
Google Maps API for the visualization and tracking of routes on the map.
How It Works

When the application loads, it initializes the map with the user's current location.
The user can start a new route, which begins the real-time tracking.
During the ride, the application records the distance, time, and calculates the calories burned.
Upon completion, the user can save the route, which is added to the history.
Installation and Use

<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR-KEY"></script>

To use Google Maps in this application, you will need to obtain a Google API key. Follow these steps:

Visit Google Cloud Platform and create or sign in to your account.
Create a new project in the Google Cloud Console.
Activate the 'Maps JavaScript API' under the 'Library' section.
Generate an API key in the 'Credentials' section.
Remember to replace YOUR-KEY in the Google Maps script with your obtained API key.

For more details and security settings, consult the official Google Maps Platform documentation.

Clone the repository to your local machine.
Open the index.html file in your browser to start the application.
Ensure you allow access to your location for real-time tracking.
Contributions

Contributions to this project are welcome. If you have suggestions for improving the application or adding new features, please feel free to create an issue or send a pull request

![Project screenshot](https://app.hundezonen.ch/docs/IMG_0094.PNG)
