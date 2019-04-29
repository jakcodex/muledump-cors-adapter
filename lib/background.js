var analytics;
var version = '1.1.0';
var loaded = false;
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*",
    "https://*.realmofthemadgod.com/*"
];

//  post-installation
chrome.runtime.onInstalled.addListener(function(){
	console.log('MCA: Installed');
	reload();
});

//  provide a console logging method accessible from the frontend
function log() {

	console.log.apply(null, arguments);

}

//  insert cors headers on appropriate requests
var responseListener = function(details){
	var flag = false,
	rule = {
		"name": "Access-Control-Allow-Origin",
		"value": "*"
	};

	//  update the header if it is already present
	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.responseHeaders[i].value = rule.value;
			break;
		}
	}

	//  add the header if it wasn't already present
	if (!flag) details.responseHeaders.push(rule);
	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

	//  add an extension header so the request source can see this extension handled the request
	details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": "X-Jakcodex-CORS"});
    details.responseHeaders.push({"name": "X-Jakcodex-CORS", "value": version});


    var url = details.url.substring(0, details.url.indexOf('?') === -1 ? details.url.length : details.url.indexOf('?'));
	ga('send', 'event', {
		eventCategory: 'Header Rewrite',
		eventAction: 'muledump',
		eventLabel: details.url.substring(0, details.url.indexOf('?'))
	});
	return {responseHeaders: details.responseHeaders};
	
};

//  we'll reload on startup in case it didn't initialize with the browser
setTimeout(function() { if ( loaded === false ) {
	console.log('MCA: Recovery startup reload');
	reload(true);
} }, 1000);

//  reload settings
function reload(init) {
    loaded = true;
	if ( init === true ) console.log('MCA: Reloading...', new Date);
	chrome.storage.local.get({'active': true, 'ua': true}, function(result) {

		console.log('MCA: Config - ' + JSON.stringify({active: result.active, ua: result.ua}));
		loadga();

		if(result.active) {

			chrome.browserAction.setIcon({path: "lib/on.png"});

			console.log('MCA: Listening for URLs: ', defaultUrls.join(', '));

			if ( typeof init === 'function' ) init();

			chrome.webRequest.onHeadersReceived.removeListener(responseListener);

			/*Add Listeners*/
			chrome.webRequest.onHeadersReceived.addListener(responseListener, {
				urls: defaultUrls
			}, ["blocking", "responseHeaders"]);

		} else {

			console.log('MCA: Disabled');
            chrome.browserAction.setIcon({path: "lib/off.png"});
            chrome.webRequest.onHeadersReceived.removeListener(responseListener);

		}
	});
}

//  wrapper for google analytics to dump all activity to console
function ga() {
	var gaargs = arguments;
	chrome.storage.local.get({'ua': true}, function(result) {

		//  do not run if analytics is disabled
		if ( result.ua === false ) return;

		if ( typeof analytics !== 'function' ) loadga();

		var args = ['UA:'];
		for ( var i = 0; i < gaargs.length; i++ ) args.push(gaargs[i]);
		console.log.apply(null, args);
		analytics.apply(null, gaargs);

	});
}

//  load google analytics
function loadga() {

	chrome.storage.local.get({'ua': true}, function(result) {

		//  do not run if analytics is disabled
		if (result.ua === false) return;

		//  load google analytics on first call
		if (typeof analytics !== 'function') {

			console.log('UA: Loading');

			//  load google analytics
			(function (i, s, o, g, r, a, m) {
				i['GoogleAnalyticsObject'] = r;
				i[r] = i[r] || function () {
					(i[r].q = i[r].q || []).push(arguments)
				}, i[r].l = 1 * new Date();
				a = s.createElement(o),
					m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a, m)
			})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'analytics');

			//  create analytics instance
			ga('create', 'UA-111254659-6', 'auto');

			ga('send', 'event', {
				eventCategory: 'State',
				eventAction: 'loaded'
			});

		}

	});

}

//  unload google analytics
function unloadga() {

	if ( typeof analytics !== 'function' ) return;
	analytics('remove');
	analytics = undefined;
	console.log('UA: Unloaded');

}
