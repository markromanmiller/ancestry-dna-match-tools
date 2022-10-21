
function deleteTag(event) {
    console.log("delete pressed on");
    console.log(event.target);
}

function addNewTag() {
    console.log("newTag");
}

function saveTagDefinitions() {
    console.log("Saving tag definitions");
}

function resetTagDefinitions() {
    console.log("Reset tag definitions");
}

function constructTagRow(tagID) {
    const tagInfo = tags[tagID];
    const tagRow = document.createElement("tr");
    tagRow.setAttribute("data-tag-id", tagID);
    tagRow.innerHTML = "<td><input type='color' value='" + tagInfo["color"] +"'></td>" +
        "<td><input type='text' value='" + tagInfo["name"] + "'></td>" +
        "<td><input style='width:100px' type='text' value='" + tagInfo["shortName"] + "'></td>";

    const deleteButton = document.createElement("td");
    deleteButton.innerHTML = "<button class='btn btn-outline-danger'><object data='" +
        chrome.runtime.getURL("img/trash.svg") +
        "'/></button>";
    deleteButton.children[0].onclick = deleteTag;

    tagRow.append(deleteButton);
    return tagRow;
}

function constructAddTagRow() {
    const addTagRow = document.createElement("tr");
    addTagRow.id = "add-tag-row";
    addTagRow.innerHTML = "<td></td><td></td><td></td><td>" +
        "<button class='btn btn-outline-success'><object data='" +
        chrome.runtime.getURL("img/add.svg") +
        "'/></button></td>";
    addTagRow.children[3].children[0].onclick = addNewTag;
    return addTagRow;
}

document.getElementById("savetag").onclick = saveTagDefinitions;

let tagTable = document.getElementById("tagdefs");
for (const key in tags) {
    tagTable.append(constructTagRow(key));
}
tagTable.append(constructAddTagRow());

// document.getElementById("copypastetextarea").value = JSON.stringify(tags, null, 2);