if (!window.isClicklateLoaded) {
    function createBalloon() {
        var selection = window.getSelection && window.getSelection();
        if (!selection || selection.rangeCount < 1) {
            return;
        }

        var rect = selection.getRangeAt(0).getBoundingClientRect();
        var span = document.createElement("span");
        var tail = document.createElement("span");
        var loading = document.createElement("img");
        var content = document.createElement("span");

        /* Balloon Span */
        span.style.backgroundAttachment = "scroll";
        span.style.backgroundClip = "border-box";
        span.style.backgroundImage = "none";
        span.style.backgroundOrigin = "padding-box";
        span.style.boxShadow = "7px 7px 7px rgba(0, 0, 0, 0.3)";
        span.style.border = "2px solid #bd1e2c";
        span.style.borderTopColor = "rgb(1, 153, 241)";
        span.style.borderBottomColor = "rgb(120, 191, 35)";
        span.style.borderRightColor = "rgb(235, 147, 22)";
        span.style.borderLeftColor = "rgb(229, 35, 80)";
        span.style.borderRadius = "0px";
        span.style.cursor = "auto";
        span.style.display = "block";
        span.style.margin = "0px";
        span.style.padding = "10px";
        span.style.zIndex = "100000";
        span.style.background = "white";
        span.style.position = "absolute";
        span.style.height = "auto";
        span.style.width = "175px";
        span.style.right = "3px";
        span.style.whiteSpace = "pre-wrap";
        span.style.textAlign = "left";
        span.style.color = "black";
        span.style.font = "italic normal 14px Verdana, sans-serif;";
        span.style.left = (rect.left - 15) + "px";
        span.style.top = (rect.top + rect.height + window.pageYOffset + 11) + "px";

        /* Loading Image */
        loading.src = chrome.runtime.getURL("preloader.gif");
        loading.style.backgroundAttachment = "scroll";
        loading.style.backgroundClip = "border-box";
        loading.style.backgroundColor = "transparent";
        loading.style.backgroundImage = "none";
        loading.style.backgroundOrigin = "padding-box";
        loading.style.bordeStyle = "none";
        loading.style.border = "none";
        loading.style.color = "white";
        loading.style.cursor = "auto";
        loading.style.display = "block";
        loading.style.left = "auto";
        loading.style.lineHeight = "normal";
        loading.style.margin = "0px auto";
        loading.style.padding = "0px";
        loading.style.width = "14px";
        loading.style.height = "14px";
        loading.style.position = "static";
        loading.style.zIndex = "auto";

        /* Tail Image */
        tail.style.backgroundAttachment = "scroll";
        tail.style.backgroundClip = "border-box";
        tail.style.backgroundColor = "transparent";
        tail.style.backgroundImage = "none";
        tail.style.backgroundOrigin = "padding-box";
        tail.style.border = "none";
        tail.style.width = "0px";
        tail.style.height = "0px";
        tail.style.borderBottom = "10px solid rgb(1, 153, 241)";
        tail.style.borderLeft = "10px solid transparent";
        tail.style.borderRight = "10px solid transparent";
        tail.style.color = "white";
        tail.style.cursor = "auto";
        tail.style.display = "block";
        tail.style.fontFamily = "sans-serif";
        tail.style.fontSize = "14px";
        tail.style.fontStyle = "normal";
        tail.style.fontVariant = "normal";
        tail.style.fontWeight = "normal";
        tail.style.left = "-22px";
        tail.style.lineHeight = "normal";
        tail.style.margin = "0px";
        tail.style.outlineColor = "white";
        tail.style.outlineStyle = "none";
        tail.style.outlineWidth = "0px";
        tail.style.padding = "0";
        tail.style.position = "absolute";
        tail.style.right = "auto";
        tail.style.textAlign = "left";
        tail.style.left = "15px";
        tail.style.top = "-12px";
        tail.style.verticalAlign = "baseline";
        tail.style.zIndex = "auto";

        span.appendChild(content);
        span.appendChild(loading);
        span.appendChild(tail);
        document.body.appendChild(span);
        span.addEventListener("click", function () {
            balloon.close();
        }, false);

        let balloon = {
            setText: function (text) {
                span.removeChild(loading);
                content.innerHTML = text;
            },
            close: function () {
                span.parentNode.removeChild(span);
            }
        };

        return balloon;
    }

    function getResultsForResponseText(responseText, searchURL) {
        let result = "";

        const parser = new DOMParser();
        const doc = parser.parseFromString(responseText, "text/html");

        const tables = doc.querySelectorAll("#englishResultsTable");
        const isThereCrossLanguageResult = tables.length === 3;

        const englishResultsTable = tables[0];
        if (englishResultsTable) {
            const resultsForLanguage = getResultsFromTags(englishResultsTable.querySelectorAll("a"));
            if (resultsForLanguage != "") {
                if (isThereCrossLanguageResult) {
                    result += "<p style='border-bottom: 1px solid rgba(0, 0, 0, 0.75); margin: 0; padding: 0; color: black; font: italic bold 14px Verdana, sans-serif;'>İngilizce - Türkçe</p>";
                }
                result += resultsForLanguage;
            }
        }

        if (isThereCrossLanguageResult) {
            const turkishResultsTable = tables[1];
            if (turkishResultsTable != null) {
                let resultsForLanguage = getResultsFromTags(turkishResultsTable.querySelectorAll("a"));
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
            result += "<a href='" + searchURL + "' target='_blank' style='border: none; float: right; line-height: 0; height: 7px; margin: 0; padding: 0; color: rgba(0, 0, 0, 0.75); font: italic bold 10px Verdana, sans-serif; text-align: center; text-decoration: none;'>...</p>";
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

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.method === "showResult") {
            if (!balloon) {
                // ignore
                return;
            }

            if (!request.externalRequestSucceeded) {
                request.resultText = '<p style=\'margin: 0; padding: 0; color: black; font: italic normal 14px Verdana, sans-serif;\'>Tureng ile bağlantı kurulamadı!</p>'
            } else {
                request.resultText = getResultsForResponseText(request.rawResponseText, request.searchURL);
            }

            balloon.setText(request.resultText);
            sendResponse({ "message": "Result text is displayed" });
        }

        if (request.method === "createBalloon") {
            try {
                if (balloon) {
                    balloon.close()
                }
            } catch (e) {
                // ignore
            }

            balloon = createBalloon();
            sendResponse({ "message": "Balloon is created" });
        }
    });
}
window.isClicklateLoaded = true;
