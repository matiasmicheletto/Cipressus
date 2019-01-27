var app = angular.module('cipressus', ['ngRoute'])
.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "home"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "login"
        });
})
.run(function ($rootScope, $location) {

    $rootScope.loading = true; // Preloader
    $location.path("/login"); // Ir a vista de logeo

    Cipressus.users.onUserSignedIn = function(uid){ // Cuando el usuario se logea
        console.log(uid);
        
        // TODO: Descargar datos de usuario

        $location.path("/"); // Ir a vista de home
        $rootScope.loading = false; // Preloader
        $rootScope.$apply();
    };

    Cipressus.users.onUserSignedOut = function(){ // Cuando cierra sesion
        $location.path("/login"); // Ir a vista de logeo
        $rootScope.loading = false; // Preloader
        $rootScope.$apply();
    };

    Cipressus.initialize() // Inicializar libreria principal de la app
    .then(function(){ // Inicializacion exitosa
        console.log("Cipressus inicializado.");
        $rootScope.loading = false;
        $rootScope.$apply();
    })
    .catch(function(){ // Error en inicializacion
        console.log("Error de incialización de Cipressus");
        $rootScope.loading = false;
        $rootScope.$apply();
    });     
});