app.controller("calendar", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    
    if(!$rootScope.userLogged){
        $location.path("/login");
        return;
    }

    $rootScope.loading = true;
    $rootScope.sidenav.close();

    $scope.events = []; // Arreglo de eventos (clases, labs, parciales)

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
        eventDrop: function( event, delta, revertFunc, jsEvent, ui, view ) { 
            console.log(event.id, event.start, event.end);
        },
        eventClick: function(calEvent, jsEvent, view) {
            console.log(calEvent,calEvent.start);
            $scope.$apply();
        },
        viewRender: function(view,element){
            $('#calendar').fullCalendar('renderEvents',$scope.events);
        }
    });

    Cipressus.db.get("events")
    .then(function(events_data){
        for(k in events_data){ // Convertir las actividades en eventos de calendar
            var ev = events_data[k];
            ev.start = moment(ev.start).format();
            ev.end = moment(ev.end).format();
            ev.id = k;
            ev.durationEditable = $rootScope.user.admin;
            $scope.events.push(ev);
        }   
        $('#calendar').fullCalendar('renderEvents',$scope.events); // Mostrar todos
        $rootScope.loading = false;
        $scope.$apply();
    })
    .catch(function(err){
        console.log(err);
        M.toast({html: "Ocurrió un error al acceder a la base de datos",classes: 'rounded red',displayLength: 2000});        
    })
}]);