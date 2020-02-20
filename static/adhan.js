// Prayer Times

var coords,
	alpha = 0;

function update() {
	if (!coords) {
		return;
	}

	var now = moment()
	
	var url = '//api.aladhan.com/v1/timings/'+now.format('DD-MM-YYYY')+'?latitude='+coords.latitude+'&longitude='+coords.longitude+'&method=4';
	fetch(url, {
		mode: 'cors',
		credentials: 'same-origin'
	})
	.then(function(resp) {
		return resp.json();
	})
	.then(function(body) {
		render(body.data.timings);
		// localStorage.set('adhan:timings:'+now.format('DD-MM-YYYY'), body.data.timings);
	});
}

function render(timings) {
	Object.keys(timings).forEach(function(k) {
		var timing = timings[k];
		document.body.querySelector("#"+k.toLowerCase()).textContent = moment(timing, 'HH:mm').format('h:mm A');
	});
}

function log(message) {
	if (location.hash !== '#debug') {
		return;
	}
	var el = document.getElementById('logs');
	var l = document.createElement('div');
	l.innerText = message;
	el.insertBefore(l, el.firstChild);
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
}
