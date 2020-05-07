const gulp = require('gulp');
const shell = require('gulp-shell');
const workbox = require('workbox-build');

var clean = shell.task('rm -rf public/');

var hugo = shell.task('hugo');

function generateSW() {
	return workbox.generateSW({
		cacheId: 'pwapp',
		globDirectory: './public',
		globPatterns: [
			'**/*.{css,js,png,svg,eot,ttf,woff,woff2,otf}'
		],
		swDest: './public/sw.js',
		clientsClaim: true,
		skipWaiting: true,
		offlineGoogleAnalytics: true,
		maximumFileSizeToCacheInBytes: 50*1024*1024,
		runtimeCaching: [
			{
				urlPattern: /(?:\/)$/,
				handler: "NetworkFirst",
				options: {
					cacheName: "html",
					expiration: {
						maxAgeSeconds: 60*60*24*7,
					},
				},
			},
		],
	});
};

exports.default = gulp.series(clean, hugo, generateSW);
