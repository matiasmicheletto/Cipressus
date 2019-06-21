app.controller("analizer", ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {

    if (!$rootScope.userLogged) {
        $location.path("/login");
        return;
    }

    $rootScope.sidenav.close();        
    Cipressus.utils.activityCntr($rootScope.user.uid, "analizer").catch(function (err) {console.log(err)});

    var chart = Highcharts.chart('chart_container', {
        chart: {
            type: 'line',
            animation: false
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
            name: 'Canal 1',
            data: [[Date.now(),0]]
        },{
            name: 'Canal 2',
            data: [[Date.now(),0]]
        }]
    });

    var series = chart.series;                    
    setInterval(function () {
        var x = Date.now(); 
        series[0].addPoint([x, Math.random()/3+Math.sin((x-1561148606901)/1000)], false, series[0].data.length>150);
        series[1].addPoint([x, Math.random()/3+Math.cos((x-1561148606901)/1000)], true, series[1].data.length>150);        
        //chart.redraw();
    }, 100);
    

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

            //Cipressus.hardware.onUpdate = function(){ // En actualizacion de io, refrescar la vista    
            //};
        }
    };
    
    // Inicializar analizador logico
    initAnalizer();

    // Conectar callbacks
    $rootScope.onWssDisconnect = function(){
        if($scope.tester) $scope.tester = null;
    };

    $rootScope.onWssConnect = function(){
        initAnalizer();
    };
    
}]);