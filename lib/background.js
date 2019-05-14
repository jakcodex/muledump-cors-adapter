var analytics;
var version = '1.1.5';
var gaID = 'UA-111254659-6';
var loaded = false;
var cid = Date.now();
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*",
    "https://*.realmofthemadgod.com/*"
];
var debug = false;
var allurls = false;

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

	//  generate a sanitized url (details.url without the query string)
	var url = details.url.substring(0, details.url.indexOf('?') === -1 ? details.url.length : details.url.indexOf('?'));
	if ( debug === true ) console.log('MCA considering: ', url);

	//  all ajax requests from jakcodex projects include `__source=jakcodex-`
	if ( details.url.match(/(__source=jakcodex-)/) ) {

		if ( debug === true ) console.log('MCA modifying: ' + url);

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

		//  add an extension header so the request source can see this extension handled the request
		details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});
		details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": "X-Jakcodex-CORS"});
		details.responseHeaders.push({"name": "X-Jakcodex-CORS", "value": version});

		//  send usage analytics for the rewritten request if enabled
		var last = url.substring(url.lastIndexOf('/'));
		if (
			last.indexOf('.') === -1 &&
			last !== '/'
		) ga('send', 'event', {
			eventCategory: 'Header Rewrite',
			eventAction: 'muledump',
			eventLabel: url
		});

	}

	return {responseHeaders: details.responseHeaders};
	
};

//  reload settings
function reload(init) {

    loaded = true;
	if ( init === true ) console.log('MCA: Reloading...', new Date);
	chrome.storage.local.get({'active': true, 'ua': true, 'cid': false}, function(result) {

		if ( result.cid === false ) chrome.storage.local.set({cid: cid});
		if ( result.cid !== false ) cid = result.cid;
		console.log('MCA: Config - ' + JSON.stringify({active: result.active, ua: result.ua}));

		//  set state
		result.active ? on() : off();

		//  record load state, platform, and version
		ga('send', 'event', {
			eventCategory: 'State',
			eventAction: 'loaded'
		});

		ga('send', 'event', {
			eventCategory: 'Platform',
			eventAction: 'chrome',
			eventLabel: version
		});

	});

}

//  activate extension and add listener
function on() {

	//  enabled
	console.log('MCA: Listening for URLs: ', defaultUrls.join(', '));
	chrome.webRequest.onHeadersReceived.removeListener(responseListener);
	chrome.webRequest.onHeadersReceived.addListener(responseListener, {
		urls: (allurls === true) ? ["<all_urls>"] : defaultUrls
	}, ["blocking", "responseHeaders"]);
	chrome.browserAction.setIcon({path: "lib/on.png"});

}

//  deactivate extension and disable listener
function off() {

	//  disabled
	console.log('MCA: Disabled');
	chrome.browserAction.setIcon({path: "lib/off.png"});
	chrome.webRequest.onHeadersReceived.removeListener(responseListener);

}

//  wrapper for google analytics to dump all activity to console
function ga() {

	var gaargs = arguments;
	chrome.storage.local.get({'ua': true}, function(result) {

		//  do not run if analytics is disabled
		if ( result.ua === false ) return;

		var args = ['UA:'];
		for ( var i = 0; i < gaargs.length; i++ ) args.push(gaargs[i]);
		console.log.apply(null, args);
		var request = new XMLHttpRequest();
		var message = "v=1&tid=" + gaID + "&cid=" + cid + "&aip=1&ds=chrome-addon";
		if ( gaargs[1] === 'pageview' ) message += "&t=pageview&dp=" + ( (gaargs[2]) ? gaargs[2] : 'ui.html' );
		if ( gaargs[1] === 'event' ) message += "&t=event&ec=" + (gaargs[2].eventCategory || '') + "&ea=" + (gaargs[2].eventAction || '') + "&el=" + (gaargs[2].eventLabel || '');
		request.open("POST", "https://www.google-analytics.com/collect", true);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		request.send(message);

	});

}

//  toggle use of <all_urls> for debugging
function toggle_allurls(d) {

	if ( typeof d === 'boolean' ) debug = d;
	allurls = !allurls;
	reload();

}

//  we'll reload on startup in case it didn't initialize with the browser
setTimeout(function() { if ( loaded === false ) {
	console.log('MCA: Recovery startup reload');
	reload(true);
} }, 1000);
