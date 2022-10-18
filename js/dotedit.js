
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
	if (match32 in assignments) {
		tagElements = assignments[match32].map(function(value) {return makeTagHTML(tags[value])});
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
 *
 *   DONE up to here.
 *
 *   b) have dropdowns be from tags
 *   c) add tag info once selected
 * 7) save tag assignment to JSON
 * 8) save tag assignment to chrome.sync
 * 9) refactor tag assignment
 *
 * tags
 * 1) display tag info (n matches, name, short name, color)
 * 2) edit tag info
 * 3) make new tag
 * 4) delete old tags
 * 5) handle tag errors
 *
 * features
 * 1) hide ancestry tags?
 * 2) hide some angel tags?
 */

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
			let addDatalist = document.createElement("datalist");
			addDatalist.classList.add("angeldots-addDatalist");
			addDatalist.id = "browsers";
			addDatalist.innerHTML = "  <option value=\"Chrome\"></option>\n" +
				"  <option value=\"Firefox\"></option>\n" +
				"  <option value=\"Internet Explorer\"></option>\n" +
				"  <option value=\"Opera\"></option>\n" +
				"  <option value=\"Safari\"></option>\n" +
				"  <option value=\"Microsoft Edge\"></option>\n";

			this.after(addDatalist);

			let addInput = document.createElement("input");
			addInput.setAttribute('list', addDatalist.id);
			addInput.classList.add("angeldots-addInput");
			addInput.id = "foobar";
			addInput.name = "foobar2";
			addInput.onchange = function() {
				// check whether it's a valid entry (use a JSON thing?)
				console.log("onchange");
			}
			addInput.oninput = function() {
				console.log("oninput");
			}
			this.after(addInput);

			// find its siblings, and give them all (x) buttons
			for (let i = 0; i < siblings.length; i++) {

				if (siblings[i].classList.contains("angeldots-tag")) {
					const removeTagButton = document.createElement("button");
					removeTagButton.classList.add("angeldots-removeTagButton");
					removeTagButton.innerHTML = "<img src='" +
						chrome.runtime.getURL("img/close.svg") +
						"' alt='Remove Tag'/>";
					removeTagButton.onclick = function() {
						this.parentElement.remove();
					}
					siblings[i].append(removeTagButton);
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



