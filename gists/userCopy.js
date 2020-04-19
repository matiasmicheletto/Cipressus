// Copiar datos de alumno para renovar curso

//var user_uid = "yUitdxa2dnVzHmc0H1CeGKSLUzh1";

Cipressus.db.get("users_public/"+user_uid)
.then(function(snapshot){
    Cipressus.db.push(snapshot,"users_public")
    .then(function(res){
        var new_key = res.key;
        console.log("Nueva clave: "+new_key);
        Cipressus.db.get("users_private/"+user_uid)
        .then(function(snapshot){
            Cipressus.db.set(snapshot,"users_private/"+new_key)
            .then(function(res){
                console.log("Listo.");
            });
        });

    });
});
