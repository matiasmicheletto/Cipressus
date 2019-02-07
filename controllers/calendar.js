app.controller("calendar", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.events = []; // Arreglo de eventos (clases, labs, parciales)

    // Componentes materialize
    var viewModal = M.Modal.init(document.getElementById("view_modal"), {preventScrolling: false});
    var editModal = M.Modal.init(document.getElementById("edit_modal"), {preventScrolling: false});
    var confirmDeleteModal = M.Modal.init(document.getElementById("confirm_delete_modal"), {preventScrolling: false});
    var confirmMoveModal = M.Modal.init(document.getElementById("confirm_move_modal"), {preventScrolling: false});
    M.FormSelect.init(document.querySelectorAll('select'), {});

    $scope.refreshCalendar = function(){ // Sincroniza arreglo de eventos con lo que se muestra
        $('#calendar').fullCalendar('removeEvents'); // Para que no duplique
        $('#calendar').fullCalendar('renderEvents',$scope.events); // Renderizar todos
    };

    // Inicializar calendar
    $('#calendar').fullCalendar({
        weekends: false,
        editable: $rootScope.user.admin,
        locale: 'es-us',
        lang: 'es',
        allDaySlot:false,
        minTime:"08:00",
        maxTime:"22:00",
        timeFormat: "HH:mm",
        dateFormat: "DD/MM",
        slotLabelInterval:"01:00",
        slotLabelFormat: 'HH:mm',
        header: { center: 'month,agendaWeek' },
        eventSources: [{
            events: $scope.events
        }],
        eventDrop: function( event ) { // Al soltar evento en otro casillero
            $scope.selectedEvent = { // Extraer datos necesarios para actualizar en DB
                author: $rootScope.user.uid,
                color: event.color,
                start: moment(event.start._d).unix()*1000+10800000,
                end: moment(event.end._d).unix()*1000+10800000,
                info: event.info,
                timestamp: Date.now(),
                title: event.title
            };
            $scope.selectedEventExtras = { // Esta info no va en la DB pero se requiere para actualizar calendar
                id: event.id,
                idx: event.idx
            };
            confirmMoveModal.open(); // Abrir dialogo de confirmacion de cambios
            $scope.$apply();
        },
        eventResize: function(event){ // Extender o acortar horario de evento
            $scope.selectedEvent = { // Extraer datos necesarios para actualizar en DB
                author: $rootScope.user.uid,
                color: event.color,
                start: moment(event.start._d).unix()*1000+10800000,
                end: moment(event.end._d).unix()*1000+10800000,
                info: event.info,
                timestamp: Date.now(),
                title: event.title
            };
            $scope.selectedEventExtras = { // Esta info no va en la DB pero se requiere para actualizar calendar
                id: event.id,
                idx: event.idx
            };
            confirmMoveModal.open(); // Abrir dialogo de confirmacion de cambios
            $scope.$apply();
        },
        eventClick: function(event) {
            $scope.selectedEvent = { // Extraer datos necesarios para actualizar en DB
                author: event.timestamp, // Esto hay que editarlo despues
                color: event.color,
                start: moment(event.start._d).unix()*1000+10800000, // GMT+3 (cosa de calendar)
                end: moment(event.end._d).unix()*1000+10800000,
                info: event.info,
                timestamp: event.timestamp, // Esto se edita despues
                title: event.title
            };
            $scope.selectedEventExtras = { // Esta info no va en la DB
                id: event.id,
                idx: event.idx,
                startDay: moment(event.start).format("DD/MM"),
                startTime: moment(event.start).format("HH:mm"),
                endTime: moment(event.end).format("HH:mm"),
                fromNow: moment(event.end).fromNow()
            };
            viewModal.open();
            $scope.$apply();
        },
        viewRender: function(view,element){
            $scope.refreshCalendar();
        }
    });

    $scope.editEvent = function(newEvent){ // Editar evento o crear nuevo
        if(newEvent){ // Crear nuevo (click en +)
            $scope.selectedEvent = {};
            $scope.selectedEventExtras = null; // No tengo id ni idx y se deben definir
            document.getElementById("event_date").value = null;
            document.getElementById("event_start_time").value = null;
            document.getElementById("event_end_time").value = null;
            document.getElementById("tag_select").value = "#aaaaaa";
        }else{ // Editar existente (click en evento del calendario)
            document.getElementById("event_date").value = moment($scope.selectedEvent.start).format("YYYY-MM-DD");
            document.getElementById("event_start_time").value =  moment($scope.selectedEvent.start).format("HH:mm");
            document.getElementById("event_end_time").value = moment($scope.selectedEvent.end).format("HH:mm");
            document.getElementById("tag_select").value = $scope.selectedEvent.color;
            setTimeout(function(){
                M.updateTextFields();
            },200);
        }
    };

    $scope.saveEvent = function(){ // Guardar evento en DB
        $rootScope.loading = true;
        $scope.selectedEvent.author = $rootScope.user.uid;
        $scope.selectedEvent.timestamp = Date.now();
        $scope.selectedEvent.color = document.getElementById("tag_select").value;
        var date = document.getElementById("event_date").value;
        var startTime = document.getElementById("event_start_time").value;
        var endTime = document.getElementById("event_end_time").value;
        var start = moment(startTime+" "+date,"HH:mm YYYY-MM-DD").unix()*1000;
        var end = moment(endTime+" "+date,"HH:mm YYYY-MM-DD").unix()*1000;
        // Chequeo de formulario
        var formStatus = 0;
        if($scope.selectedEvent.title){
            if($scope.selectedEvent.title == "")
                formStatus = 1;
        }else
            formStatus = 2;
        if(start && end){ // Si se pudo procesar fecha y hora
            if(start < end){ // Si lo ingresado es coherente
                $scope.selectedEvent.start = start;
                $scope.selectedEvent.end = end;
            }else
                formStatus = 3;
        }else
            formStatus = 4;
        if($scope.selectedEvent.info == 'undefined')
            $scope.selectedEvent.info = "";
        if(formStatus != 0){ // Si algo no estaba bien, mostrar error y salir
            console.log("Error "+formStatus);
            console.log("Titulo", $scope.selectedEvent.title);
            console.log("Fecha y hora",date,startTime,endTime);
            M.toast({html: "No se ingresó fecha u horarios correctamente",classes: 'rounded red',displayLength: 2000});        
            $rootScope.loading = false;
            return;
        }
        // Si todo esta bien, guardar
        if($scope.selectedEventExtras) // Si esta este objeto, hay que actualizar
            Cipressus.db.update($scope.selectedEvent,"events/"+$scope.selectedEventExtras.id)
            .then(function(snapshot){
                // Poner el formato de calendar
                $scope.selectedEvent.start = moment($scope.selectedEvent.start).format();
                $scope.selectedEvent.end = moment($scope.selectedEvent.end).format();
                // Agregarle los atributos de indice e identificador para que quede en local
                $scope.selectedEvent.id = $scope.selectedEventExtras.id;
                $scope.selectedEvent.idx = $scope.selectedEventExtras.idx;
                $scope.events[$scope.selectedEventExtras.idx] = $scope.selectedEvent; // Actualizar en arreglo
                $scope.refreshCalendar();
                M.toast({html: "Evento actualizado",classes: 'rounded green',displayLength: 2000});  
                $scope.selectedEvent = null; // Para que no se vuelva a utilizar por error
                $scope.selectedEventExtras = null;
                editModal.close();      
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
                $rootScope.loading = false;
                $scope.$apply();
            });
        else // Si es nuevo evento, insertar en DB
            Cipressus.db.push($scope.selectedEvent,"events")
            .then(function(snapshot){
                // Poner el formato de calendar
                $scope.selectedEvent.start = moment($scope.selectedEvent.start).format();
                $scope.selectedEvent.end = moment($scope.selectedEvent.end).format();
                // Agregarle los atributos de indice e identificador para que quede en local
                $scope.selectedEvent.idx = $scope.events.length;
                $scope.selectedEvent.id = snapshot.key;
                $scope.events.push($scope.selectedEvent); // Insertar en arreglo
                $('#calendar').fullCalendar('renderEvent',$scope.selectedEvent);
                M.toast({html: "Nuevo evento registrado",classes: 'rounded green',displayLength: 2000});  
                $scope.selectedEventExtras = null; // Para que no se vuelva a utilizar por error
                editModal.close();      
                $rootScope.loading = false;
                $scope.$apply();
            })
            .catch(function(err){
                console.log(err);
                M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
                $rootScope.loading = false;
                $scope.$apply();
            });
    };

    $scope.deleteEvent = function(){ // Borrar el ultimo evento clickeado (luego de confirmar)
        $rootScope.loading = true;
        Cipressus.db.set(null,"events/"+$scope.selectedEventExtras.id)
        .then(function(snapshot){
            $scope.events.splice($scope.selectedEventExtras.idx,1); // Quitar del arreglo
            $scope.refreshCalendar();
            $scope.selectedEventExtras = null; // Para que no se vuelva a utilizar por error
            M.toast({html: "Evento eliminado",classes: 'rounded green',displayLength: 2000});  
            confirmDeleteModal.close();      
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "No se pudo eliminar, intente en otro momento",classes: 'rounded red',displayLength: 2000});        
            $rootScope.loading = false;
            $scope.$apply();
        });
    };

    $scope.moveEvent = function(){ // Mover el elemento arrastrado (luego de confirmar)
        $rootScope.loading = true;
        Cipressus.db.update($scope.selectedEvent,"events/"+$scope.selectedEventExtras.id)
        .then(function(snapshot){
            // Agregarle los atributos de indice e identificador para que quede en local
            $scope.selectedEvent.id = $scope.selectedEventExtras.id;
            $scope.selectedEvent.idx = $scope.selectedEventExtras.idx;
            $scope.events[$scope.selectedEventExtras.idx] = $scope.selectedEvent; // Actualizar en arreglo
            $scope.selectedEvent.start = moment($scope.selectedEvent.start).format();
            $scope.selectedEvent.end = moment($scope.selectedEvent.end).format();
            $scope.refreshCalendar();
            $scope.selectedEventExtras = null;
            M.toast({html: "Evento actualizado",classes: 'rounded green',displayLength: 2000});  
            confirmMoveModal.close();
            $rootScope.loading = false;
            $scope.$apply();
        })
        .catch(function(err){
            console.log(err);
            M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
            $rootScope.loading = false;
            $scope.$apply();
        });
    };    
    
    Cipressus.db.get("events") // Descargar todos los eventos y renderizar en calendar
    .then(function(events_data){
        var idx = 0; // Guardo los indices del arreglo
        for(k in events_data){ // Convertir las actividades en eventos de calendar
            var ev = events_data[k];
            ev.start = moment(ev.start).format();
            ev.end = moment(ev.end).format();
            ev.id = k;
            ev.idx = idx; // El indice me sirve para ubicarlo al editar evento
            ev.durationEditable = $rootScope.user.admin;
            $scope.events.push(ev);
            idx++;
        }   
        $('#calendar').fullCalendar('renderEvents',$scope.events); // Mostrar todos
        $rootScope.loading = false;
        $scope.$apply();
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
    });
}]);