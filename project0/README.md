# Project 0

Web Programming with Python and JavaScript

Student:
***Jesse Edwardson***

Edx username:
**Jesse_Light**

Github:
CrepusularLIGHT

***SCREENCAST:*** https://youtu.be/ysfAk-7ct80

Presented is a 5-page webpage:
* _Home_ (index.html)
* _Bio_ (content/bio.html)
* _Videos_ (content/videos.html)
* _Gallery_ (content/gallery.html)
* _Downloads_ (content/downloads.html)

Stylesheet:
* content >
	- style.css
	- style.scss
	- style.css.map

Other files:
 * content > audio
 	- PANDEMIC_demo.wav
 	- PANDEMIC_demo.mp3
 * content > images
 	- 96 images that have been incorporated through webpage

Overview:
	A webpage called LightSound that contains music, videos, and photos that are original creations. It contains a brief overview on myself and some creations I have to share.  Add me on Twitter, subscribe on YouTube, follow on Instagram, download my music for free on Bandcamp, follow on SoundCloud, and also on Twitch.tv. 

Each page shares the same *Navigation Bar* in *header* tag:
* Uses __@media query__ to format for differnet sized viewing windows
	- The names of the pages disappear on extra small screens
	- Icons stack on top of each other on small screens
* Contains __links to each page__: *Home*, *Bio*, *Videos*, *Gallery*, and *Downloads*
* Contains links to social media using their specific logos
* Has a custom logo for the webpage
* Uses __Bootstrap 4__ components
* Uses __Unordered List__ for each link

----- ----- ----- ----- -----
----- ----- ----- ----- -----

## Home

* Displays a large __image__ with overlaying text
* Has a *side panel* that disappears on smaller screens using __@media query__
	- Has a playlist and links to other songs that I have not provided at this time
	- I don't have much experience with JavaScript and haven't learned it in the course yet
	- This section is a work in progress that I plan to work on after learning JavaScript
	- Mostly incorporated to practice and show workability with __Bootstrap 4__
* Has __HTML 5__ audio player element to play a song that I created
* Has *footer* that includes a creative license and an image and link to the license


## Bio

* Brief biography about music history and upbringing
* Images displayed in background, stacked on top of each other, using __Bootstrap 4__ grid model
  - Images adjust as screen size is changed
* Overlaying text over images using CSS styling
	- Paragraphs are wrapped to screen width


## Videos

* Using __Bootstrap 4__ grid model to create 2 columns, 4 rows
* Videos that play in-browser from YouTube
* Details about each video is provided in the left column


## Gallery

* Uses __Table__ to display a beautiful gallery of images taken from a road trip in Spring 2018
	- Divided into 3 columns: location, image, and date of picture
* Images styled using CSS, adjusting to the viewer screen size


## Downloads

* Downloadable link to the song from the front page
	- 2 other links are included, but do not link to content at this time
* Transparent box around text is used to try different CSS styling


----- ----- ----- ----- -----
----- ----- ----- ----- -----

## Style.CSS

* Used 3 #id
* Used > 10 .class
* Used > 10 CSS styling properties 
* Used @media query for mobile-responsive behavior


## Style.SCSS

1. Variables:
```
	$bgColor: #f7f7f7;
	$boxColor: #ffffff;
	$tlTextColor: #777777;
	$tlTextColor2: #2F2F2F;
	$brTextColor: #c0c0c0;
	$overlayTextColor: #202020;
	$sideBarBgColor: #77757a;
	$bgDownloadsImage: url('images/moab17.jpg');
	$playlistColor: #837787;
```

2. Nesting:

```
.custom-tl-text {
@extend %overlay-text;
top: 5px;
left: 10px;

	h3 {
	color: $tlTextColor;
	}
}
```

3. Inheritance:

```
%transparent-box {
  background-color: $boxColor;
  opacity: 0.4;
}

.custom-transparent-box {
  @extend %transparent-box;
  margin: 30px;
}
```
