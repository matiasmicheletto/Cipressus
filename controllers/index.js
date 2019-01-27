var app = angular.module('cupressus', ['ngRoute'])
.config(function($routeProvider) {
    $routeProvider
    .when("/", { templateUrl : "views/home.html", controller: "home" });
})
.run(function($rootScope,$location){
    console.log("App lista");
});