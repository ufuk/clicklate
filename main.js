// When extension installed, open options page at once
chrome.runtime.onInstalled.addListener(function () {
    console.log("Extension installed.");
    chrome.runtime.openOptionsPage(function () {
        console.log("Options page opened.");
    });
});

// Create alarm
// Documentation for "chrome.alarms": https://developer.chrome.com/extensions/alarms
function createAlarm() {
    getAlarmOptions(function (options) {
        chrome.alarms.clearAll(function () {
            console.log("Alarms cleared.");

            if (options && options.activated) {
                chrome.alarms.create("clicklate", {periodInMinutes: options.period});
                console.log("Alarms created.");
            }
        });
    });
}
createAlarm();

// Configure what will happened when alarm triggered
chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Alarm triggered: " + alarm.name);

    executeAlarm(alarm.name);
});

// Documentation for "chrome.notifications": https://developer.chrome.com/extensions/notifications
function notifyForVocab(alarmName, title, message) {
    chrome.notifications.getAll(function (notifications) {
        console.log("Current notification ids: " + JSON.stringify(notifications));

        var notificationIds = Object.keys(notifications);
        for (var i = 0; i < notificationIds.length; i++) {
            var eachNotificationId = notificationIds[i];
            if (eachNotificationId.startsWith(alarmName)) {
                console.log("Notification already exists: " + eachNotificationId);
                chrome.notifications.clear(eachNotificationId, function (wasCleared) {
                    if (wasCleared) {
                        console.log("Notification cleared: " + eachNotificationId);
                    } else {
                        console.log("Notification couldn't be cleared: " + eachNotificationId);
                    }
                });
            }
        }

        var notificationId = alarmName + "-" + new Date().getTime();
        chrome.notifications.create(notificationId, {
            "type": "basic",
            "title": title,
            "iconUrl": chrome.extension.getURL("clicklate-logo-128.png"),
            "message": message
        }, function () {
            console.log("Notification created: " + notificationId);
        });
    });
}

// Options page messages listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message received: " + request.message);

        if (request.message == "newOptionsSaved") {
            createAlarm();
            sendResponse({message: "alarmsReCreated"});
        } else if (request.message == "testScript") {
            executeAlarmWithOptions(request.alarmOptions, "test-script");
            sendResponse({message: "scriptEvaluated"});
        }
    }
);

// Get alarm options from Chrome Storage API
function getAlarmOptions(callback) {
    console.log("Getting options...");
    chrome.storage.sync.get({
        period: 5,
        script: '',
        activated: false
    }, function (options) {
        callback(options);
    });
}

// Get alarm options, evaluate and notify
function executeAlarm(alarmName) {
    getAlarmOptions(function (options) {
        executeAlarmWithOptions(options, alarmName);
    });
}

function executeAlarmWithOptions(alarmOptions, alarmName) {
    if (alarmOptions && alarmOptions.activated) {
        chrome.storage.sync.get({
            vocab: []
        }, function (results) {
            var vocabArray = results.vocab;
            if (vocabArray.length > 0) {
                var selectedVocab = vocabArray[0];
                //TODO: notifyForVocab(alarmName, selectedVocab.vocab, selectedVocab.inTurkish + selectedVocab.inEnglish);
                notifyForVocab(alarmName, "Ups!", "Hatırlatıcı özelliği henüz hazır değil.");
            }
        });
    }
}

// Execute alarm when browser action clicked
chrome.browserAction.onClicked.addListener(function (tab) {
    console.log("Browser action clicked.");

    getAlarmOptions(function (options) {
        options.activated = true;
        executeAlarmWithOptions(options, "run-with-browser-action");
    });
});
