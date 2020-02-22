(function() {
	var digitsBn = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
	var digitsAr = ["٠" ,"١" ,"٢" ,"٣" ,"٤" ,"٥" ,"٦" ,"٧" ,"٨", "٩"];
	var monthsBn = ["", "জানুয়ারী", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "অগাস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
	var monthsAr = ["", "مُحَرَّم", "صَفَر", "رَبِيْعُ الأَوّل", "رَبِيْعُ الثَّانِي", "جَمَادِي الأَوّل", "جَمَادِي الثَّانِي", "رَجَب", "شَعْبَان", "رَمَضَان", "شَوَّال", "ذُوالْقَعْدَة", "ذُوالْحِجَّة"];
	var prayersAr = {
		'Fajr': 'ফজর',
		'Dhuhr': 'যুহর',
		'Asr': 'আছর',
		'Maghrib': 'মাগরিব',
		'Isha': 'ইশা'
	};

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

	var coords;

	function update() {
		if (!coords) {
			return;
		}

		var now = moment();

		var data = localStorage.getItem('adhan:timings');
		if (data) {
			data = JSON.parse(data);

			var card = document.querySelector('#adhan.uk-card');
			if (card) {
				renderCard(card, data.timings, data.date);
			} else {
				render(data.timings, data.date);
			}

			if (now.diff(data.cachedAt, 'hours') < 4 &&
					Math.abs(coords.latitude-data.meta.latitude) < 0.0004 && 
					Math.abs(coords.longitude-data.meta.longitude) < 0.0004) {
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
			var card = document.querySelector('#adhan.uk-card');
			if (card) {
				renderCard(card, body.data.timings, body.data.date);
			} else {
				render(body.data.timings, body.data.date);
			}
			localStorage.setItem('adhan:timings', JSON.stringify({
				timings: body.data.timings,
				date: body.data.date,
				meta: body.data.meta,
				cachedAt: now.toDate()
			}));
		})
		.catch(function() {
			document.getElementById('noInternet').style.display = 'block';
		});
	}

	function renderCard(card, timings, date) {
		card.style.display = '';
		card.querySelector('.gregorian').textContent = numberBn(date.gregorian.day)+' '+monthsBn[date.gregorian.month.number]+' '+numberBn(date.gregorian.year);
		card.querySelector('.hijri').textContent = numberAr(date.hijri.day)+' '+monthsAr[date.hijri.month.number]+' '+numberAr(date.hijri.year);
		var current = null;
		Object.keys(timings).forEach(function(k) {
			if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].indexOf(k) === -1) {
				return;
			}
			var timing = moment(timings[k], 'HH:mm');
			if (!current && timing.isAfter()) {
				current = k;
			}
		});
		if (current) {
			var timing = moment(timings[current], 'HH:mm');
			card.querySelector('.uk-card-title').textContent = prayersAr[current]+' — '+meridiemBn(numberBn(timing.format('h:mm A')));
		}
	}

	function render(timings, date) {
		document.body.querySelector('#gregorian').textContent = numberBn(date.gregorian.day)+' '+monthsBn[date.gregorian.month.number]+' '+numberBn(date.gregorian.year);
		document.body.querySelector('#hijri').textContent = numberAr(date.hijri.day)+' '+monthsAr[date.hijri.month.number]+' '+numberAr(date.hijri.year);
		document.body.querySelector('#hijri').setAttribute('uk-tooltip', date.hijri.day+' '+date.hijri.month.en+' '+date.hijri.year);
		var current = null;
		Object.keys(timings).forEach(function(k) {
			var timing = moment(timings[k], 'HH:mm');
			var cell = document.body.querySelector("#"+k.toLowerCase());
			if (!cell) {
				return;
			}
			cell.textContent = meridiemBn(numberBn(timing.format('h:mm A')));
			if (timing.isBefore()) {
				current = k;
			}
		});
		if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].indexOf(current) !== -1) {
			document.body.querySelector("#"+current.toLowerCase()).parentNode.classList.add('uk-text-primary');
		}
	}

	function log(message) {
		if (location.hash !== '#debug') {
			return;
		}
		var logs = document.getElementById('logs');
		var line = document.createElement('div');
		line.innerText = message;
		logs.insertBefore(line, logs.firstChild);
	}

	if (navigator.geolocation && window.DeviceOrientationEvent) {
		navigator.geolocation.getCurrentPosition(function(pos) {
			coords = pos.coords;
			update();
			localStorage.setItem('adhan:active', true);
		}, function(err) {
			var notice = document.getElementById('noLocation')
			notice.style.display = 'block';
			localStorage.setItem('adhan:active', false);
		}, {
			enableHighAccuracy: false,
			timeout: 15000,
			maximumAge: 0
		});
	}
})()
