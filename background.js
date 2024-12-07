chrome.contextMenus.onClicked.addListener(onClickContextMenuOptions);
chrome.runtime.onInstalled.addListener(createContextMenuOptions);

function createContextMenuOptions() {
    chrome.contextMenus.create({
        "title": "Çevir",
        "id": "translate",
        "contexts": [
            "selection"
        ]
    });
}

function doInCurrentTab(callback) {
    chrome.tabs.query(
        { active: true, lastFocusedWindow: true },
        ([tab]) => {
            callback([tab][0]);
        }
    );
}

function onClickContextMenuOptions(info, tab) {
    if (info.menuItemId === "translate") {
        const selectedText = info.selectionText;
        searchSelectedText(selectedText, tab);
    }
}

chrome.commands.onCommand.addListener(function (command) {
    if (command === "search-phrase") {
        doInCurrentTab(function (tab) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                files: ['selected-text-getter.js'],
            }).then((selectedTextPerFrame) => {
                if ((selectedTextPerFrame.length > 0) && selectedTextPerFrame[0].result && (typeof (selectedTextPerFrame[0].result) === 'string')) {
                    const selectedText = selectedTextPerFrame[0].result;
                    searchSelectedText(selectedText, tab);
                }
            });
        });
    }
});

function searchSelectedText(selectedText, tab) {
    console.log("Selected text:" + selectedText);
    chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ['balloon.js'],
    }).then(() => search(selectedText, tab.id));
}

async function search(searchString, tabId) {
    if (!searchString) {
        return;
    }

    const response = await chrome.tabs.sendMessage(tabId, { method: 'createBalloon' });
    console.log(response);

    fetch(getSearchURL(searchString))
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(async responseText => {
            const response = await chrome.tabs.sendMessage(tabId, {
                method: 'showResult',
                searchURL: getSearchURL(searchString),
                rawResponseText: responseText,
                externalRequestSucceeded: true
            });
            console.log(response);
        })
        .catch(async error => {
            const response = await chrome.tabs.sendMessage(tabId, {
                method: 'showResult',
                externalRequestSucceeded: false
            });
            console.log(response);
        });
}

function getSearchURL(searchString) {
    return "http://tureng.com/search/" + searchString;
}
