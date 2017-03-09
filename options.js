// Saves options to chrome.storage.
function saveOptions() {
    var newOptions = extractOptionsFromInputs();

    console.log("Options saving: ");
    console.log(newOptions);

    chrome.storage.sync.set(newOptions, function () {
        // Saved
        console.log('Options saved.');

        // Show 'saved' message
        displayStatus("Kaydedildi.");

        // Send message to refresh alarm
        chrome.runtime.sendMessage({message: "newOptionsSaved"}, function (response) {
            console.log(response.message);
        });
    });
}

// Restores settings using the stored data in chrome.storage.
function restoreOptions() {
    var $period = periodInput();
    var $activated = activatedInput();

    console.log("Options restoring...");
    chrome.storage.sync.get({
        period: 5,
        activated: false
    }, function (options) {
        $period.val(options.period);
        $activated.prop('checked', options.activated);

        console.log("Options restored: ");
        console.log(options);
    });
}

// Helper methods
function periodInput() {
    return $('input[name="period"]');
}

function activatedInput() {
    return $('input[name="activated"]');
}

function extractOptionsFromInputs() {
    var $period = periodInput();
    var $activated = activatedInput();

    return {
        period: parseInt($period.val()),
        activated: $activated.prop('checked')
    };
}

function displayStatus(statusText) {
    var $statusLabel = $('#statusLabel');
    $statusLabel.text(statusText);
    setTimeout(function () {
        $statusLabel.text('');
    }, 750);
}

// Set event bindings
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
