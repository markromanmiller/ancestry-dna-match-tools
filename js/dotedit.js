
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

const initialSyncStorage = {
	"director": {
		"assignments": [
			"assignments0"
		]
	},
	"assignments0" : {}
}

async function initializeChromeSyncStorage() {
	await chrome.storage.sync.set(initialSyncStorage);
}


// In-page cache of the assignments dictionary
let assignments;
let syncData;
let idsToAssignmentSlot = {};

// function to call when page loads to pull chrome sync storage stuff (i'll need all of it basically)
function loadChromeSyncStorage() {
	chrome.storage.sync.get(null, function(items) {
		if (!("director" in items)) {
			initializeChromeSyncStorage();
			syncData = initialSyncStorage;
		} else {
			syncData = items;
		}
		constructAssignments();
	})
}

function constructAssignments() {
	let newAssignments = {};
	// let idsToAssignmentSlot = {};
	for (let i = 0; i < syncData.director.assignments.length; i++) {
		Object.assign(newAssignments, syncData[syncData.director.assignments[i]]);
	}
	assignments = newAssignments;
}


// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
	if (area === 'sync') {
		for (let key in changes) {
			syncData[key] = changes[key].newValue;
		}
		constructAssignments();
	}
});

function updateAssignments(id, tagIDs) {
	// assignments[id] = tagIDs;
	// by default, use assignment0

	let newAssignment0 = syncData["assignments0"];
	newAssignment0[id] = tagIDs;

	// do some unsaved data thing...
	chrome.storage.sync.set({"assignments0" : newAssignment0});
}

function constructTagElement(tagID) {
	let tagInfo = getTags()[tagID];
	let ele = document.createElement("span");
	ele.setAttribute("data-tag-id", tagID);
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
	if (match32 in assignments) {
		tagElements = assignments[match32].map(function(value) {return constructTagElement(value)});
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
 *   c) add tag info once selected
 * 7) save tag assignment to JSON
 * 8) save tag assignment to chrome.sync
 *
 * DONE up to here.
 *
 * 9) refactor tag assignment
 *
 * tags
 * 1) display tag info (n matches, name, short name, color)
 * 2) edit tag info
 * 3) make new tag
 * 4) delete old tags
 * 5) handle tag errors
 *   a) too much storage error
 *   b) duplicate tag names error
 *   c) filter out already-assigned tags
 *
 * features
 * 1) hide ancestry tags?
 * 2) hide some angel tags?
 */

// bad table for name, edit name, color, etc, and save button at the top?

// with a button, open chrome.runtime.openOptionsPage

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

		// EDIT
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

				const tags = getTags();
				const tagsKeys = Object.keys(tags);
				for (let i = 0; i < tagsKeys.length; i++) {
					if (val.target.value === makeTagOption(tags[tagsKeys[i]])) {
						// TODO: make sure this tag isn't already attached

						// then this is the one that was selected, let's add it.
						const newTagElement = constructTagElement(tagsKeys[i]);

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

		} else { // SAVE
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

			let acceptedTagIDs = [];

			for (let i = 0; i < siblings.length; i++) {
				if (siblings[i].classList.contains("angeldots-tag")) {
					acceptedTagIDs.push(siblings[i].getAttribute("data-tag-id"));
					for (let j = 0; j < siblings[i].children.length; j++) {
						if (siblings[i].children[j].classList.contains("angeldots-removeTagButton")) {
							siblings[i].children[j].remove();
						}
					}
				} else if (siblings[i].classList.contains("angeldots-addInput")) {
					siblings[i].remove();
				} else if (siblings[i].classList.contains("angeldots-datalist")) {
					siblings[i].remove();
				}
			}

			// save the data
			// TODO: redo the parentElement.parentElement link into ancestry.js
			updateAssignments(getMatchID(this.parentElement.parentElement), acceptedTagIDs);
		}
	};
	return editTagsButton;
}

function constructTagContainer(match32) {
	let tagContainer = document.createElement("div");
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

// initializeChromeSyncStorage();
loadChromeSyncStorage();

observer.observe(document.documentElement, {subtree: true, attributes: true, attributeFilter: ["class"]});


