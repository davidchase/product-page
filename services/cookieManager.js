'use strict';
// From here:
// https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
var CookieManager = function() {};
var CMProto = CookieManager.prototype;

var internals = {};
internals.isJSON = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};

CMProto.getItem = function(cookieName) {
    var str;
    if (!cookieName || !this.hasItem(cookieName)) {
        return false;
    }
    str = decodeURIComponent(document.cookie.match(new RegExp(cookieName + '=([^;]+)'))[1]);

    return internals.isJSON(str) ? JSON.parse(str) : str;
};

CMProto.setItem = function(cookieName, cookieValue, staleIn, path, domain) {
    var expires = "";
    var staleTypes;

    if (!cookieName) {
        return false;
    }

    staleTypes = {
        'number': function() {
            expires = staleIn === Infinity ?
                "; expires=Fri, 31 Dec 9999 23:59:59 GMT" :
                "; max-age=" + staleIn;
        },
        'string': function() {
            expires = "; expires=" + staleIn;
        },
        'date': function() {
            expires = "; expires=" + staleIn.toUTCString();
        }
    };

    if (staleIn) {
        staleTypes[{}.toString.call(staleIn).slice(8, -1).toLowerCase()].call(staleTypes);
    }

    if ({}.toString.call(cookieValue).slice(8, -1).toLowerCase() === 'object') {
        cookieValue = JSON.stringify(cookieValue);
    }

    document.cookie = cookieName + "=" + encodeURIComponent(cookieValue) + expires +
        (domain ? "; domain=" + domain : "") +
        (path ? "; path=" + path : "");
};

CMProto.removeItem = function(cookieName, path, domain) {
    if (!this.hasItem(cookieName)) {
        return false;
    }
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" +
        (domain ? "; domain=" + domain : "") +
        (path ? "; path=" + path : "");
    return true;
};
CMProto.hasItem = function(cookieName) {
    if (!cookieName) {
        return false;
    }
    return (new RegExp("(?:^|;\\s*)" + cookieName.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
};
CMProto.keys = function() {
    var allKeys = document.cookie
        .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
        .split(/\s*(?:\=[^;]*)?;\s*/);

    return allKeys;
};

module.exports = new CookieManager();