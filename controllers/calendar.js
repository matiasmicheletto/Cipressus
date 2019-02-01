app.controller("calendar", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();

    jsCalendar.new(document.getElementById("calendar"),null,{language : "es"});

}]);