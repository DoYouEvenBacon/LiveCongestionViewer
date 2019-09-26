# LiveCongestionViewer
This web app is powered by the Auckland Transport API provided by NZTA (New Zealand Transport Agency) and OpenLayers API which is based on OpenStreetMaps.

Following on from my LiveBusTracker app, I built this app using the same base. I reused code for the menu, map and popups hence why it bears a similar design to by bus tracker app.

This app shows colour-coded congestion levels around the main motorways in Auckland, as well as live images of certain parts of the motorway where there are traffic cameras. It also includes a live location tracker instead of a static one because of the possible uses on the road for this app.

Disclaimer:
Please take care on the road, especially if you plan to use this app.
<br/>
[About Safer Journeys.](https://www.saferjourneys.govt.nz/about-safer-journeys/)

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

## Images of the Web App
- The initial view of the web app
![1](https://user-images.githubusercontent.com/45221821/65651692-58572100-e063-11e9-8dad-ba0979fb8417.PNG)
<br/><br/><br/>
* Track the user's location in real-time even when on the move.
![2](https://user-images.githubusercontent.com/45221821/65652314-6dcd4a80-e065-11e9-80ee-8cb45918103b.PNG)
<br/><br/><br/>
* Show congestion lines and traffic camera locations.
![3](https://user-images.githubusercontent.com/45221821/65652436-e2a08480-e065-11e9-98bd-247399f4ea81.PNG)
<br/><br/>
* Click on a camera to show current traffic image and status.
![4](https://user-images.githubusercontent.com/45221821/65652459-fa780880-e065-11e9-9cea-afa0a07607ba.PNG)
![4_x](https://user-images.githubusercontent.com/45221821/65652984-b7b73000-e067-11e9-99ec-b7bc085d127d.PNG)
<br/><br/>
* Auto-updater that refreshes the congestion status every 90 seconds when clicked.
![5](https://user-images.githubusercontent.com/45221821/65652580-580c5500-e066-11e9-9c4d-afdae44f7f04.PNG)
<br/><br/><br/>
* Links to NZTA and the Safer Journeys strategy websites. [What is Safer Journeys?](https://www.saferjourneys.govt.nz/about-safer-journeys/)
![6](https://user-images.githubusercontent.com/45221821/65652667-9c97f080-e066-11e9-823a-d501eeea6833.PNG)
