var app = angular.module('cors', ['ionic']);
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*"
];

app.controller('PopupCtrl', function($scope) {

	$scope.active = true;
	$scope.urls = [];
	$scope.autoUpdate = false;
	$scope.url = '';

	function updateUrlsScope() {

	    chrome.storage.local.get({'urls': []}, function(result) {

	        var urls = result.urls;
            for ( var url in urls )
                if ( urls.hasOwnProperty(url) )
                    if ( $scope.urls.indexOf(urls[url]) === -1 ) {
                        chrome.extension.getBackgroundPage().log('adding', urls[url]);
                        $scope.urls.unshift(urls[url]);
                    }

            for ( var oldUrl in $scope.urls )
                if ( $scope.urls.hasOwnProperty(oldUrl) )
                    if ( urls.indexOf($scope.urls[oldUrl]) === -1 ) {
                        chrome.extension.getBackgroundPage().log('removing', $scope.urls[oldUrl]);
                        $scope.urls.splice(oldUrl, 1);
                    }

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