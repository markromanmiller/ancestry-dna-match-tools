//dd let groupcollections = document.getElementsByClassName("indicatorGroupCollection");
// console.log(groupcollections.length);
//

var matchDict = {};

function countDict(d, l) {
	for (var i = 0; i < l.length; i++) {
		if (l[i] in d) {
			d[l[i]] += 1;
		} else {
			d[l[i]] = 1;
		}
	}
}

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {

		switch(mutation.type) {
			case 'childList':
				//console.log(mutation.addedNodes[0]);
				for (var i = 0; i < mutation.addedNodes.length; i++) {
					if (mutation.addedNodes[i].classList) {
						//if (mutation.addedNodes[i].id.match("match[0-9a-f]")) {
						//	console.log(mutation.addedNodes[i].id)
						//}
						countDict(matchDict, mutation.addedNodes[i].classList);

						//console.log(mutation.addedNodes[i].classList);
						if (mutation.addedNodes[i].classList.contains("matchGrid")) {
							mutation.addedNodes[i].append("<div>SOUND CHECK</div>");
						}
					}
				}
				break;
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
observer.observe(document.documentElement, { childList: true , subtree: true, attributes: true, attributeFilter: ["class"]});
//console.log(insertedNodes);



