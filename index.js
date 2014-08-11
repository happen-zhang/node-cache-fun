
var debug = false;

var cache = {};
var hitCnt = 0;
var missCnt = 0;

function now() {
    return (new Date()).getTime();
}

exports.put = function(key, value, time, timeoutCb) {
    if (debug) {
        console.log('caching: '+key+' = '+value+' (@'+time+')');
    }

    var oldRecord = cache[key];
    // 如果旧键存在，则清除timeout
    if (oldRecord) {
        clearTimeout(oldRecord.timeout);
    }

    var expire = time + now();
    var record = {
        value: value,
        expire: expire
    };

    if (!isNaN(expire)) {
        var timeout = setTimeout(function() {
            exports.del(key);
            if (typeof timeoutCb === 'function') {
                timeoutCb(key);
            }
        }, time);

        record.timeout = timeout;
    }

    cache[key] = record;
};

exports.del = function(key) {
    delete cache[key];
};

exports.clear = function() {
    cache = {};
};

exports.get = function(key) {
    var data = cache[key];
    if (typeof data !== 'undefined') {
        if (!isNaN(data.expire) && data.expire > now()) {
            if (debug) {
                hitCnt++;
            }

            return data;
        }

        if (debug) {
            missCnt++;
        }

        exports.del(key);
    } else {
        missCnt++;
        return null;
    }
};

exports.size = function() {
    var size = 0, key;
    for (key in cache) {
        if (cache.hasOwnProperty(key)) {
            if (exports.get(key) !== null) {
                size++;
            }
        }
    }
    return size;
}

exports.memsize = function() {
    var size = 0, key;
    for (key in cache) {
        if (cache.hasOwnProperty(key)) {
            size++;
        }

    }

    return size;
}

exports.debug = function(bool) {
    debug = bool;
}

exports.hits = function() {
    return hitCnt;
}

exports.misses = function() {
    return missCnt;
}

exports.keys = function() {
    return Object.keys(cache);
};
