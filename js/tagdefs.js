const defaultTagInfo = {
    "name" : "New Tag",
    "shortName" : "",
    "color" : "#8c8c8c"
}

function addNewTag() {
    const newTagInfo = Object.assign({}, defaultTagInfo);
    document.getElementById("add-tag-row").before(constructTagRow(-1, newTagInfo));
}

function deleteTag(event) {
    // go up until you hit a tagRow
    let element = event.target;
    while (!element.classList.contains("tagRow") && element.parentElement) {
        element = element.parentElement;
    }
    if (element.classList.contains("tagRow")) {
        element.remove();
    }
}

function saveTagDefinitions() {
    console.log("Saving tag definitions");

    const oldTagIDs = Object.keys(tags);
    const newTagIDS = [];

    let nextBestTagID = 0;

    // any tag id of -1 needs an assignment

    const tagdefs = document.getElementById("tagdefs");
    for (let i = 0; i < tagdefs.children.length; i++) {
        const row = tagdefs.children[i];
        if (!row.classList.contains("tagRow")) {
            continue;
        }
        let tagID = +(row.getAttribute("data-tag-id"));
        console.log("next ag");
        console.log(tagID);
        if (tagID < 0) {
            while (nextBestTagID.toString() in newTagIDS) {
                nextBestTagID++;
            }
            tagID = nextBestTagID;
        }
        newTagIDS.push(tagID.toString());
        console.log(row);
        tags[tagID] = {
            "name": row.children[1].children[0].value,
            "shortName": row.children[2].children[0].value,
            "color": row.children[0].children[0].value
        }
    }
    console.log("New and old!");
    console.log(oldTagIDs);
    console.log(newTagIDS);

    const tagsToRemove = oldTagIDs.filter(v => !(newTagIDS.includes(v)));
    removeTags(tagsToRemove);

    // any missing tags need to be removed from all people.

    console.log(tags);
    console.log(assignments);

    resetTagDefinitions();
}

function resetTagDefinitions() {
    let tagTable = document.getElementById("tagdefs");
    tagTable.replaceChildren();
    populateTagTable();
}

function constructTagRow(tagID, tagInfo) {
    const tagRow = document.createElement("tr");
    tagRow.classList.add("tagRow");
    tagRow.setAttribute("data-tag-id", tagID);
    tagRow.innerHTML = "<td><input type='color' value='" + tagInfo["color"] +"'></td>" +
        "<td><input type='text' value='" + tagInfo["name"] + "'></td>" +
        "<td><input style='width:100px' type='text' value='" + tagInfo["shortName"] + "'></td>";

    const deleteButton = document.createElement("td");
    deleteButton.innerHTML = "<button class='btn btn-outline-danger'><img src='" +
        chrome.runtime.getURL("img/trash.svg") +
        "' alt='Delete Tag'/></button>";
    deleteButton.children[0].onclick = deleteTag;

    tagRow.append(deleteButton);
    return tagRow;
}

function constructAddTagRow() {
    const addTagRow = document.createElement("tr");
    addTagRow.id = "add-tag-row";
    addTagRow.innerHTML = "<td></td><td></td><td></td><td>" +
        "<button class='btn btn-outline-success'><img src='" +
        chrome.runtime.getURL("img/add.svg") +
        "' alt='Add Tag'/></button></td>";
    addTagRow.children[3].children[0].onclick = addNewTag;
    return addTagRow;
}

loadChromeSyncStorage();

document.getElementById("savetag").onclick = saveTagDefinitions;
document.getElementById("resettag").onclick = resetTagDefinitions;

function populateTagTable() {
    let tagTable = document.getElementById("tagdefs");
    const header = document.createElement("tr");
    header.innerHTML = "<th>Color</th><th>Full Name</th><th>Tag</th><th></th>";
    tagTable.append(header);
    for (const key in tags) {
        tagTable.append(constructTagRow(key, tags[key]));
    }
    tagTable.append(constructAddTagRow());
}

populateTagTable();

// document.getElementById("copypastetextarea").value = JSON.stringify(tags, null, 2);