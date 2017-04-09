var myApp = angular.module('dataExtractorApp', ["ngMessages", "ngRoute", 'ngTextcomplete']);

myApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when("/univers/", {
	templateUrl : "view/univers.html",
	controller : "universCtrl"
  })
  .when("/univers/:univer/data", {
	templateUrl : "view/data.html",
	controller : "dataCtrl"
  })
  .when("/univers/:univer/template", {
	templateUrl : "view/template.html",
	controller : "templateCtrl"
  })
  .when("/univers/:univer/extractors", {
	templateUrl : "view/extractors.html",
	controller : "extractorListCtrl"
  })
  .when("/univers/:univer/extractor/:extractor?", {
	templateUrl : "view/extractor.html",
	controller : "extractorCtrl"
  })
  .when("/univers/:univer/searchers", {
	templateUrl : "view/searchers.html",
	controller : "searcherListCtrl"
  })
  .when("/univers/:univer/searcher/:searcher?", {
	templateUrl : "view/searcher.html",
	controller : "searcherCtrl"
  })
  .otherwise({redirectTo: '/univers/'});
});

/* needed to make href without unsafe
 * cf https://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page/15769779#15769779
 */
myApp.config( [
    '$compileProvider',
    function( $compileProvider )
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
