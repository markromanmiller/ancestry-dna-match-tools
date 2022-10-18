let observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {

		switch(mutation.type) {
			case "attributes":
				let target = mutation.target;
				let classes = target.classList;
				if (classes.contains("matchGrid") && !(classes.contains("angeldots-matchGrid"))) {
					classes.add("angeldots-matchGrid");
					let ele = document.createElement("div");
					// element.classList.add("mystyle");
					ele.classList.add("angeldots");
					ele.innerHTML = target.id;
					target.append(ele);
					// now the question is, how can one create, assign and edit the tags?
				}
				break;
		}
	})
	//console.log(matchDict);
});
observer.observe(document.documentElement, {subtree: true, attributes: true, attributeFilter: ["class"]});
//console.log(insertedNodes);



