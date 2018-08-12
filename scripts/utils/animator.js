function Animator() {}

Animator.prototype.start = function (start, end, callback, lastCallback) {
    var start = start,
        change = end - start,
        currentTime = 0,
        increment = 20,
        duration = 300,
        self = this;

    var animateScroll = function () {
        currentTime += increment;
        var val = self.easeInOutQuad(currentTime, start, change, duration);
        callback(val);
        if (currentTime < duration) {
            setTimeout(animateScroll, increment);
        } else {
            lastCallback();
        }
    };
    animateScroll();
};

Animator.prototype.easeInOutQuad = function (t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
};


