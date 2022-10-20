
/**
 * tags
 * 1) display tag info (n matches, name, short name, color) in a table
 * 2) edit tag info
 * 3) make new tag
 * 4) delete old tags
 * 5) handle tag errors
 *   a) too much storage error
 *   b) duplicate tag names error
 *   c) filter out already-assigned tags
 * 6) refactor
 * 7) some discoverable way to create a new tag
 *
 * features
 * 1) hide ancestry tags?
 * 2) hide some angel tags?
 * 3) delete all data
 * 4) handle multiple accounts
 * 5) export all data in formats:
 *   a) json
 *   b) by person, listing tags
 *   c) by tags, listing person
 *   d) by ids vs. names
 */

// given a tagID, create the HTML element to represent that tag
function constructTagElement(tagID) {
	const tagInfo = getTags()[tagID];

	// basic HTML
	const ele = document.createElement("span");
	ele.classList.add("angeldots-tag");
	ele.setAttribute("data-tag-id", tagID);

	// populate and style
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

	return ele;
}

// given a 32-character match string, create the relevant tag HTML elements
function constructMatchTags(match32) {
	let tagElements = [];
	if (match32 in assignments) {
		tagElements = assignments[match32].map(function(value) {return constructTagElement(value)});
	}
	return tagElements;
}

// given tag info, create the tag option element to fill in the datalist
function constructTagOption(tagInfo) {
	let result = tagInfo["name"];
	if (tagInfo["shortName"]) {
		result += " (" + tagInfo["shortName"] + ")";
	}
	return result;
}

// create a datalist for the 'add tag' dropdown'
function constructDatalist() {
	// TODO: filter out already-assigned tags

	let dl = document.createElement("datalist");
	dl.classList.add("angeldots-datalist");
	dl.id = "angeldots-datalist";

	const tags = getTags();
	const opts = Object.keys(tags).map(val => {
		const opt = document.createElement("option");
		opt.value = constructTagOption(tags[val]);
		return opt;
	});
	dl.append(...opts);

	return dl;
}

// Return a tag deletion button
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

function assignNewTag(val) {
	const tags = getTags();
	const tagsKeys = Object.keys(tags);
	for (let i = 0; i < tagsKeys.length; i++) {
		if (val.target.value === constructTagOption(tags[tagsKeys[i]])) {
			// TODO: make sure this tag isn't already attached

			const newTagElement = constructTagElement(tagsKeys[i]);
			newTagElement.append(constructRemoveTagButton());
			val.target.parentElement.append(newTagElement);
			break;
		}
	}
}

function constructAddTagInput() {
	let addInput = document.createElement("input");
	addInput.setAttribute('list', "angeldots-datalist");
	addInput.classList.add("angeldots-addInput");
	addInput.onchange = assignNewTag;
	return addInput;
}

function mutateForEdit(editTagsButton) {

	let siblings = editTagsButton.parentElement.children;
	// remove it, replace it, and do work.
	editTagsButton.classList.remove("angeldots-editTagsButton");
	editTagsButton.classList.add("angeldots-saveTagsButton");

	// edit its image
	for (let i = 0; i < editTagsButton.children.length; i++) {
		let val = editTagsButton.children[i];
		if (val.tagName.toLowerCase() === "img") {
			val.src = chrome.runtime.getURL("img/check.svg");
			val.alt = "Save Tags";
		}
	}

	// place a datalist and an input element right after it
	editTagsButton.after(constructDatalist());
	editTagsButton.after(constructAddTagInput());

	// find its siblings, and give them all (x) buttons
	for (let i = 0; i < siblings.length; i++) {
		if (siblings[i].classList.contains("angeldots-tag")) {
			siblings[i].append(constructRemoveTagButton());
		}
	}
}

function mutateForSave(editTagsButton) {

	// update class assignments
	editTagsButton.classList.remove("angeldots-saveTagsButton");
	editTagsButton.classList.add("angeldots-editTagsButton");

	// edit image
	for (let i = 0; i < editTagsButton.children.length; i++) {
		let val = editTagsButton.children[i];
		if (val.tagName.toLowerCase() === "img") {
			val.src = chrome.runtime.getURL("img/wing.svg");
			val.alt = "Edit Tags";
		}
	}

	// find which tags were used
	let acceptedTagIDs = [];

	let siblings = editTagsButton.parentElement.children;
	for (let i = 0; i < siblings.length; i++) {
		if (siblings[i].classList.contains("angeldots-tag")) {
			// remove the (x) and add it to the updated tags list
			acceptedTagIDs.push(siblings[i].getAttribute("data-tag-id"));
			for (let j = 0; j < siblings[i].children.length; j++) {
				if (siblings[i].children[j].classList.contains("angeldots-removeTagButton")) {
					siblings[i].children[j].remove();
				}
			}
		} else if (siblings[i].classList.contains("angeldots-addInput")
			|| siblings[i].classList.contains("angeldots-datalist")) {
			// remove the extra elements that were added for editing
			siblings[i].remove();
		}
	}

	// save the data
	// TODO: redo the parentElement.parentElement link into ancestry.js
	updateAssignments(getMatchID(editTagsButton.parentElement.parentElement), acceptedTagIDs);
}

function constructEditTagsButton() {
	const editTagsButton = document.createElement("button");
	editTagsButton.classList.add("angeldots-editTagsButton");
	editTagsButton.innerHTML = "<img src='" +
		chrome.runtime.getURL("img/wing.svg") +
		"' alt='Edit Tags'/>";

	editTagsButton.onclick = function () {
		if (this.classList.contains("angeldots-editTagsButton")) { // EDIT
			mutateForEdit(this);
		} else { // SAVE
			mutateForSave(this);
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


