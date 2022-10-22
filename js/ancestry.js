function getMatchID(target) {
    if (isComparePageTarget(target)) {
        return getComparePageMatchID();
    } else {
        return target.id.slice(-32);
    }
}

function doesNeedTagContainer(target) {
    // main page, regular matches
    return target.classList.contains("matchGrid") ||
        // compare page
        target.classList.contains("headerBottom");
}

function isComparePageTarget(target) {
    return target.classList.contains("headerBottom");
}

function isComparePage() {
    const currentURL = window.location.href;
    return /www\.ancestry\.com\/discoveryui-matches\/compare/.test(currentURL);
}

function getComparePageMatchID() {
    const currentURL = window.location.href;
    const regex = /https:\/\/www\.ancestry\.com\/discoveryui-matches\/compare\/[A-Fa-f0-9\-]{36}\/with\/([A-Fa-f0-9\-]{36})/;
    const otherID = regex.exec(currentURL)[1];
    return otherID.replace(/-/g, '').toLowerCase();
}