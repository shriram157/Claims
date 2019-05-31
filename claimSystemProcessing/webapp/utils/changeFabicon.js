document.head || (document.head = document.getElementsByTagName('head')[0]);

function changeFavicon(src) {
	var link = document.createElement('link');
	link.type = "image/png";
	link.rel = 'shortcut icon';
	link.href = src;
	document.head.appendChild(link);
}

function tranletTitle(oText) {
	var otitle = document.createElement('title');
	otitle.innerHTML = oText;
	document.head.appendChild(otitle);
}

var isDivisionSent = window.location.search.match(/Division=([^&]*)/i);

var sSelectedLocale;
//  get the locale to determine the language.
var isLocaleSent = window.location.search.match(/language=([^&]*)/i);
if (isLocaleSent) {
	sSelectedLocale = window.location.search.match(/language=([^&]*)/i)[1];
} else {
	sSelectedLocale = "en"; // default is english
}

if (isDivisionSent) {
	this.sDivision = window.location.search.match(/Division=([^&]*)/i)[1];

	if (this.sDivision == "10") {
		changeFavicon("images/favicon-16x16.png");
	} else if (this.sDivision == "20") {
		changeFavicon("images/faviconL-32x32.png");
	} else {
		changeFavicon("images/favicon-16x16.png");
	}

} else {
	changeFavicon("images/favicon-16x16.png");
}

if (sSelectedLocale === "en") {
	tranletTitle("Claim Processing");
} else {
	tranletTitle("Application de traitement des réclamations");
}