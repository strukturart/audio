"use strict";


function notify(param_title, param_text, param_silent) {

    var options = {
            body: param_text,
            silent: true
        }
        // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(param_title, options);

    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function(permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification(param_title, options);


            }
        });
    }

}

function toaster(text) {

    $("div#toast").text(text)
    $("div#toast").animate({ top: "0px" }, 1000, "linear", function() {


        $("div#toast").delay(3000).animate({ top: "-100px" }, 3000);


    });

}

function localStorageWriteRead(item, value) {
    if (item != "" && value != "") {
        localStorage.setItem(item, value)
    }


    return localStorage.getItem(item)

}


//delete file
function deleteFile(storage, path, notification) {
    let sdcard = navigator.getDeviceStorages("sdcard");

    let requestDel = sdcard[storage].delete(path);

    requestDel.onsuccess = function() {
        if (notification == "notification") {
            toaster('File "' + name + '" successfully deleted frome the sdcard storage area');
        }
    }

    requestDel.onerror = function() {
        toaster('Unable to delete the file: ' + this.error);
    }

}








let vibrateInterval;

// Starts vibration at passed in level
function startVibrate(duration) {
    navigator.vibrate(duration);
}

// Stops vibration
function stopVibrate() {
    // Clear interval and stop persistent vibrating
    if (vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
}

// Start persistent vibration at given duration and interval
// Assumes a number value is given
function startPersistentVibrate(duration, interval) {
    vibrateInterval = setInterval(function() {
        startVibrate(duration);
    }, interval);
}