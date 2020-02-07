app.controller("analizer", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();        
    Cipressus.utils.activityCntr($rootScope.user.uid, "analizer").catch(function (err) {console.log(err)});

    $scope.running = false; // Controlar encendido/apagado del analizador (inicialmente apagado)

    var chart = Highcharts.chart('chart_container', {
        chart: {
            type: 'line',
            animation: false,
            height: "50%"
        },
        credits: {
            enabled: false
        },
        title: {
            text: 'Analizador lógico'
        },  
        yAxis: {
            title: {
                text: 'Voltaje'
            }
        },        
        tooltip: {
            headerFormat: '<b>{series.name}</b><br/>',
            pointFormat: '{point.y:.2f}'
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'Entrada 1',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 2',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 3',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 4',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 5',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 6',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 7',
            data: [[Date.now(),0]]
        },{
            name: 'Entrada 8',
            data: [[Date.now(),0]]
        }]
    });

    var series = chart.series; // Series de datos (inicialmente todo en 0 con un solo dato)

    var initAnalizer = function(){ // Inicializar controladores de la vista
        if(Cipressus.hardware.status == "CONNECTED"){
        
            $scope.tester = [ // Entrada/salida del probador
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}, 
                {output: false, input: false}
            ];

            Cipressus.hardware.io = $scope.tester; // Hacer binding con esta variable

            Cipressus.hardware.onUpdate = function(){ // En actualizacion de io, refrescar el grafico   
                var timestamp = Date.now(); 
                for(var k = 0; k < 8; k++)
                    series[k].addPoint([timestamp, $scope.tester[k].input ? 5:0], false, series[k].data.length>300);
            };
        }
    };

    var startChartUpdater = function(){ // Esta funcion dispara el refresco continuo del grafico
        chart.redraw(); // Redibujar
        if($scope.running) // Si esta corriendo, disparar el timeout
            setTimeout(startChartUpdater,100); // El periodo es de 100ms fijo
    };

    $scope.toggleStartStop = function(){// Iniciar-detener el analizador
        $scope.running = !$scope.running;
        if($scope.running)
            startChartUpdater(); // Al iniciar, hay que disparar el evento por primera vez
    };
    
    // Conectar callbacks
    $rootScope.onWssDisconnect = function(){
        if($scope.tester) $scope.tester = null;
    };

    $rootScope.onWssConnect = function(){
        initAnalizer();
    };

    // Inicializar analizador logico
    initAnalizer();
    
}]);