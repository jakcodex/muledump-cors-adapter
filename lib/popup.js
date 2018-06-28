var app = angular.module('cors', ['ionic']);
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*",
    "https://*.realmofthemadgod.com/*"
];

app.controller('PopupCtrl', function($scope) {

	$scope.active = true;
	$scope.urls = [];
	$scope.autoUpdate = false;
	$scope.url = '';
	$scope.version = chrome.extension.getBackgroundPage().version;

	function updateUrlsScope() {

	    chrome.storage.local.get({'urls': []}, function(result) {

	        if ( result.urls.length === 0 ) return;
            $scope.urls = result.urls;
            chrome.extension.getBackgroundPage().log('adding', $scope.urls);
            $scope.$apply();

	    });

    }

	chrome.storage.local.get({'active': true, 'urls': [], 'autoUpdate': false}, function(result) {

		$scope.active = result.active;
		$scope.urls = ( result.urls.length > 0 ) ? result.urls : defaultUrls;
		$scope.autoUpdate = result.autoUpdate;
		$scope.$apply();

        $scope.$watch('active', function(newValue, oldValue) {
            chrome.storage.local.set({'active': $scope.active}, function() {
                chrome.extension.getBackgroundPage().reload(updateUrlsScope);
            });
        });

        $scope.$watch('autoUpdate', function(newValue, oldValue) {
            chrome.storage.local.set({'autoUpdate': $scope.autoUpdate}, function() {
                chrome.extension.getBackgroundPage().reload(updateUrlsScope, true);
            });
        });

	});

    $scope.openInNewTab = function(url) {
        chrome.tabs.create({ url: url });
    };

    $scope.updateUrls = function() {
        chrome.extension.getBackgroundPage().log("MCR -- forcing URLs update");
        chrome.extension.getBackgroundPage().reload(updateUrlsScope, true);
    };

});