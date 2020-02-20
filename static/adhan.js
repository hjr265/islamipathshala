(function() {
	// Prayer Times

	var coords,
		alpha = 0;

	function update() {
		if (!coords) {
			return;
		}

		var now = moment();

		var cachedData = localStorage.getItem('adhan:timings');
		if (cachedData) {
			cachedData = JSON.parse(cachedData);

			render(cachedData.timings, cachedData.date);

			if (now.diff(cachedData.cachedAt, 'hours') < 4 &&
					Math.abs(coords.latitude-cachedData.meta.latitude) < 0.0004 && 
					Math.abs(coords.longitude-cachedData.meta.longitude) < 0.0004) {
				return;
			}
		}
		
		var url = '//api.aladhan.com/v1/timings/'+now.format('DD-MM-YYYY')+'?latitude='+coords.latitude+'&longitude='+coords.longitude+'&method=4';
		log('Fetching '+url);
		fetch(url, {
			mode: 'cors',
			credentials: 'same-origin'
		})
		.then(function(resp) {
			return resp.json();
		})
		.then(function(body) {
			render(body.data.timings, body.data.date);
			localStorage.setItem('adhan:timings', JSON.stringify({
				timings: body.data.timings,
				date: body.data.date,
				meta: body.data.meta,
				cachedAt: now.toDate()
			}));
		});
	}

	function render(timings, date) {
		document.body.querySelector('#gregorian').textContent = date.gregorian.day+' '+date.gregorian.month.en+' '+date.gregorian.year;
		document.body.querySelector('#hijri').textContent = date.hijri.day+' '+date.hijri.month.en+' '+date.hijri.year;
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

})()
