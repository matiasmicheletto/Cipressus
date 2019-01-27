app.controller("activities", ['$scope','$rootScope','$location', function ($scope,$rootScope,$location) {    
    $rootScope.sidenav.close();

        
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title: {
            text: ""
        },
        data: [{
            type: "pie",
            startAngle: 240,
            yValueFormatString: "##0.00\"%\"",
            indexLabel: "{label} {y}",
            dataPoints: [
                {y: 35, label: "Laboratorios"},
                {y: 15, label: "Asistencia"},
                {y: 50, label: "Parciales"}
            ]
        }]
    });
    chart.render();
        
}]);