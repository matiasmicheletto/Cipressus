app.directive("testResults",function(){ // Evalua el test de Felder-Silverman
    return {
        restrict: 'E',
        templateUrl : function() {
            return "views/testResults.html";
        },
        scope: {
            answers: '@'
        },
        link: function(scope){
            scope.$watch('answers', function () {   
                if (scope.answers){
                    var scales = Cipressus.test_FS.eval(JSON.parse(scope.answers)); // Toma la funcion de la libreria
                    for (var k = 0; k < 4; k++) {
                        var elem = document.getElementById("scale_" + k);
                        var width = Math.abs(scales[k]) * 50 / 11;
                        elem.style.width = width + '%';
                        if (scales[k] < 0) {
                            elem.style.marginLeft = 50 - width + '%';
                            document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][0];
                        } else {
                            elem.style.marginLeft = "50%";
                            document.getElementById("prof_" + k).innerHTML = Cipressus.test_FS.profileDesc[k][1];
                        }
                        elem.innerHTML = Math.abs(scales[k]);
                    }
                }    
            }, true);
        }
    };
});
    