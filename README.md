# LiveCongestionViewer
This web app is powered by the Auckland Transport API provided by NZTA (New Zealand Transport Agency) and OpenLayers API which is based on OpenStreetMaps.

Following on from my LiveBusTracker app, I built this app using the same base. I reused code for the menu, map and popups hence why it bears a similar design to by bus tracker app.

This app shows colour-coded congestion levels around the main motorways in Auckland, as well as live images of certain parts of the motorway where there are traffic cameras. It also includes a live location tracker instead of a static one because of the possible uses on the road for this app.

## Requirements
- The latest web browser. (This web app was developed in Google Chrome.)
- [An InfoConnect account provided by NZTA](https://nzta.govt.nz/traffic-and-travel-information/infoconnect-section-page/).

## Setting Up
1. Place the HTML and JavaScript files in the same directory.
2. Put your InfoConnect Username and Password on line 5 and 6 respectively in the JavaScript file.
3. The web app should now be able to run.

## Features
* The app shows colour-coded congestion lines on the map and camera locations when the 'Show Cameras and Congestion' button is clicked. There is a button for an automatic congestion update every 90 seconds.
* Clicking on the camera icons brings up a popup showing the latest traffic camera image as well as congestion conditions on that part of the road (in both directions where applicable).
* This app has a real-time location tracker that when clicked will continuously track the user's location until they toggle it off.
