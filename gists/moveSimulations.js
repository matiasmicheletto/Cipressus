// Mover las simulaciones desde el arbol de usuarios al arbol de simulaciones 
var sims_tree = [];
Cipressus.db.get("users_public/")
.then(function(users_data){
	for(var k in users_data){
		var user_sims = users_data[k].simulations;
		for(var kk in user_sims){
			var sim = user_sims[kk];
			sim.uid = k;
			sims_tree.push(sim);
		}
	}
	console.log(sims_tree);
	for(var k in sims_tree){
		Cipressus.db.push(sims_tree[k], "simulations")
		.then(function(){
			console.log("Listo");
		})
		.catch(function(err){
			console.log(err);
		});		
	}
})
.catch(function(err){
	console.log(err);
});