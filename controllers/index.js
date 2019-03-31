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
        .when("/dashboard", {
            templateUrl: "views/dashboard.html",
            controller: "dashboard"
        })
        .when("/calendar", {
            templateUrl: "views/calendar.html",
            controller: "calendar"
        })
        .when("/sources", {
            templateUrl: "views/sources.html",
            controller: "sources"
        })
        .when("/hardware", {
            templateUrl: "views/hardware.html",
            controller: "hardware"
        })
        .when("/simulator", {
            templateUrl: "views/simulator.html",
            controller: "simulator"
        })
        .when("/users", {
            templateUrl: "views/users.html",
            controller: "users"
        })
        .when("/stats", {
            templateUrl: "views/stats.html",
            controller: "stats"
        })
        .when("/attendance", {
            templateUrl: "views/attendance.html",
            controller: "attendance"
        })
        .when("/activities", {
            templateUrl: "views/activities.html",
            controller: "activities"
        })
        .when("/editor", {
            templateUrl: "views/editor.html",
            controller: "editor"
        })
        .when("/profile", {
            templateUrl: "views/profile.html",
            controller: "profile"
        });
})
.filter('trusted', ['$sce', function ($sce) {
    // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
    return $sce.trustAsResourceUrl;
 }])
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
            future: "dentro de %s",past: "hace %s",s: "pocos segundos",ss: "%d segundos",m: "un minuto",mm: "%d minutos",
            h: "una hora",hh: "%d horas",d: "un día",dd: "%d días",M: "un mes",MM: "%d meses",y: "un año",yy: "%d años"
        }
    });

    //// Utilidades ////
    
    $rootScope.greetings = function(){ // Saludo de bienvenida
        var split_afternoon = 12;
        var split_evening = 19; 
        var currentHour = parseFloat(moment().format("HH"));
        if(currentHour >= split_afternoon && currentHour <= split_evening)
            return "Buenas tardes";
        else if(currentHour >= split_evening)
            return "Buenas noches";
        else
            return "Buenos días";
    };

    $rootScope.readableTime = function(timestamp){ // Fecha y hora formal
        return moment(timestamp).format("DD/MM/YYYY HH:mm");
    };

    $rootScope.relativeTime = function(timestamp){ // Tiempo relativo al actual
        return moment(timestamp).fromNow();
    };

    $rootScope.readableFileSize = function(bytes, si) { // Devuelve tamanio de archivo en formato legible
        var thresh = si ? 1000 : 1024;
        if(Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si
            ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
            : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(Math.abs(bytes) >= thresh && u < units.length - 1);
        return bytes.toFixed(1)+' '+units[u];
    };

    // Inicializacion componentes de materialize
    $rootScope.sidenav = M.Sidenav.init(document.querySelector('.sidenav'), {
        side: "left", 
        inDuration:400,  
    });
    M.Collapsible.init(document.querySelector('.collapsible_1')).open();
    M.Collapsible.init(document.querySelector('.collapsible_2')).open();
    M.Modal.init(document.getElementById("about_modal"),{});
    M.Modal.init(document.getElementById("help_modal"),{});

    window.addEventListener("resize", function(){
        if($rootScope.resizeEvent)
            $rootScope.resizeEvent()
    });

    $rootScope.signOut = function(){ // Callback para el boton de salir
        $location.path("/login");
        $rootScope.userLogged = false;
        Cipressus.users.signOut()
        .then(function(res){
            console.log(res);
            $rootScope.user = null;
            M.toast({html: "Hasta pronto!",classes: 'rounded green darken-3',displayLength: 1500});
        })
        .catch(function(err){
            console.log(err[0]);
            M.toast({html: err[1],classes: 'rounded green darken-3',displayLength: 1500});
        });
    };

    $rootScope.sendHelp = function(){ // Enviar mensaje de ayuda a los usuarios administradores
        console.log($scope.helpMessage);
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
                if(private_data){ // Usuario aceptado por admin
                    $rootScope.user.admin = private_data.admin;
                    $rootScope.user.enrolled = private_data.enrolled;
                }else{ // Usuario no aceptado aun
                    $rootScope.user.admin = false;
                    $rootScope.user.enrolled = null;
                }

                // Monitoreo de actividad
                var browser = is.firefox() ? 'Firefox' : (is.chrome() ? 'Chrome' : (is.ie() ? 'IE' : (is.opera() ? 'Opera' : (is.safari() ? 'Safari' : 'Otro'))));
                var OS = is.ios() ? 'IOS' : (is.android() ? 'Android' : (is.windows() ? 'Windows' : (is.linux() ? 'Linux' : 'Otro')));
                var update_activity = public_data.activity; // Variable de monitoreo de actividad
                if(!update_activity)
                    update_activity = {
                        browser: {},
                        os: {},
                        last_login: 0
                    }
                update_activity.last_login = Date.now();
                if(update_activity.browser){ // Esta registrado la variable de navegador?
                    if(update_activity.browser[browser]) // Contar si existe
                        update_activity.browser[browser]++;
                    else // Si es la primera vez que usa este navegador, iniciar
                        update_activity.browser[browser] = 1;
                }else{ // Si no tiene variable de navegadores, inicializar
                    update_activity.browser = {};
                    update_activity.browser[browser] = 1;
                }
                if(update_activity.os){ // Puede que no este registrado este campo
                    if(update_activity.os[OS]) // Verificar si tiene este os contado
                        update_activity.os[OS]++; 
                    else // Si no tiene el os, inicializar
                        update_activity.os[OS] = 1;                
                }else{
                    update_activity.os = {};
                    update_activity.os[OS] = 1;
                }
                
                Cipressus.db.update(update_activity,'users_public/'+uid+'/activity').then(function(res){console.log("Actividad actualizada")}); // Actualizar logeo y dispositivo usado


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

    Cipressus.users.onUserSignedOut = function(){ // Cuando cierra la sesion (puede ser desde otro lugar)
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
    
    var isInStandaloneMode = function() { return ('standalone' in window.navigator) && (window.navigator.standalone); };
    
    if (is.ios() && !isInStandaloneMode()) {
       this.setState({ showInstallMessage: true });
    }

    window.addEventListener('beforeinstallprompt', function(e) {
        e.userChoice.then(function(choiceResult) {
            console.log(choiceResult.outcome);
            if(choiceResult.outcome == 'dismissed') {
                console.log('User cancelled home screen install');
            }
            else {
                console.log('User added to home screen');
            }
        });
    });
});