app.controller("calendar", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    $rootScope.sidenav.close();

    jsCalendar.new(document.getElementById("calendar"),null,{language : "es"});

}]);