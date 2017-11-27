importScripts('https://www.gstatic.com/firebasejs/3.7.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.7.2/firebase-messaging.js');

var config = {
    apiKey: "AIzaSyBXH1N-C-3Gi80tglAOQccdurbjukhu2Io",
    authDomain: "logovazzik-otn.firebaseapp.com",
    databaseURL: "https://logovazzik-otn.firebaseio.com",
    projectId: "logovazzik-otn",
    storageBucket: "logovazzik-otn.appspot.com",
    messagingSenderId: "314128418145"
};
firebase.initializeApp(config);
firebase.messaging();

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
});

var applyTemplate = function (template, replacements) {
    return template.replace(/{(\w+)}/g, function (e, n) {
        return undefined !== replacements[n] ? encodeURIComponent(replacements[n]) : "";
    });
};

var getDateString =  function(dateString){
    if(!dateString){
        return '';
    }
    var dateTemplate = '{dd}.{MM}.{YY} {HH}:{mm}';
    var dateParsed = new Date(dateString);
    var prefixZero = function(value){
        if(value < 10) {
            return '0' + value;
        }
        return value;
    };
    return applyTemplate(dateTemplate, {
        dd: prefixZero(dateParsed.getDay()),
        MM: prefixZero(dateParsed.getMonth() + 1),
        YY: dateParsed.getFullYear().toString().substr(-2),
        HH: prefixZero(dateParsed.getHours()),
        mm: prefixZero(dateParsed.getMinutes())
    })
};

self.addEventListener('push', function(event) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        return;
    }

    var pushData = {};
    if (event.data) {
        pushData = event.data.json();
    }
    if(!pushData.notification) {
        return;
    }

    self.registration.showNotification(
        pushData.notification.title,
        {
            body: getDateString(pushData.data.dateTime) + ' ' + pushData.notification.body,
            icon: pushData.notification.icon});

});
