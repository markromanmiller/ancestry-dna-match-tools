function getMatchID(target) {
    return target.id.slice(-32);
}

function doesNeedTagContainer(target) {
    return target.classList.contains("matchGrid");
}