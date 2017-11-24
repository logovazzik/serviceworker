function SubscribersService(){
    const subscriber = {
        token: 'test' + Math.random(),
        ua: navigator.userAgent,
        subscriptions: [
            {
                type: 'BCH',
                value: 1000 + Math.random()
            }
        ]
    };
    this.refresh = function(token, oldToken){
        return $.ajax({
            url: "http://127.0.0.1:3000/api/subscriptions/refresh",
            type: "PUT",
            crossDomain: true,
            data: {
                token: token,
                oldToken: oldToken
            }
        }).then(function (data) {
            debugger;
        })
    }
    this.subscribe = function(subscriber){
        return $.ajax({
            url: (window.debug ? 'http://127.0.0.1:3000': 'https://logovazzik-push.herokuapp.com') + '/api/subscriptions/subscribe',
            type: "POST",
            crossDomain: true,
            data: {subscriber: subscriber }
        }).then(function (data) {
           debugger;
        })
    }
    this.unsubscribe =  function () {
        return $.ajax({
            url: "http://127.0.0.1:3000/api/subscriptions/unsubscribe",
            type: "POST",
            crossDomain: true,
            data: {
                token: token
            }
        }).then(function (data) {
            debugger;
        })
    }
}

var subscribersService = new SubscribersService();

function View() {
    var self = this;
    this.tokenService = new TokenService();
    this.subscribersService = new SubscribersService();
    this.initialize = function() {
        this.tokenService
            .on('onRefreshToken', function(refreshToken, previousToken){
                self.subscribersService.refresh(refreshToken, previousToken);
            })
           .initialize();
    }

    this.subscribe = function(){
        this.tokenService.getToken().then(function(token){
            self.subscribersService.subscribe({
                token: token,
                ua: navigator.userAgent,
                subscriptions: [
                    {
                        type: "BCH",
                        value: 0,
						deviation: 20
                    }
                ]
            })
        })

    }

}

function TokenService(){
    var messaging = null;
    var TOKEN_KEY = '__token__';
    var listeners = {};
    this.initialize = function(){
        var self = this;
        if (window.location.protocol === 'https:' &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            'localStorage' in window &&
            'fetch' in window &&
            'postMessage' in window
        ) {
            messaging = window.firebase.messaging();
            // already granted
            if (Notification.permission === 'granted') {
                this.getToken();
            }
			
			 messaging.onMessage(function(payload) {
                console.log('Message received. ', payload);
            })
            // Callback fired if Instance ID token is updated.
            messaging.onTokenRefresh(function() {
                messaging.getToken()
                    .then(function(refreshedToken) {
                        console.log('Token refreshed.');
                        // Send Instance ID token to app server.
                        // sendTokenToServer(refreshedToken);
                        _fireListeners('onRefreshToken', refreshedToken, self.getFromStoreToken());
                        self.storeToken(refreshedToken);
                    })
                    .catch(function(error) {
                        console.log('Unable to retrieve refreshed token.', error);
                    });
            });

        } else {
            console.warn('This browser does not support desktop notification.');
            console.log('Is HTTPS', window.location.protocol === 'https:');
            console.log('Support Notification', 'Notification' in window);
            console.log('Support ServiceWorker', 'serviceWorker' in navigator);
            console.log('Support LocalStorage', 'localStorage' in window);
            console.log('Support fetch', 'fetch' in window);
            console.log('Support postMessage', 'postMessage' in window);
        }
        return this;
    };
    this.storeToken =  function(token) {
        window.localStorage.setItem(TOKEN_KEY, token);
    };

    this.getFromStoreToken = function() {
        window.localStorage.getItem(TOKEN_KEY);
    };

    this.unstoreToken =  function() {
        window.localStorage.removeItem(TOKEN_KEY);
    };
    this.getToken = function(){
        var self = this;
        return messaging.requestPermission()
            .then(function() {
                // Get Instance ID token. Initially this makes a network call, once retrieved
                // subsequent calls to getToken will return from cache.
                return messaging.getToken()
                    .then(function(currentToken) {
                        if (currentToken) {
                            self.storeToken(currentToken);
                            _fireListeners('onObtainToken', currentToken);
                            return currentToken;
                        } else {
                            console.log('No Instance ID token available. Request permission to generate one.');
                            return null;
                        }
                    })
                    .catch(function(error) {
                        console.log('An error occurred while retrieving token.', error);
                        //  setTokenSentToServer(false);
                    });
            })
            .catch(function(error) {
                console.log('Unable to get permission to notify.', error);
            });
    };
    this.deleteToken =  function(){
        var self = this;
        return this.messaging.getToken()
            .then(function(currentToken) {
                return messaging.deleteToken(currentToken)
                    .then(function() {
                        console.log('Token deleted.');
                        _fireListeners('onDeleteToken', currentToken);
                        self.unstoreToken();
                        //setTokenSentToServer(false);
                    })
                    .catch(function(error) {
                        console.log('Unable to delete token.', error);
                    });
            })
            .catch(function(error) {
                console.log('Error retrieving Instance ID token.', error);
            });

    };
    function _fireListeners(name){
        if(listeners[name]) {
            listeners[name].forEach(function(listener){
                listener.apply(self, [].slice.call(arguments).splice(1, arguments.length));
            })
        }
    }
    this.on = function(name, listener){
        listeners[name] = listeners[name] || [];
        listeners[name].push(listener);
        return this;
    }
}


        // register fake ServiceWorker for show notification on mobile devices
        // navigator.serviceWorker.register('/serviceworker/messaging-sw.js');
        // Notification.requestPermission(function(permission) {
        //     if (permission === 'granted') {
        //         navigator.serviceWorker.ready.then(function(registration) {
        //             payload.notification.data = payload.notification;
        //             registration.showNotification(payload.notification.title, payload.notification);
        //         }).catch(function(error) {
        //             // registration failed :(
        //             showError('ServiceWorker registration failed.', error);
        //         });
        //     }
        // });
