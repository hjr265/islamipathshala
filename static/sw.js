// Copyright 2020 Furqan Software Ltd. All rights reserved.

self.addEventListener('install', function(event) {
	self.skipWaiting()
});

self.addEventListener('fetch', function(event) {
	
});

self.addEventListener('activate', function(event) {
	self.clients.claim()
});
