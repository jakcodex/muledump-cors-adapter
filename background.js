var accessControlRequestHeaders;
var updateTimer = false;
var updateTTL = 8640000;
var loaded = false;
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*"
];

//  download latest urls from github
var updateUrls = function(callback, force) {

	function LogUpdate(data) {
        chrome.storage.local.set({'updateLog': data});
	}

	function Done(json) {

		var data;
		try {
            data = JSON.parse(json);
		} catch (e) {}
        if ( data ) {
            console.log('MCR -- Received updated URLs');
			chrome.storage.local.set({'urls': data}, function() {

                LogUpdate({
                    state: true,
                    date: (new Date).valueOf()
                });
                callback(data);

			});

            return;
        }

        console.log('MCR -- URLs update received invalid response');
        LogUpdate({
            state: false,
			stage: 'done',
            date: (new Date).valueOf()
        });
        callback();

	}

	function Fail() {
        console.log('MCR -- URLs update request failed');
        LogUpdate({
            state: false,
			stage: 'fail',
            date: (new Date).valueOf()
        });
        callback();
	}

    chrome.storage.local.get({'autoUpdate': false, 'updateLog': {
		state: false,
		date: new Date(2017, 0, 1).valueOf()
	}}, function(result) {

    	if ( result.autoUpdate === false && force !== true ) {

    		console.log('MCR -- skipping auto updates');
    		callback();
    		return;

		}

    	var date = (new Date).valueOf();
    	if ( force === true || (result.autoUpdate === true && date-result.updateLog.date >= updateTTL) ) {

    		console.log('MCR -- Requesting updated URLS list...');
    		var xhr = new XMLHttpRequest();
    		xhr.open("GET", 'https://jakcodex.github.io/muledump-cors-adapter/url-list.json', true);
    		xhr.onload = function() {
				Done(xhr.responseText);
			};
    		xhr.ontimeout = Fail;
    		xhr.onerror = Fail;
    		xhr.abort = Fail;
            xhr.send();

        } else {

            console.log('MCR -- Using cached URLs', (300000-(date-result.updateLog.date)));
            callback();

		}

    });

};

var requestListener = function(details){
	var flag = false,
		rule = {
			name: "Origin",
			value: "https://jakcodex.github.io/"
		};
	var i;

	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.requestHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.requestHeaders.push(rule);
	
	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === "access-control-request-headers") {
			accessControlRequestHeaders = details.requestHeaders[i].value	
		}
	}	
	
	return {requestHeaders: details.requestHeaders};
};

var responseListener = function(details){
	var flag = false,
	rule = {
			"name": "Access-Control-Allow-Origin",
			"value": "*"
		};

	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.responseHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.responseHeaders.push(rule);

	if (accessControlRequestHeaders) {

		details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders});

	}

	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

	return {responseHeaders: details.responseHeaders};
	
};

/*On install*/
chrome.runtime.onInstalled.addListener(function(){
	//chrome.storage.local.set({'active': true});
    //chrome.storage.local.set({'urls': defaultUrls});
    //chrome.storage.local.set({'autoUpdate': false});
	reload();
	console.log('MCR -- installed');
});

//  we'll reload on startup
setTimeout(function() { if ( loaded === false ) {
	reload(true)
} }, 1000);

function startUpdateTimer() {
    updateTimer = setInterval(reload, updateTTL);
}

function log(a, b) {

	console.log('popup.js', a, b);

}

/*Reload settings*/
function reload(init, force) {
    loaded = true;
	if ( init === true ) console.log('MCR -- init', new Date);
	chrome.storage.local.get({'active': true, 'urls': []}, function(result) {

		if(result.active) {

			chrome.browserAction.setIcon({path: "on.png"});

			console.log('MCR -- reloading');
            updateUrls(function(urls) {

            	if ( !urls ) urls = ( result.urls.length === 0 ) ? defaultUrls : result.urls;
            	if ( typeof urls !== 'object' ) urls = defaultUrls;
            	if ( urls.length < 1 ) urls = defaultUrls;
                console.log('MCR -- Listening to URLs', urls);

                if ( typeof init === 'function' ) init();

                chrome.webRequest.onHeadersReceived.removeListener(responseListener);
                chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

				/*Add Listeners*/
				chrome.webRequest.onHeadersReceived.addListener(responseListener, {
					urls: urls
				}, ["blocking", "responseHeaders"]);

				chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {
					urls: urls
				}, ["blocking", "requestHeaders"]);

			}, force);

		} else {

			console.log('MCR -- disabled');
            chrome.browserAction.setIcon({path: "off.png"});
            chrome.webRequest.onHeadersReceived.removeListener(responseListener);
            chrome.webRequest.onBeforeSendHeaders.removeListener(requestListener);

		}
	});
}
