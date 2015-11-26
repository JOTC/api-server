const db = require("../model/db");
const dates = require("../dateHelper");
const log = require("bunyan").createLogger({ name: "static site component", level: "debug" });

const HTML_START = `<head>
	<title>Jackson Obedience Training Club - JOTC</title>
	<style type="text/css">
		@font-face
		{
			font-family: 'Roboto';
			font-style: normal;
			font-weight: 400;
			src: local('Roboto Regular'), local('Roboto-Regular'), url(css/Roboto-Regular.woff) format('woff');
		}

		@font-face
		{
			font-family: 'Roboto';
			font-style: normal;
			font-weight: 700;
			src: local('Roboto Bold'), local('Roboto-Bold'), url(css/Roboto-Bold.woff) format('woff');
		}

		@font-face {
		  font-family: 'Cinzel Decorative';
		  font-style: normal;
		  font-weight: 900;
		  src: local('Cinzel Decorative Black'), local('CinzelDecorative-Black'), url(css/cinzel_decorative.woff) format('woff');
		}

		body
		{
			background-color: #ddd;
			font-family: 'Roboto', Verdana, Arial, Helvetica;
			line-height: 1.3;
			margin-top: 160px;
		}

		div#header
		{
			position: absolute;
			top: 0;
			left: 0;
			height: 150px;
			width: 100%;
			background-color: #024;
			color: white;
		}

		div#header img
		{
			margin: 15px;
		}
	</style>
</head>
<body>
<div id="header">
	<img align="top" src="media/jotc_logo_color.ie.png">
	<div style="display: inline-block; *zoom: 1; *display: inline; margin-top: 15px; text-align: center;">
		<div style="font-size: 2.5em; line-height: 0.9em; font-weight: bold; padding-bottom: 10px;">Jackson Obedience<br>Training Club</div>
		<span style="font-style: italic;">Teaching You to Train Your Dog</span>
	</div>
</div>

The Jackson Obedience Training Club, Inc. (JOTC) is a non-profit organization established in 1969 and licensed by the American Kennel Club. The club is dedicated to the advancement of dog obedience as a sport and the promotion of responsible pet ownership. JOTC's belief is that any dog, purebred or mixed-breed, can learn basic obedience commands when taught with a consistent and positive approach.
<br><br>
JOTC sponsors obedience and rally trials, as well as offering training classes at various times throughout the year.
<br><br>
<a href='#shows'>Upcoming Shows</a> | <a href='#classes'>Obedience Classes</a>
<br><br>`;

const HTML_END = `Why should you train your dog?
<ul>
	<li>To have your dog under control and responsive to your commands. Wouldn't it be nice to call your dog and have him come running to you?</li>
	<li>To learn how to communicate with your dog so that he knows what you expect of him. This will make the dog's life happier and less stressful.</li>
	<li>Your dog's quick response to an obedience command could save his life. If your dog is about to rush into traffic or eat something deadly, you want him to understand and obey when you tell him to stop.</li>
	<li>You will build a better, stronger relationship with your dog through training.</li>
	<li>Your dog will learn to be polite and under control at all times, even in public, around other dogs, and with many distractions.</li>
	<li>Training your dog will reduce the risk of him biting someone, which could result in a lawsuit and even your dog being euthanized. A well-mannered, trained dog teamed with a responsible pet owner is absolutely necessary. Obedience training is a very subtle, non-threatening way of gaining control over a dog that is prone to aggression. Once your dog has been properly socialized and trained, the chances of him biting someone are significantly reduced.</li>
</ul>

General Information
<ul>
	<li>Instructors for all classes are required to meet specific criteria, must hold at least one obedience title on a dog, and attend continuing education seminars and training.</li>
	<li>Pre-registration is requested for all classes in order to ensure proper class sizes.</li>
	<li>Proof of vaccination is required. Rabies vaccination must have been given by a licensed veterinarian.</li>
	<li>All Basic Obedience classes are divided according to dogs' sizes. Classes include small, medium, and large dogs. This way, your small dog will not be intimidated by a larger dog, and your large dog won't be distracted by a smaller one.</li>
	<li>Our classes are small, usually with about 12 dogs per class. Each student will receive the individual attention necessary to help you fully understand each exercise as well as successfully work through any training problems you encounter.</li>
	<li>Obedience classes last six weeks and are held for one hour a night, one night a week. Rally classes last eight weeks.</li>
	<li>During class, you will be the one to train you dog, under the guidance of our instructors. We feel this approach is better for you and your dog than sending your dog to a boarding school to be trained by someone else for the following reasons:</li>
		<ul>
			<li>If your dog is trained by someone else, he will learn to respond and respect them, but will still need to learn to mind you. You will have to learn how to communicate with your dog and enforce your commands before the dog will take you seriously. The easiest way to accomplish this is to learn what to do and train the dog yourself.</li>
			<li>Sending your dog to live with someone else for several weeks or months is stressful for you and your dog. Training with your dog is fun for both of you.</li>
			<li>If you are the one training your dog, you can be assured that your dog is learning through a consistent and positive approach.</li>
			<li>Training builds a relationship between you and your dog. You will find that you become closer and enjoy your dog's company more when he is under control and you can make him behave. If you send your dog to be trained, you lose the bonding that comes with learning.</li>
			<li>Training your dog in a group setting will give him the opportunity to learn how to behave aground a number of people and dogs. You will also learn how to read your dog.</li>
		</ul>
	<li>JOTC welcomes all breeds of dogs to classes, regardless of whether the dog is a purebreed or mixed. <span style='font-weight:bold;'>HOWEVER, JOTC does not allow wolves or wolf hybrids in any of its classes.</span></li>
</ul>

<div style="background-color: #024; color: white; padding: 5px; font-size: 0.8em; text-align: center;">
	This website has been simplified to support this browser.  It works much better in newer
	browsers such as Chrome, Firefox, or Internet Explorer 10.  For your convenience,
	links to these newer browsers are provided below.  If you would like to upgrade, just click
	the browser you would like and follow the installation instructions.<br><br>

	<div style="display: inline-block; *zoom: 1; *display: inline; margin: 0 30px;">
		<a style="border: 0; color: white; text-decoration: none;" href="https://www.google.com/intl/en_us/chrome/browser/">
			<img src="media/browser_chrome.png">
			<br><span style="text-decoration: underline;">Chrome</span>
		</a>
	</div>
	<div style="display: inline-block; *zoom: 1; *display: inline; margin: 0 30px;">
		<a style="border: 0; color: white; text-decoration: none;" href="http://www.mozilla.org/en-US/firefox/new/">
			<img src="media/browser_firefox.png">
			<br><span style="text-decoration: underline;">Firefox</span>
		</a>
	</div>
	<div style="display: inline-block; *zoom: 1; *display: inline; margin: 0 30px;">
		<a style="border: 0; color: white; text-decoration: none;" href="http://windows.microsoft.com/en-us/internet-explorer/ie-10-worldwide-languages">
			<img src="media/browser_ie10.png">
			<br><span style="text-decoration: underline;">IE 10</span>
		</a>
	</div>
</div>
</body>
</html>`;

