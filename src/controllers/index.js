var app = angular.module('cipressus', ['ngRoute', 'ngSanitize','LocalStorageModule'])
.config(["$routeProvider",function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "home"
        })
        .when("/home", {
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
        .when("/submissions", {
            templateUrl: "views/submissions.html",
            controller: "submissions"
        })
        .when("/hardware", {
            templateUrl: "views/hardware.html",
            controller: "hardware"
        })
        .when("/analizer", {
            templateUrl: "views/analizer.html",
            controller: "analizer"
        })        
        .when("/simulator", {
            templateUrl: "views/simulator.html",
            controller: "simulator"
        })
        .when("/kMaps", {
            templateUrl: "views/kMaps.html",
            controller: "kMaps"
        })
        .when("/tables", {
            templateUrl: "views/tables.html",
            controller: "tables"
        })
        .when("/videos", {
            templateUrl: "views/videos.html",
            controller: "videos"
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
        .when("/courses", {
            templateUrl: "views/courses.html",
            controller: "courses"
        })
        .when("/editor", {
            templateUrl: "views/editor.html",
            controller: "editor"
        })
        .when("/profile", {
            templateUrl: "views/profile.html",
            controller: "profile"
        });
}])
.filter('trusted', ['$sce', function ($sce) {
    // Ver: https://stackoverflow.com/questions/39480969/angular-interpolateinterr-error-when-adding-url-from-variable
    return $sce.trustAsResourceUrl;
 }])
.config(['$locationProvider', function($locationProvider) {
    // Ver: https://stackoverflow.com/questions/41272314/angular-all-slashes-in-url-changed-to-2f
    $locationProvider.hashPrefix('');
  }])
.run(["$rootScope", "$location", function ($rootScope, $location) {

    $rootScope.loading = true; // Preloader
    $rootScope.userLogged = false; // Indicador de usuario logeado para habilitar componentes de ventana
    $location.path("/login"); // Ir a vista de logeo #TODO: cambiar modelo por uno que admita acceso sin login
    $rootScope.bodyClass = ""; // Clase del body (para poner fondos)
    $rootScope.notifications = []; // Lista de notificaciones del usuario
    $rootScope.notifCnt = 0; // Contador de notificaciones sin leer

    // Configuracion de moment.js
    moment.locale('es', {
        relativeTime : {
            future: "dentro de %s",past: "hace %s",s: "pocos segundos",ss: "%d segundos",m: "un minuto",mm: "%d minutos",
            h: "una hora",hh: "%d horas",d: "un día",dd: "%d días",M: "un mes",MM: "%d meses",y: "un año",yy: "%d años"
        }
    });

    //// Utilidades ////
    $rootScope.greetings = function(){ // Retorna saludo de bienvenida
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

    $rootScope.getTime = function(code,stamp){ // Para ejecutar moment en view
        var time;
        switch(code){
            case 0: // Estampa de tiempo en view
                time = Date.now();
                break;
            case 1: // Fecha y hora actual
                time = moment(Date.now()).format("DD/MM/YYYY HH:mm");
                break;
            case 2: // Solo fecha actual
                time = moment(Date.now()).format("DD/MM/YYYY");
                break;
            case 3: // Fecha y hora de argumento
                time = moment(stamp).format("DD/MM/YYYY HH:mm");
                break;
            case 4: // Solo fecha de argumento
                time = moment(stamp).format("DD/MM/YYYY");
                break;
            case 5: // Relativo al actual
                time = moment(stamp).fromNow();
                break;
            case 6: // Fecha corta y hora
                time = moment(stamp).format("DD/MM HH:mm");
                break;
            default:
                time = null;
        }
        return time;
    };

    $rootScope.getUserNames = function (users, userUids) { // Devuelve los apellidos de los usuarios cuyos uid se pasa como arreglo
        if (users) { // Se puede llamar a esta funcion cuando aun no hay datos porque se ejecuta en view
            var names = [];
            for (var k in userUids)
                names.push(users[userUids[k]].secondName);
            return names.join(", "); // Apellidos separados por coma
        }
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

    $rootScope.openNotification = function(key){ // Abrir enlace de notificacion y marcar leida
        var idx = $rootScope.notifications.findIndex(function(el){return el.key == key});
        if(!$rootScope.notifications[idx].read){ // Si no estaba leida, cambiar estado
            $rootScope.notifications[idx].read = true;
            $rootScope.notifCnt--; // Descontar contador
            Cipressus.db.update({read:true},"notifications/"+$rootScope.notifications[idx].key); // Actualizar en db
        }
        if($rootScope.notifications[idx].link) // Si tiene un enlace, abrir
            $location.path($rootScope.notifications[idx].link);
    };

    // Inicializacion componentes de materialize
    $rootScope.sidenav = M.Sidenav.init(document.querySelector('.sidenav'), {
        side: "left", 
        inDuration:400,  
    });

    M.Collapsible.init(document.querySelector('.collapsible_1'));
    M.Collapsible.init(document.querySelector('.collapsible_2'));
    M.Collapsible.init(document.querySelector('.collapsible_3'));
    
    M.Modal.init(document.getElementById("about_modal"),{});
    var usb_modal = M.Modal.init(document.getElementById("usb_modal"),{});
    var help_modal = M.Modal.init(document.getElementById("help_modal"),{});

    window.addEventListener("resize", function(){
        if($rootScope.resizeEvent)
            $rootScope.resizeEvent()
    });

    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    $rootScope.signOut = function(){ // Callback para el boton de salir
        $location.path("/login");
        $rootScope.userLogged = false;
        Cipressus.db.stopListener("notifications"); // Detener escuchador de notificaciones para que no de error
        Cipressus.users.signOut()
        .then(function(res){
            console.log(res);
            $rootScope.user = null;
            M.toast({html: "Hasta pronto!",classes: 'rounded green darken-3',displayLength: 1500});
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: err[1],classes: 'rounded green darken-3',displayLength: 1500});
        });
    };

    $rootScope.sendHelp = function(){ // Enviar mensaje de ayuda a los usuarios administradores
        // #TODO: enviar email con el mensaje de auyda
        console.log($rootScope.helpMessage);
        M.toast({html: "Listo! Te enviaremos una respuesta",classes: 'rounded green darken-3',displayLength: 2500});
        help_modal.close();
    };

    Cipressus.users.onUserSignedIn = function(uid){ // Cuando el usuario se logea o si estaba logeado al actualizar pagina
        $rootScope.loading = true;
        Cipressus.db.get('users_public/'+uid) // Descargar datos publicos de usuario
        .then(function(public_data){
            $rootScope.user = public_data;
            $rootScope.user.uid = uid;
            $rootScope.notifications = []; // Lista de notificaciones del usuario (reinicio del arreglo)
            $rootScope.notifCnt = 0; // Reiniciar contador de notificaciones no leidas
            Cipressus.db.get('users_private/'+uid) // Descargar informacion dde usuario para el sistema
            .then(function(private_data){
                if(private_data){ // Usuario aceptado por admin
                    $rootScope.user.admin = private_data.admin;
                    // #TODO: enrolled y course deberia ser lo mismo
                    $rootScope.user.enrolled = private_data.enrolled;
                    $rootScope.user.course = private_data.course;
                }else{ // Usuario visitante
                    $rootScope.user.admin = false;
                    $rootScope.user.enrolled = null;
                    $rootScope.user.course = null;
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

                // Inicializar escuchador de notificaciones
                Cipressus.db.listenChild("notifications", "uid", uid,
                function(data, key){
                    data.key = key; // Copiar id de la notificacion para actualizar estado
                    $rootScope.notifications.push(data);
                    if(!data.read)
                        $rootScope.notifCnt++;
                    $rootScope.$apply();
                },
                function(err){
                    console.log(err);
                });

                if($location.path() == "/login"){ // Si se acaba de logear en la vista de login
                    if($rootScope.user.lastView){ // Si tiene guardado la ultima vista que uso
                        var route = $rootScope.user.lastView.split("?id="); // Obtener parametros
                        if(route.length > 1) // Si hay parametros, abrir vista y pasar argumento
                            $location.path("/"+route[0]).search({id:route[1]});
                        else // Si no tiene parametros, abrir vista sola
                            $location.path("/"+route[0]);
                    }else // Si no hay vista, ir a home
                        $location.path("/"); 
                    $rootScope.bodyClass = "";
                }
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
        $location.path("/login"); // #TODO: Ir a vista de login?
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



    /////// Funciones para conexion con websocket server ///////
    Cipressus.hardware.status = "DISCONNECTED";
    $rootScope.usbStatus = "DISCONNECTED"; // Esto es copia del status anterior, pero para no hacer binding
    $rootScope.wssIconColor = 'red-text'; // Color del icono

    // Callbacks de estado de conexion con probador para que las vistas ejecuten acciones
    $rootScope.onWssConnect = function(){};
    $rootScope.onWssDisconnect = function(){};

    var hardwareConfig = { // Configuracion de la interface con probador        
        io:[ // Se redefine en cada vista que use el probador
            {output: false, input: false}, 
            {output: true, input: false}, 
            {output: false, input: true}, 
            {output: false, input: true}, 
            {output: false, input: false}, 
            {output: false, input: false}, 
            {output: true, input: false}, 
            {output: false, input: true},
        ],
        ci: 5000, // Tiempo de espera para reconexion con server
        sp: 50, // Intervalo de actualizacion de salidas
        onUpdate:function(){} // Funcion a ejecutar cuando se actualizan las entradas
    };

    Cipressus.hardware.onSocketClose = function(){ // Definir funcion a ejecutar si se cierra la conexion con el server (cuando se cierra el server de node)
        // Este callback no se ejecuta si se desconecta el server desde esta misma app (con disconnectFromServer())
        console.log("Socket cerrado. Reconectando...");
        //M.toast({html: "Reconectando con Web Socket...",classes: 'rounded red',displayLength: 2000});        
        M.toast({html: "Reconectando con server...",classes: 'rounded blue darken-3',displayLength: 2000});
        $rootScope.usbStatus = "CONNECTING";
        $rootScope.wssIconColor = 'blue-text'; // Color del icono    
        $rootScope.$apply();        
    };

    Cipressus.hardware.onSocketOpen = function(){ // Esto se ejecuta al iniciarse la conexion con el server
        console.log("Socket abierto.");
        $rootScope.usbStatus = 'IDLE'; // Habilitar boton de conectar
        $rootScope.wssIconColor = 'yellow-text'; // Color del icono
        $rootScope.$apply();        
        
        M.toast({html: "Server conectado",classes: 'rounded blue darken-3',displayLength: 2000});
        setTimeout(function(){ // Espera a que se envie la lista de puertos serie
            $rootScope.serialPorts = Cipressus.hardware.getSerialPorts();        
            $rootScope.$apply();
            M.FormSelect.init(document.querySelectorAll('select'), {});            
            M.toast({html: "Puertos disponibles",classes: 'rounded green darken-3',displayLength: 2000});
        },500);
    };

    $rootScope.openUSBModal = function(){
        if(Cipressus.hardware.status == "IDLE"){ // Si esta esperando puerto, actualizar lista de puertos
            $rootScope.serialPorts = Cipressus.hardware.getSerialPorts();    
            M.FormSelect.init(document.querySelectorAll('select'), {}); // Si es default-browser no se si hace falta correr esto           
        }   
        usb_modal.open();
    };

    $rootScope.connectToServer = function(){ // Abrir conexion con server
        if(Cipressus.hardware.status == "DISCONNECTED") // Solo si esta desconectado
            Cipressus.hardware.initServer(hardwareConfig); 
    };

    $rootScope.disconnectFromServer = function(){ // Cerrar la conexion con el server
        Cipressus.hardware.stopServer();
        $rootScope.enableConnect = false; // Habilitar boton de conectar
        M.toast({html: "Server desconectado",classes: 'rounded green darken-3',displayLength: 2000});
        $rootScope.usbStatus = "DISCONNECTED";
        $rootScope.wssIconColor = 'red-text'; // Color del icono
        $rootScope.onWssDisconnect(); // Ejecutar callback que despues emplean las vistas
        usb_modal.close();
    };

    $rootScope.connectToSerialPort = function(){ // Cuando se elige dispositivo y se presiona "conectar"
        Cipressus.hardware.connectTo(document.getElementById("portSelect").value); // Port Connection Request                
        $rootScope.usbStatus = "CONNECTED";
        $rootScope.wssIconColor = 'green-text'; // Color del icono
        $rootScope.onWssConnect(); // Ejecutar callback que despues emplean las vistas
        M.toast({html: "Probador conectado!",classes: 'rounded green darken-3',displayLength: 2000});
        usb_modal.close();
    }; 
    
    ///////////




    /////// PWA ///////

    // #TODO: agregar boton para permitir instalar aunque haya cancelado la primera vez

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
}]);