
// given a match32 string, pull out the relevant tags:

import textColor from "./colors";

/**
 * tag database structure:
 * 'assignments' : {
 *     '6987109ba0185ba...' : [0, 25, 77],
 *     ...
 * },
 * 'tags' : {
 *     0 : {
 *     	   'name' : 'MRCA 06 - GILE/STADELE',
 *         'short_name' : 'MRCA O5',
 *         'color' : '#FF00FF',
 *     }
 * }
 */

const assignments = {
	"177325bb661c43a5a33d3104eb57ad1d" : [0],
	"f61f9c955fee4a8eab2cd571319e0df6" : [1, 0]
};

const tags = {
	0 : {
		"name" : "Test tag 01",
		"shortName" : "",
		"color" : "#ffaef1"
	},
	1 : {
		"name" : "test tag 22",
		"shortName" : "TT22",
		"color" : "#000f2f"
	}
};

function makeTagHTML(tagInfo) {
	let ele = document.createElement("span");
	ele.classList.add("angeldots-tag");
	if (tagInfo["shortName"]) {
		ele.innerText = tagInfo["shortName"];
	} else {
		ele.innerHTML = "&nbsp;";
	}
	ele.title = tagInfo["name"];
	ele.style.backgroundColor = tagInfo["color"];
	ele.style.color = textColor(tagInfo["color"]);
	//}
	return ele;
}

function pullMatchTags(match32) {
	// console.log("Calling with: " + match32);
	let tagElements = [];
	if (match32 in assignments) {
		tagElements = assignments[match32].map(function(value) {return makeTagHTML(tags[value])});
	}
	// console.log(tagElements.length);
	return tagElements;
}

// UI flow:
// edit -> add x's, add [ form ] for new or add tag

// wing shows ad tags

// bad table for name, edit name, color, etc, and save button at the top?

// options page bad stuff.

// with a button, open chrome.runtime.openOptionsPage

// color html unit

/*
chrome.storage.sync.set({key: value}, function() {
	console.log('Value is set to ' + value);
});

chrome.storage.sync.get(['key'], function(result) {
	console.log('Value currently is ' + result.key);
});*/


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
					let matchTags = pullMatchTags(target.id.slice(-32));
					ele.append(...matchTags);
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


