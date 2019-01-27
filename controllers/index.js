var app = angular.module('cipressus', ['ngRoute'])
.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "home"
        });
})
.run(function ($rootScope, $location) {

    firebase.initializeApp({ // Inicializar DB
        apiKey: "AIzaSyAHpgtsZeQbcoCbKNE1dNjd7gUbSIFWz6M",
        authDomain: "cipressus-0000.firebaseapp.com",
        databaseURL: "https://cipressus-0000.firebaseio.com",
        projectId: "cipressus-0000",
        storageBucket: "cipressus-0000.appspot.com",
        messagingSenderId: "927588929794"
    }); 

    // Descarga de prueba (sin reglas de seguridad)
    firebase.database() .ref('/').once('value') 
        .then(function(snapshot){
            console.log(snapshot.val());
            M.toast({html: 'DB Descargada', classes: 'rounded green', displayLength: 1500}); // Mensaje para el usuario
        })
        .catch(function(res){
            console.log(res);
            M.toast({html: 'Error al leer la base de datos', classes: 'rounded red', displayLength: 1500}); // Mensaje para el usuario
        });

    console.log("App lista");
});