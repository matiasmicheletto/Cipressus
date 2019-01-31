var app = angular.module('cipressus', ['ngRoute', 'ngSanitize'])
.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "home"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "login"
        })
        .when("/profile", {
            templateUrl: "views/profile.html",
            controller: "profile"
        })
        .when("/scores", {
            templateUrl: "views/scores.html",
            controller: "scores"
        })
        .when("/activities", {
            templateUrl: "views/activities.html",
            controller: "activities"
        })
        .when("/calendar", {
            templateUrl: "views/calendar.html",
            controller: "calendar"
        });
})
.config(['$locationProvider', function($locationProvider) {
    // Ver: https://stackoverflow.com/questions/41272314/angular-all-slashes-in-url-changed-to-2f
    $locationProvider.hashPrefix('');
  }])
.run(function ($rootScope, $location) {

    $rootScope.loading = true; // Preloader
    $rootScope.userLogged = false; // Indicador de usuario logeado para habilitar componentes de ventana
    $location.path("/login"); // Ir a vista de logeo

    // Configuracion de moment.js
    moment.locale('es', {
        relativeTime : {
            future: "en %s",past: "hace %s",s: "pocos segundos",ss: "%d segundos",m: "un minuto",mm: "%d minutos",
            h: "una hora",hh: "%d horas",d: "un día",dd: "%d días",M: "un mes",MM: "%d meses",y: "un año",yy: "%d años"
        }
    });

    // Inicializacion componentes de materialize
    $rootScope.sidenav = M.Sidenav.init(document.querySelector('.sidenav'), {
        side: "left", 
        inDuration:400,  
    });
    M.Collapsible.init(document.querySelector('.collapsible_1'));
    M.Collapsible.init(document.querySelector('.collapsible_2')).open();
    M.Modal.init(document.getElementById("about_modal"),{});
    M.Modal.init(document.getElementById("help_modal"),{});

    $rootScope.signOut = function(){
        Cipressus.users.signOut()
        .then(function(res){
            M.toast({html: res,classes: 'rounded green',displayLength: 1500});
        })
        .catch(function(err){
            console.log(err[0]);
            M.toast({html: err[1],classes: 'rounded green',displayLength: 1500});
        });
    }

    $rootScope.sendHelp = function(){ // Enviar mensaje de ayuda a los usuarios administradores
        M.toast({html: "Mensajería aún no implementada!",classes: 'rounded red',displayLength: 2500});
    };

    Cipressus.users.onUserSignedIn = function(uid){ // Cuando el usuario se logea o si estaba logeado al actualizar pagina
        $rootScope.loading = true;
        Cipressus.db.get('users_public/'+uid) // Descargar datos publicos de usuario
        .then(function(public_data){
            $rootScope.user = public_data;
            $rootScope.user.uid = uid;
            Cipressus.db.get('users_private/'+uid) // Descargar datos privados de usuario
            .then(function(private_data){
                if(private_data){ // Usuario no aceptado aun
                    $rootScope.user.admin = private_data.admin;
                    $rootScope.user.enrolled = private_data.enrolled;
                }else{
                    $rootScope.user.admin = false;
                    $rootScope.user.enrolled = -1;
                }
                Cipressus.db.update({last_login:Date.now()},'users_public/'+uid); // Actualizar fecha y hora
                if($location.path() == "/login") // Si se acaba de logear en la vista de login
                    $location.path("/"); // Ir a vista de home
                $rootScope.userLogged = true;
                $rootScope.loading = false;
                $rootScope.$apply(); 
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
            });
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});
        });
    };

    Cipressus.users.onUserSignedOut = function(){ // Cuando cierra sesion
        $rootScope.sidenav.close();
        $rootScope.userLogged = false;
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