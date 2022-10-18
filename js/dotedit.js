
// given a match32 string, pull out the relevant tags:

// import textColor from "./colors";

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
	return ele;
}

function constructMatchTags(match32) {
	let tagElements = [];
	if (match32 in assignments) {
		tagElements = assignments[match32].map(function(value) {return makeTagHTML(tags[value])});
	}
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

function constructEditTagsButton() {
	const editTagsButton = document.createElement("button");
	editTagsButton.classList.add("angeldots-editTagsButton");
	editTagsButton.innerHTML = "<img src='" +
		chrome.runtime.getURL("img/wing.svg") +
		"' alt='Edit Tags'/>";

	editTagsButton.onclick = function () {
		// get all tags, and add in x-marks to them
		let siblings = this.parentElement.children;
		for (let i = 0; i < siblings.length; i++) {
			if (siblings[i].classList.contains("angeldots-tag")) {
				const removeTagButton = document.createElement("button");
				removeTagButton.classList.add("angeldots-removeTagButton");
				removeTagButton.innerHTML = "<img src='" +
					chrome.runtime.getURL("img/close.svg") +
					"' alt='Remove Tag'/>";
				siblings[i].append(removeTagButton);
			}
		}
	};
	return editTagsButton;
}

function constructTagContainer(match32) {
	let tagContainer = document.createElement("div");
	// element.classList.add("mystyle");
	tagContainer.classList.add("angeldots");
	tagContainer.append(constructEditTagsButton());
	let matchTagSpans = constructMatchTags(match32);
	tagContainer.append(...matchTagSpans);
	return tagContainer;
}

function ensureTagContainer(target) {
	if (doesNeedTagContainer(target) && !(target.classList.contains("angeldots-hasTagContainer"))) {
		target.classList.add("angeldots-hasTagContainer");
		let ele = constructTagContainer(getMatchID(target));
		target.append(ele);
		// now the question is, how can one create, assign and edit the tags?
	}
}

let observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		switch(mutation.type) {
			case "attributes":
				ensureTagContainer(mutation.target);
		}
	})
});

observer.observe(document.documentElement, {subtree: true, attributes: true, attributeFilter: ["class"]});



