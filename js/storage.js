
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

// global variables this script uses:
let syncData;
let idsToAssignmentSlot = {};


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
        ],
    },
    "assignments0" : {}
}

async function initializeChromeSyncStorage() {
    await chrome.storage.sync.set(initialSyncStorage);
}

function loadChromeSyncStorage() {
    chrome.storage.sync.get(null, function(items) {
        if (!("director" in items)) {
            initializeChromeSyncStorage();
            syncData = initialSyncStorage;
        } else {
            syncData = items;
        }
        constructAssignments();
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

function updateAssignments(id, tagIDs) {
    // assignments[id] = tagIDs;
    // by default, use assignment0

    let newAssignment0 = syncData["assignments0"];
    newAssignment0[id] = tagIDs;

    // do some unsaved data thing...
    chrome.storage.sync.set({"assignments0" : newAssignment0});
}

function removeTags(tagIDsToRemove) {
    console.log("Removing...");
    console.log(tagIDsToRemove);
    let newAssignment0 = syncData["assignments0"];
    for (let key in newAssignment0) {
        const tmp = newAssignment0[key].filter(x => !(tagIDsToRemove.includes(x)));
        console.log(newAssignment0[key]);
        console.log(tmp);
        newAssignment0[key] = tmp;

    }
    console.log(newAssignment0);
    // chrome.storage.sync.set({"assignments0" : newAssignment0});
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