// Obtener resultados de tests FS
Cipressus.db.get('users_public') // Descargar lista de usuarios
    .then(function (users_public_data) {
        var users = users_public_data;
        var data = [];
        for (var k in users) { // Calcular promedio de resultados
            if (users[k].test_fs && !users[k].excludeStat)
                if (users[k].test_fs.answers) {
                    var scales = Cipressus.test_FS.eval(users[k].test_fs.answers); // Toma la funcion de la libreria
                    data.push(scales);
                }
        }
        
        console.log("Resultados");
        console.log(data);
    })
    .catch(function (err) { // users_public
        console.log(err);
    });


// Calcular promedios y desvios de test FS

Cipressus.db.get('users_public') // Descargar lista de usuarios
    .then(function (users_public_data) {
        var users = users_public_data;

        var avgScales = [0, 0, 0, 0]; // Valores promedios de las escalas
        var dataCnt = 0; // Cantidad de individuos
        for (var k in users) { // Calcular promedio de resultados
            if (users[k].test_fs && !users[k].excludeStat)
                if (users[k].test_fs.answers) {
                    var scales = Cipressus.test_FS.eval(users[k].test_fs.answers); // Toma la funcion de la libreria
                    dataCnt++;
                    for (var j = 0; j < 4; j++) // Sumar componentes
                        avgScales[j] += scales[j];
                }
        }
        for (var j = 0; j < 4; j++) // Dividir por la cantidad
            avgScales[j] = Math.round(avgScales[j] / dataCnt * 100) / 100;

        // Calcular desvio estandar
        var stdScales = [0, 0, 0, 0];
        dataCnt = 0;
        for (var k in users) { // Calcular desvio de resultados
            if (users[k].test_fs && !users[k].excludeStat)
                if (users[k].test_fs.answers) {
                    var scales = Cipressus.test_FS.eval(users[k].test_fs.answers); // Toma la funcion de la libreria
                    dataCnt++;
                    for (var j = 0; j < 4; j++) // Sumar componentes de la ecuacion de desvio
                        stdScales[j] += (scales[j] - avgScales[j]) * (scales[j] - avgScales[j]); // Suma de diferencias cuadraticas
                }
        }

        for (var j = 0; j < 4; j++) // Dividir por la cantidad
            stdScales[j] = Math.round(Math.sqrt(stdScales[j] / dataCnt) * 100) / 100; // Formula std (redondeo 2 decimales)

        console.log("Resultados");
        console.log("Total usuarios: "+Object.getOwnPropertyNames(users).length);
        console.log("Tests realizados: "+dataCnt);
        console.log(avgScales);
        console.log(stdScales);
    })
    .catch(function (err) { // users_public
        console.log(err);
    });

