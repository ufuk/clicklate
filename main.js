chrome.contextMenus.onClicked.addListener(onClickContextMenuOptions);
chrome.runtime.onInstalled.addListener(createContextMenuOptions);

function createContextMenuOptions() {
	chrome.contextMenus.create({
		"title": "Tureng'de ara", 
		"id": "translate", 
		"contexts": [
			"selection"
		]
	});
}

function onClickContextMenuOptions(info, tab) {
	if (info.menuItemId == "translate") {
		chrome.tabs.executeScript(tab.id, {file: 'balloon.js', allFrames: true}, function() {
			search(info.selectionText, tab.id);
		});
		
		console.log(info.selectionText);
	}
}

function search(searchString, tabId) {
	var request = new XMLHttpRequest();
	request.open("GET", getSearchURL(searchString), true);
	var completed = false;
	chrome.tabs.sendMessage(tabId, {method: 'createBalloon'});
	request.onreadystatechange = function() {
		if (!completed && request.readyState == 4 && request.status == 200) {
			chrome.tabs.sendMessage(tabId, {method: 'showResult', string: getResultsForResponseText(request.responseText, getSearchURL(searchString))});
			completed = true;
		}
		if (request.readyState == 4 && (request.status == 0 || request.status == 404)) {
			chrome.tabs.sendMessage(tabId, {method: 'showResult', string: '<p style=\'margin: 0px; padding: 0px; color: black; font: italic normal 12px Verdana, sans-serif;\'>Tureng ile bağlantı kurulamadı!</p>'});
		}
	}
	request.send();
}

function getSearchURL(searchString) {
	return "http://tureng.com/search/" + searchString;
}

function getResultsForResponseText(responseText, url) {
	var result = "";
	
	var table = getTableById(responseText, "englishResultsTable");
	if (table != null) {
		var resultsForLanguage = getResultsFromTags(table.find("a"));
		if (resultsForLanguage != "") {
			result += "<p style='border-bottom: 1px solid rgba(189, 30, 44, 0.75); margin: 0px; padding: 0px; color: #bd1e2c; font: italic bold 12px Verdana, sans-serif;'>İngilizce - Türkçe</p>";
			result += resultsForLanguage;
		}
	}
	
	var table = getTableById(responseText, "turkishResultsTable");
	if (table != null) {
		var resultsForLanguage = getResultsFromTags(table.find("a"));
		if (resultsForLanguage != "") {
			if (result != "") {
				result += "<p style='border-bottom: 1px solid rgba(189, 30, 44, 0.75); margin: 5px 0px 0px 0px; padding: 0px; color: #bd1e2c; font: italic bold 12px Verdana, sans-serif;'>Türkçe - İngilizce</p>";
			} else {
				result += "<p style='border-bottom: 1px solid rgba(189, 30, 44, 0.75); margin: 0px; padding: 0px; color: #bd1e2c; font: italic bold 12px Verdana, sans-serif;'>Türkçe - İngilizce</p>";
			}
			result += resultsForLanguage;
		}
	}
	
	if (result != "") {
		result += "<a href='" + url + "' target='_blank' style='border: none; float: right; line-height: 0px; height: 5px; margin: 0px; padding: 0px; color: rgba(189, 30, 44, 0.75); font: italic normal 8px Verdana, sans-serif; text-align: center; text-decoration: none;'>>>></p>";
		return result;
	}
	
	return "<p style='margin: 0px; padding: 0px; color: black; font: italic normal 12px Verdana, sans-serif;'>Sonuç bulunamadı!</p>";
}

function getResultsFromTags(aTags) {
	var resultsForLanguage = "";
	
	uniqueResults = getUniqueResults(aTags);
	for (var i = 0; i < uniqueResults.length; i++) {
		if (i >= 4 || (i + 1 == uniqueResults.length && i < 4)) {
			resultsForLanguage += "<p style='margin: 0px; padding: 0px; color: black; font: italic normal 12px Verdana, sans-serif;'>" + uniqueResults[i] + "</p>";
			break;
		}
		resultsForLanguage += "<p style='border-bottom: 1px solid rgba(189, 30, 44, 0.15); margin: 0px; padding: 0px; color: black; font: italic normal 12px Verdana, sans-serif;'>" + uniqueResults[i] + "</p>";
	}
	
	return resultsForLanguage;
}

function getUniqueResults(aTags) {
	var uniqueResults = new Array();
	
	for (var i = 1; i < aTags.length; i = i + 2) {
		if (uniqueResults.indexOf(aTags[i].text) == -1) {
			uniqueResults.push(aTags[i].text);
		}
	}
	
	return uniqueResults;
}

function getTableById(responseText, resultTableId) {
	return $($.parseHTML(responseText)).find('#' + resultTableId);
}