function send(html, response) {
	response.writeHead(200, {
		"content-type": "text/html",
		"content-length": html.length
	});
	response.write(html);
	response.end();
}

function getDateString(date) {
	return `${dates.months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function getLocationHTML(location) {
	const urlLoc = location.replace(/ /g, "+");
	return `<h3 style='margin-bottom: 0;'>Location</h3><div style='margin-left: 30px;'>${location}<br><a href='https://maps.google.com/maps?q=${urlLoc}' target='_blank'><img src='http://maps.googleapis.com/maps/api/staticmap?sensor=false&zoom=11&size=200x150&center=${urlLoc}}&markers=${urlLoc}}'><br>Click for directions</a></div>`;
}

function getShowsHTML(shows) {
	const now = new Date();
	let html = false;

	for(let show of shows) {
		if(show.startDate > now || show.endDate > now) {
			if(!html) {
				html = "<h2 id='shows'>Upcoming Shows</h2>JOTC is sponsoring the following upcoming shows:<ol>";
			}
			html += "<li style='border 1px solid black; padding 10px; background-color: white;'>";
			html += `<span style='font-weight: bold;'>${dates.stringDateRange(show.startDate, show.endDate)}, ${show.title}</span>`;
			html += `<br>Registration ends ${getDateString(show.registrationDeadline)}`;

			if(show.description) {
				html += `<br><br>${show.description}`;
			}

			if(show.classes.length) {
				html += "<br><br>The following competition classes are included:<ul>";
				for(let c of show.classes) {
					html += `<li>${c}</li>`;
				}
				html += "</ul>";
			}

			if(show.location) {
				html += getLocationHTML(show.location);
			}

			if(show.registrationLink) {
				html += `<h3 style='margin-bottom: 0;'>Registration</h3><div style='margin-left: 30px;'><a href='${show.registrationLink}' target='_blank'>Click here to register</a></div>`;
			}

			if(show.files.length) {
				html += "<h3 style='margin-bottom: 0;'>Available Downloads:</h3><div style='margin-left: 30px;'>";
				let first = true;
				for(let file of show.files) {
					if(!first) {
						html += "<br>";
					}
					html += `<a href=${file.path}>${file.name}</a>`;
					first = false;
				}
				html += "</div>";
			}

			html += "</li>";
		}
	}
	if(html) {
		html += "</ol>";
	} else {
		html = "No upcoming shows.<br>";
	}

	return html;
}

module.exports = {
	name: "static",
	paths: {
		"/static": {
			"get"(req, res, next) {
				let output = HTML_START;

				db.shows.shows.find({}).sort({ "startDate": "asc" }).exec().then(shows => {
					console.log(shows);
					output += getShowsHTML(shows);
					output += HTML_END;
					send(output, res);
				});

				next();
			}
		}
	}
};
