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

function doInCurrentTab(tabCallback) {
    chrome.tabs.query(
        {currentWindow: true, active: true},
        function (tabArray) {
            tabCallback(tabArray[0]);
        }
    );
}

function onClickContextMenuOptions(info, tab) {
    if (info.menuItemId === "translate") {
        chrome.tabs.executeScript(tab.id, {file: 'balloon.js', allFrames: true}, function () {
            search(info.selectionText, tab.id);
        });

        console.log(info.selectionText);
    }
}

const selectedTextGetter = function () {
    const selection = window.getSelection();
    return (selection.rangeCount > 0) ? selection.toString() : '';
};

chrome.commands.onCommand.addListener(function (command) {
    console.log('command:', command);

    if (command === "search-phrase") {
        doInCurrentTab(function (tab) {
            chrome.tabs.executeScript(null, {
                    code: ';(' + selectedTextGetter + ')();',
                    allFrames: true
                },
                function (selectedTextPerFrame) {
                    if ((selectedTextPerFrame.length > 0) && (typeof (selectedTextPerFrame[0]) === 'string')) {
                        const text = selectedTextPerFrame[0];
                        chrome.tabs.executeScript(tab.id, {file: 'balloon.js', allFrames: true}, function () {
                            search(text, tab.id);
                        });
                    }
                });
        });
    }
});

function search(searchString, tabId) {
    if (!searchString) {
        return;
    }

    chrome.tabs.sendMessage(tabId, {method: 'createBalloon'});

    const request = new XMLHttpRequest();
    request.open("GET", getSearchURL(searchString), true);
    let completed = false;
    request.onreadystatechange = function () {
        if (!completed && request.readyState === 4 && request.status === 200) {
            const responseText = request.responseText;
            chrome.tabs.sendMessage(tabId, {
                method: 'showResult',
                string: getResultsForResponseText(responseText, getSearchURL(searchString))
            });
            completed = true;
        }
        if (request.readyState === 4 && (request.status === 0 || request.status === 404)) {
            chrome.tabs.sendMessage(tabId, {
                method: 'showResult',
                string: '<p style=\'margin: 0; padding: 0; color: black; font: italic normal 14px Verdana, sans-serif;\'>Tureng ile bağlantı kurulamadı!</p>'
            });
        }
    }
    request.send();
}

function getSearchURL(searchString) {
    return "http://tureng.com/search/" + searchString;
}

function getResultsForResponseText(responseText, url) {
    let result = "";

    const tables = $($.parseHTML(responseText)).find('#englishResultsTable');
    const isThereCrossLanguageResult = tables.length === 3;

    const englishResultsTable = $(tables[0]);
    if (englishResultsTable != null) {
        let resultsForLanguage = getResultsFromTags(englishResultsTable.find("a"));
        if (resultsForLanguage !== "") {
            if (isThereCrossLanguageResult) {
                result += "<p style='border-bottom: 1px solid rgba(0, 0, 0, 0.75); margin: 0; padding: 0; color: black; font: italic bold 14px Verdana, sans-serif;'>İngilizce - Türkçe</p>";
            }
            result += resultsForLanguage;
        }
    }

    if (isThereCrossLanguageResult) {
        const turkishResultsTable = $(tables[1]);
        if (turkishResultsTable != null) {
            let resultsForLanguage = getResultsFromTags(turkishResultsTable.find("a"));
            if (resultsForLanguage !== "") {
                if (result !== "") {
                    result += "<p style='border-bottom: 1px solid rgba(0, 0, 0, 0.75); margin: 5px 0 0 0; padding: 0; color: black; font: italic bold 14px Verdana, sans-serif;'>Türkçe - İngilizce</p>";
                } else {
                    result += "<p style='border-bottom: 1px solid rgba(0, 0, 0, 0.75); margin: 0; padding: 0; color: black; font: italic bold 14px Verdana, sans-serif;'>Türkçe - İngilizce</p>";
                }
                result += resultsForLanguage;
            }
        }
    }

    if (result !== "") {
        result += "<a href='" + url + "' target='_blank' style='border: none; float: right; line-height: 0; height: 7px; margin: 0; padding: 0; color: rgba(0, 0, 0, 0.75); font: italic bold 10px Verdana, sans-serif; text-align: center; text-decoration: none;'>...</p>";
        return result;
    }

    return "<p style='margin: 0; padding: 0; color: black; font: italic normal 14px Verdana, sans-serif;'>Çeviri bulunamadı...</p>";
}

function getResultsFromTags(aTags) {
    let resultsForLanguage = "";

    let uniqueResults = getUniqueResultsExactOrder(aTags);
    for (let i = 0; i < uniqueResults.length; i++) {
        if (i >= 4 || (i + 1 === uniqueResults.length && i < 4)) {
            resultsForLanguage += "<p style='margin: 0; padding: 0; color: black; font: italic normal 14px Verdana, sans-serif;'>" + uniqueResults[i] + "</p>";
            break;
        }
        resultsForLanguage += "<p style='border-bottom: 1px solid rgba(0, 0, 0, 0.15); margin: 0; padding: 0; color: black; font: italic normal 14px Verdana, sans-serif;'>" + uniqueResults[i] + "</p>";
    }

    return resultsForLanguage;
}

function getUniqueResultsExactOrder(aTags) {
    const uniqueResults = [];

    for (let i = 1; i < aTags.length; i = i + 2) {
        if (uniqueResults.indexOf(aTags[i].text) === -1) {
            uniqueResults.push(aTags[i].text);
        }
    }

    return uniqueResults;
}