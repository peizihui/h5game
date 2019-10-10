window.hpbweb3 = {
    _getAccountCallbackArray: [],
    setDeviceRotate: function (params) {
        var userAgent = this.checkUserAgent();
        if (userAgent && userAgent === 'ios') {
            window.webkit.messageHandlers.setDeviceRotate.postMessage(params)
        } else if (userAgent && userAgent === 'android') {
            android.setDeviceRotate(params);
        }
    },
    getAccount: function (callback) {
        var userAgent = this.checkUserAgent();
        if (userAgent && userAgent === 'ios') {
            // ios
            window.webkit.messageHandlers.getAccount.postMessage(null)
        } else if (userAgent && userAgent === 'android') {
            //android
            android.getAccount();
        }
        this._getAccountCallbackArray.push(callback);
    },
    login: function (params, callback) {
        var userAgent = this.checkUserAgent();
        if (userAgent && userAgent === 'ios') {
            window.webkit.messageHandlers.signToLogin.postMessage(params)
        } else if (userAgent && userAgent === 'android') {
            android.signToLogin(JSON.stringify(params));
        }
        this._getAccountCallbackArray.push(callback);
    },
    pay: function (params, callback) {
        var userAgent = this.checkUserAgent();
        if (userAgent && userAgent === 'ios') {
            window.webkit.messageHandlers.startToPay.postMessage(params)
        } else if (userAgent && userAgent === 'android') {
            android.startToPay(JSON.stringify(params));
        }
        this._getAccountCallbackArray.push(callback);
    },
    sendTransaction: function (params, callback) {
        var userAgent = this.checkUserAgent();
        if (userAgent && userAgent === 'ios') {
            window.webkit.messageHandlers.sendTransaction.postMessage(params)
        } else if (userAgent && userAgent === 'android') {
            android.sendTransaction(JSON.stringify(params));
        }
        this._getAccountCallbackArray.push(callback);
    },
    checkUserAgent: function () {
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
        var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        if (isAndroid) {
            return 'android'
        }
        if (isIOS) {
            return 'ios'
        }
    },
    getCallback: function (params) {
        if (params) {
            if (typeof (params) === 'string') {
                params = JSON.parse(params)
            }
            this._getAccountCallbackArray.map(function (callback) {
                callback(params)
            });
            this._getAccountCallbackArray = [];
        }
    }


}