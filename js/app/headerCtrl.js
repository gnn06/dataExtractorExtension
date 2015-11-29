myApp.controller('headerCtrl', ["$scope", '$route', '$location', '$routeParams', function ($scope, $route, $location, $routeParams) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
}]);