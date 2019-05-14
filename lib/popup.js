var app = angular.module('cors', ['ionic']);
var defaultUrls = [
    "https://realmofthemadgodhrd.appspot.com/*",
    "https://rotmgtesting.appspot.com/*",
    "https://*.realmofthemadgod.com/*"
];

app.controller('UaCtrl', function($scope) {

    $scope.ua = true;
    chrome.storage.local.get({'ua': true}, function(result) {

        $scope.ua = result.ua;
        $scope.$apply();

        //  commit changes to ua
        $scope.$watch('ua', function() {
            chrome.storage.local.set({'ua': $scope.ua});
        });

    });

});

app.controller('PopupCtrl', function($scope) {

	$scope.active = true;
	$scope.urls = [];
	$scope.url = '';
	$scope.version = chrome.extension.getBackgroundPage().version;

    //  load ui
	chrome.storage.local.get({'active': true, 'urls': []}, function(result) {

		$scope.active = result.active;
		$scope.urls = ( result.urls.length > 0 ) ? result.urls : defaultUrls;
		$scope.$apply();

        $scope.$watch('active', function(newValue, oldValue) {
            chrome.storage.local.set({'active': $scope.active}, function() {
                chrome.extension.getBackgroundPage().ga('send', 'event', {
                    eventCategory: 'State',
                    eventAction: 'active',
                    eventLabel: ( $scope.active === true ) ? 'true' : 'false'
                });
                chrome.extension.getBackgroundPage().log('Active: status set to ' + $scope.active);
                chrome.extension.getBackgroundPage().reload();
            });
        });

	});

	//  open link in new tab
    $scope.openInNewTab = function(url) {
        chrome.tabs.create({ url: url });
        chrome.extension.getBackgroundPage().ga('send', 'event', {
            eventCategory: 'UI Outbound Link',
            eventAction: 'click',
            eventLabel: url
        });
    };

});

chrome.extension.getBackgroundPage().ga('send', 'pageview', window.location.pathname);
