importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');
importScripts('./messaging-helper.js');

let config = {
    apiKey: "AIzaSyBXH1N-C-3Gi80tglAOQccdurbjukhu2Io",
    authDomain: "logovazzik-otn.firebaseapp.com",
    databaseURL: "https://logovazzik-otn.firebaseio.com",
    projectId: "logovazzik-otn",
    storageBucket: "logovazzik-otn.appspot.com",
    messagingSenderId: "314128418145"
};
firebase.initializeApp(config);
let messaging = firebase.messaging();

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
});


messaging.setBackgroundMessageHandler(function(payload) {
      if (!(self.Notification && self.Notification.permission === 'granted')) {
         return;
      }
    return showNotification(registration, payload);
});
