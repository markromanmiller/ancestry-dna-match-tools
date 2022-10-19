
// given a match32 string, pull out the relevant tags:

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

function getTags() {
	return tags;
}

function getAssignments() {
	return assignments;
}

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
	if (relativeLuminanceW3C(tagInfo["color"]) < 0.5) {
		ele.classList.add("lod");
	}
	// ele.style.color = textColor(tagInfo["color"]);
	return ele;
}

function constructMatchTags(match32) {
	let tagElements = [];
	if (match32 in getAssignments()) {
		tagElements = getAssignments()[match32].map(function(value) {return makeTagHTML(getTags()[value])});
	}
	return tagElements;
}

// UI flow:
// edit -> add x's, add [ form ] for new or add tag

/**
 * tag assigment
 * 1) find where tags should go
 * 2) add in tag element
 * 3) add in tags
 * 4) open editing of tag assignment
 * 5) remove tag assignment
 * 6) add tag assignment
 *   a) DONE - Add input with dropdown / autocomplete
 *   b) have dropdowns be from tags
 *
 *   DONE up to here.
 *
 *   c) add tag info once selected
 * 7) save tag assignment to JSON
 * 8) save tag assignment to chrome.sync
 * 9) refactor tag assignment:
 *   a) break down into smaller functions
 *   b) filter out already-assigned tags
 *
 * tags
 * 1) display tag info (n matches, name, short name, color)
 * 2) edit tag info
 * 3) make new tag
 * 4) delete old tags
 * 5) handle tag errors
 *   a) too much storage error
 *   b) duplicate tag names error
 *
 * features
 * 1) hide ancestry tags?
 * 2) hide some angel tags?
 */

// bad table for name, edit name, color, etc, and save button at the top?

// with a button, open chrome.runtime.openOptionsPage

/*
chrome.storage.sync.set({key: value}, function() {
	console.log('Value is set to ' + value);
});

chrome.storage.sync.get(['key'], function(result) {
	console.log('Value currently is ' + result.key);
});*/

function makeTagOption(tagInfo) {
	let result = tagInfo["name"];
	if (tagInfo["shortName"]) {
		result += " (" + tagInfo["shortName"] + ")";
	}
	return result;
}

function constructDatalist() {

	// TODO: filter out already-assigned tags

	let dl = document.createElement("datalist");
	dl.classList.add("angeldots-datalist");
	dl.id = "angeldots-datalist";

	const tags = getTags();
	const opts = Object.keys(tags).map(val => {
		const opt = document.createElement("option");
		opt.value = makeTagOption(tags[val]);
		return opt;
	});
	dl.append(...opts);

	return dl;
}

function constructRemoveTagButton() {
	const removeTagButton = document.createElement("button");
	removeTagButton.classList.add("angeldots-removeTagButton");
	removeTagButton.innerHTML = "<img src='" +
		chrome.runtime.getURL("img/close.svg") +
		"' alt='Remove Tag'/>";
	removeTagButton.onclick = function () {
		// TODO: also update the corresponding datalist object
		this.parentElement.remove();
	}
	return removeTagButton;
}

function constructEditTagsButton() {
	const editTagsButton = document.createElement("button");
	editTagsButton.classList.add("angeldots-editTagsButton");
	editTagsButton.innerHTML = "<img src='" +
		chrome.runtime.getURL("img/wing.svg") +
		"' alt='Edit Tags'/>";

	editTagsButton.onclick = function () {
		// get all tags, and add in x-marks to them

		let siblings = this.parentElement.children;

		if (this.classList.contains("angeldots-editTagsButton")) {
			// remove it, replace it, and do work.
			editTagsButton.classList.remove("angeldots-editTagsButton");
			editTagsButton.classList.add("angeldots-saveTagsButton");

			// edit its image
			for (let i = 0; i < this.children.length; i++) {
				let val = this.children[i];
				if (val.tagName.toLowerCase() === "img") {
					val.src = chrome.runtime.getURL("img/check.svg");
					val.alt = "Save Tags";
				}
			}

			// place a form fill right after it

			this.after(constructDatalist());

			let addInput = document.createElement("input");
			addInput.setAttribute('list', "angeldots-datalist");
			addInput.classList.add("angeldots-addInput");
			addInput.onchange = function(val) {
				// check whether it's a valid entry (use a JSON thing?)
				console.log("onchange");

				// is it a valid entry (check if it's empty, check if it matches any tags
				console.log(val);

				const tags = getTags();
				const tagsKeys = Object.keys(tags);
				for (let i = 0; i < tagsKeys.length; i++) {
					if (val.target.value === makeTagOption(tags[tagsKeys[i]])) {
						// TODO: make sure this tag isn't already attached

						// then this is the one that was selected, let's add it.
						const newTagElement = makeTagHTML(tags[tagsKeys[i]]);

						// add in the close button
						newTagElement.append(constructRemoveTagButton());

						// place at the very end
						val.target.parentElement.append(newTagElement);
						break;
					}
				}
			}
			this.after(addInput);

			// find its siblings, and give them all (x) buttons
			for (let i = 0; i < siblings.length; i++) {

				if (siblings[i].classList.contains("angeldots-tag")) {
					siblings[i].append(constructRemoveTagButton());
				}
			}

		} else {
			editTagsButton.classList.remove("angeldots-saveTagsButton");
			editTagsButton.classList.add("angeldots-editTagsButton");

			// edit its image
			for (let i = 0; i < this.children.length; i++) {
				let val = this.children[i];
				if (val.tagName.toLowerCase() === "img") {
					val.src = chrome.runtime.getURL("img/wing.svg");
					val.alt = "Edit Tags";
				}
			}

			// find its siblings, delete all the x buttons
			for (let i = 0; i < siblings.length; i++) {
				if (siblings[i].classList.contains("angeldots-tag")) {
					for (let j = 0; j < siblings[i].children.length; j++) {
						if (siblings[i].children[j].classList.contains("angeldots-removeTagButton")) {
							siblings[i].children[j].remove();
						}
					}
				} else if (siblings[i].classList.contains("angeldots-addInput")) {
					siblings[i].remove();
				}
			}

			// save the data
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



