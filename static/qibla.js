function toRadians(degrees) {
	return degrees * Math.PI / 180;
};

function toDegrees(radians) {
	return radians * 180 / Math.PI;
}

function bearing(startLat, startLng, destLat, destLng){
	startLat = toRadians(startLat);
	startLng = toRadians(startLng);
	destLat = toRadians(destLat);
	destLng = toRadians(destLng);

	y = Math.sin(destLng - startLng) * Math.cos(destLat);
	x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
	b = Math.atan2(y, x);
	b = toDegrees(b);
	return (b + 360) % 360;
}

// Compass

var coords,
	alpha = 0;

function update() {
	if (!coords) {
		return;
	}
	var b = bearing(coords.latitude, coords.longitude, 21.422487, 39.826206);
	rotate((b-(360-alpha)%360)%360);
	log(`bearing = ${b}, alpha = ${alpha}`);
}

function rotate(angle) {
	document.getElementById('compass').style.transform = 'rotate(' + angle + 'deg)';
}

function log(message) {
	if (location.hash !== '#debug') {
		return;
	}
	var logs = document.getElementById('logs');
	var line = document.createElement('div');
	line.innerText = message;
	logs.insertBefore(l, logs.firstChild);
}

if (navigator.geolocation && window.DeviceOrientationEvent) {
	navigator.geolocation.getCurrentPosition(function(pos) {
		coords = pos.coords;
		update();
	}, function(err) {
		document.getElementById('noLocation').style.display = 'block';
	}, {
		enableHighAccuracy: false,
		timeout: 15000,
		maximumAge: 0
	});
	
	if ('ondeviceorientationabsolute' in window) {
		window.addEventListener('deviceorientationabsolute', function() {
			alpha = event.alpha;
			update();
		}, false);
	} else if ('ondeviceorientation' in window) {
		window.addEventListener('deviceorientation', function() {
			if ('webkitCompassHeading' in event) {
				alpha = event.webkitCompassHeading;
			} else if (event.absolute) {
				alpha = event.alpha;
			} else {
				log("Couldn't get absolute device orientation.");
			}
			update();
		}, false);
	} else {
		document.getElementById('noCompass').style.display = 'block';
	}
}
