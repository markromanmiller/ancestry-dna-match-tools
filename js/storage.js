
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
 *     },
 *     ...
 * }
 */

// global variables that other scripts use:
let assignments;
let tags;

// global variables this script uses:
let syncData;
let idsToAssignmentSlot = {};

function getTags() {
    return tags;
}

const initialSyncStorage = {
    "director": {
        "assignments": [
            "assignments0"
        ],
        "tags":[
            "tags0"
        ]
    },
    "assignments0" : {},
    "tags0" : {}
}

async function initializeChromeSyncStorage() {
    await chrome.storage.sync.set(initialSyncStorage);
}

function loadChromeSyncStorage(extraCallback) {
    chrome.storage.sync.get(null, function(items) {
        if (!("director" in items)) {
            initializeChromeSyncStorage();
            syncData = initialSyncStorage;
        } else {
            syncData = items;
        }
        constructAssignments();
        constructTags();
        if(extraCallback) {
            extraCallback();
        }
    });
}

function constructAssignments() {
    let newAssignments = {};
    // let idsToAssignmentSlot = {};
    for (let i = 0; i < syncData.director.assignments.length; i++) {
        Object.assign(newAssignments, syncData[syncData.director.assignments[i]]);
    }
    assignments = newAssignments;
}

function constructTags() {
    let newTags = {};
    Object.assign(newTags, syncData.tags0);
    tags = newTags;
}

function updateAssignments(id, tagIDs) {
    // assignments[id] = tagIDs;
    // by default, use assignment0

    let newAssignment0 = syncData["assignments0"];
    newAssignment0[id] = tagIDs;

    // do some unsaved data thing...
    chrome.storage.sync.set({"assignments0" : newAssignment0});
}

function updateTags(newTags, callback) {

    const oldTagIDs = Object.keys(tags);
    const newTagIDs = Object.keys(newTags);
    const tagIDsToRemove = oldTagIDs.filter(v => !(newTagIDs.includes(v)));

    console.log("Removing...");
    console.log(tagIDsToRemove);
    let newAssignment0 = syncData["assignments0"];
    for (let key in newAssignment0) {
        newAssignment0[key] = newAssignment0[key].filter(x => !(tagIDsToRemove.includes(x)));
    }

    // tags = Object.assign({}, newTags);

    chrome.storage.sync.set({
        "assignments0" : newAssignment0,
        "tags0" : newTags
    }).then(callback);
}

// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        for (let key in changes) {
            syncData[key] = changes[key].newValue;
        }
        constructAssignments();
        constructTags();
    }
});