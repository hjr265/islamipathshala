(function() {
	var digitsBn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
	var digitsAr = ["٠" ,"١" ,"٢" ,"٣" ,"٤" ,"٥" ,"٦" ,"٧" ,"٨", "٩"];
	var monthsBn = ["", "জানুয়ারী", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "অগাস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
	var monthsAr = ["", "مُحَرَّم", "صَفَر", "رَبِيْعُ الأَوّل", "رَبِيْعُ الثَّانِي", "جَمَادِي الأَوّل", "جَمَادِي الثَّانِي", "رَجَب", "شَعْبَان", "رَمَضَان", "شَوَّال", "ذُوالْقَعْدَة", "ذُوالْحِجَّة"];

	function numberBn(s) {
		return s.replace(/\d/g, function(c) {
			return digitsBn[parseInt(c)];
		});
	}

	function numberAr(s) {
		return s.replace(/\d/g, function(c) {
			return digitsAr[parseInt(c)];
		});
	}

	function meridiemBn(s) {
		return s.replace("AM", "পূর্বাহ্ণ").replace("PM", "অপরাহ্ণ");
	}

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
		
		var url = '//api.aladhan.com/v1/timings/'+now.unix()+'?latitude='+coords.latitude+'&longitude='+coords.longitude+'&method=4';
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
		document.body.querySelector('#gregorian').textContent = numberBn(date.gregorian.day)+' '+monthsBn[date.gregorian.month.number]+' '+numberBn(date.gregorian.year);
		document.body.querySelector('#hijri').textContent = numberAr(date.hijri.day)+' '+monthsAr[date.hijri.month.number]+' '+numberAr(date.hijri.year);
		document.body.querySelector('#hijri').setAttribute('uk-tooltip', date.hijri.day+' '+date.hijri.month.en+' '+date.hijri.year);
		var current = null;
		Object.keys(timings).forEach(function(k) {
			if (['Imsak', 'Midnight'].indexOf(k) !== -1) {
				return;
			}
			var timing = moment(timings[k], 'HH:mm');
			document.body.querySelector("#"+k.toLowerCase()).textContent = meridiemBn(numberBn(timing.format('h:mm A')));
			console.log(k, timing.isBefore())
			if (timing.isBefore()) {
				current = k;
			}
		});
		if (current) {
			document.body.querySelector("#"+current.toLowerCase()).parentNode.classList.add('uk-text-primary');
		}
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
