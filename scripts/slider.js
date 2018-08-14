var Slider = (function (window, Animator) {
    function Slider(selector, options) {
        this.selector = selector;
        this.options = options;
        this.lazy = options.lazy;
        this.buffer = [];
        this.page = 1;
        this.rowsNumber = 3;
        this.rowsOffset = 2;
        this.rowsLength = 0;
        this.currentItem = 0;
        this.currentRow = 1;
        this.isFrameAnimationInProgress = false;
        this.endPage = false;
        this.startPage = true;
        this.animator = new Animator();
        this.window = window;

        this.start();
    }

    Slider.prototype.start = function () {
        this.getData();
        this.initElements();
    };

    Slider.prototype.initRowAndItems = function () {
        for (var i = 0; i < this.rowsNumber; i++) {
            if (i === 0) {
                this.append(this.scrollBlock, this.addEmptyRowWithPosition(100 * i));
                continue;
            }

            var itemsList = '',
                firstItemNumber = i * this.options.itemsCount,
                lastItemNumber = firstItemNumber + this.options.itemsCount,
                row;

            for (var j = firstItemNumber; j < lastItemNumber; j++) {
                itemsList += this.createItemTemplate(this.options.itemTemplate(this.buffer[j]));
            }

            row = this.addEmptyRowWithPosition(100 * i);
            row.innerHTML = itemsList;
            this.append(this.scrollBlock, row);
        }
    };

    Slider.prototype.getData = function () {
        this.buffer = this.lazy(this.pageNumber());
    };

    Slider.prototype.initElements = function () {
        this.initContainer();
        this.initScrollBlock();
        this.initElementsSize();
        this.initFrame();
        this.initRowAndItems();
        this.bindEvents();
    };

    Slider.prototype.bindEvents = function () {
        this.window.addEventListener('keydown', this.proxy(this.keydownController, this));
        this.window.addEventListener('scroll', this.proxy(this.scrollController, this));
    };

    Slider.prototype.keydownController = function (event) {
        switch (event.keyCode) {
            case 37 :
                this.moveFrameToLeft();
                break;
            case 39 :
                this.moveFrameToRight();
                break;
            case 38 :
                this.scrollUp();
                break;
            case 40 :
                this.scrollDown();
                break;
        }
    };

    Slider.prototype.scrollController = function (event) {

    };

    Slider.prototype.scrollUp = function () {
        if (this.isAnimating()) return;

        if (this.isTop()) {
            this.prependItemsToBuffer()? this.scrollUp() : this.topOffsetAnimation();
            return;
        }

        if (this.endPage) {
            this.decrementPage();
        }

        this.addTopRow();
        this.startAnimation();

        this.animator.start(0, 100,
            this.proxy(this.scrollUpAnimator, this),
            this.proxy(this.afterScrollUpHandler, this)
        );
    };

    Slider.prototype.scrollDown = function () {
        if (this.isAnimating()) return;

        if (this.isBottom()) {
            this.appendItemsToBuffer()? this.scrollDown() : this.bottomOffsetAnimation();
            return;
        }

        this.addBottomRow();
        this.startAnimation();

        this.animator.start(0, 100,
            this.proxy(this.scrollDownAnimator, this),
            this.proxy(this.afterScrollDownHandler, this)
        );

    };

    Slider.prototype.appendItemsToBuffer = function () {
        this.incrementPage();
        var data = this.options.lazy(this.pageNumber());

        if (data.length === 0) {
            this.endPage = true;
            return false
        }

        this.appendBuffer(data);

        return true;
    };

    Slider.prototype.prependItemsToBuffer = function () {
        if (this.isStartPage()) {
            return false;
        }

        this.decrementPage();
        this.prependBuffer(this.options.lazy(this.pageNumber()));
        return true;
    };

    Slider.prototype.scrollUpAnimator = function (progress) {
        var length = this.scrollBlock.children.length;

        for (var i = 0; i < length; i++) {
            this.scrollBlock.children[i].style.transform = 'translateY(' + (i * 100 - 100 + progress) + '%)';
        }
    };

    Slider.prototype.topOffsetAnimation = function () {
        if (this.scrollBlock.children[0].children.length) {
            var row = this.addEmptyRowWithPosition(0);
            this.prepend(this.scrollBlock, row);
            this.startAnimation();

            this.animator.start(0, 100,
                this.proxy(this.scrollUpAnimator, this),
                this.proxy(this.afterTopOffsetAnimation, this)
            );
        }
    };

    Slider.prototype.afterTopOffsetAnimation = function () {
        this.currentRow = 1;
        this.removeBottomRow();
        this.stopAnimation();
    };

    Slider.prototype.bottomOffsetAnimation = function () {
        if (this.scrollBlock.children[this.rowsOffset].children.length) {
            var row = this.addEmptyRowWithPosition(0);
            this.append(this.scrollBlock, row);
            this.startAnimation();

            this.animator.start(0, 100,
                this.proxy(this.scrollDownAnimator, this),
                this.proxy(this.afterBottomOffsetAnimation, this)
            );
        }
    };

    Slider.prototype.afterBottomOffsetAnimation = function () {
        this.currentRow = this.rowsLength - 1;
        this.removeTopRow();
        this.stopAnimation();
    };

    Slider.prototype.scrollDownAnimator = function (progress) {
        var length = this.scrollBlock.children.length;

        for (var i = 0; i < length; i++) {
            this.scrollBlock.children[i].style.transform = 'translateY(' + (i * 100 - progress) + '%)';
        }
    };

    Slider.prototype.removeTopRow = function () {
        this.scrollBlock.removeChild(this.scrollBlock.children[0]);
    };

    Slider.prototype.removeBottomRow = function () {
        this.scrollBlock.removeChild(this.scrollBlock.children[this.scrollBlock.children.length - 1]);
    };

    Slider.prototype.addBottomRow = function () {
        var startPosition = (this.currentRow + this.rowsOffset) * this.options.itemsCount,
            length = startPosition + this.options.itemsCount,
            row = this.addRowNode(),
            itemsTemplate = '';

        for (var i = startPosition; i < length; i++) {
            itemsTemplate += this.buffer[i] ? this.createItemTemplate(this.options.itemTemplate(this.buffer[i])) : '';
        }

        row.innerHTML = itemsTemplate;
        row.style.transform = 'translateY(' + 100 * (this.currentRow + this.rowsOffset) + '%)';
        this.append(this.scrollBlock, row);
    };

    Slider.prototype.addTopRow = function () {
        var startPosition = (this.currentRow - 2) * this.options.itemsCount,
            length = startPosition + this.options.itemsCount,
            row = this.addRowNode(),
            itemsTemplate = '';

        for (var i = startPosition; i < length; i++) {
            if (!this.buffer[i]) {
                itemsTemplate = '';
                return;
            }

            itemsTemplate += this.createItemTemplate(this.options.itemTemplate(this.buffer[i]));
        }

        row.innerHTML = itemsTemplate;
        row.style.transform = 'translateY(-100%)';
        this.prepend(this.scrollBlock, row);
    };

    Slider.prototype.afterScrollDownHandler = function () {
        this.stopAnimation();
        this.currentRow++;
        this.removeTopRow();
    };

    Slider.prototype.afterScrollUpHandler = function () {
        this.stopAnimation();
        this.currentRow--;
        this.removeBottomRow();
    };

    Slider.prototype.moveFrameToLeft = function () {
        var self = this;
        if (this.currentItem <= 0 || this.isFrameAnimationInProgress) return;

        this.isFrameAnimationInProgress = true;
        self.currentItem--;

        this.animator.start(100, 0,
            function (progress) {
                self.frameTransformAnimation(progress);
            },
            function () {
                self.isFrameAnimationInProgress = false;
            }
        );
    };

    Slider.prototype.moveFrameToRight = function () {
        var self = this;
        if (this.currentItem >= this.options.itemsCount - 1 || this.isFrameAnimationInProgress) return;

        this.isFrameAnimationInProgress = true;

        this.animator.start(0, 100,
            function (progress) {
                self.frameTransformAnimation(progress);
            },
            function () {
                self.currentItem++;
                self.isFrameAnimationInProgress = false;
            }
        );
    };

    Slider.prototype.frameTransformAnimation = function (progress) {
        var startPosition = this.currentItem * 100;
        this.frame.style.transform = 'translateX(' + (startPosition + progress) + '%)';
    };

    Slider.prototype.initContainer = function () {
        this.container = document.querySelector(this.selector);
    };

    Slider.prototype.initElementsSize = function () {
        this.rowHeight = this.scrollBlock.clientHeight / this.rowsNumber;
        this.itemWidth = this.scrollBlock.clientWidth / this.options.itemsCount;
        this.itemHeight = this.rowHeight;
        this.scrollShift = this.rowHeight / 2;
        this.getRowLength();
    };

    Slider.prototype.getRowLength = function () {
        this.rowsLength = this.buffer.length / this.options.itemsCount;
    };

    Slider.prototype.initScrollBlock = function () {
        this.scrollBlock = this.addScrollBlock();
        this.append(this.container, this.scrollBlock);
    };

    Slider.prototype.initFrame = function () {
        this.frame = this.addDiv();
        this.frame.className = 'frame';
        this.frame.style.top = this.scrollShift + 'px';
        this.frame.style.width = this.itemWidth + 'px';
        this.frame.style.height = this.itemHeight + 'px';
        this.append(this.container, this.frame);
    };

    Slider.prototype.append = function (container, element) {
        container.appendChild(element);
    };

    Slider.prototype.prepend = function (container, element) {
        container.insertBefore(element, container.firstChild);
    };

    Slider.prototype.proxy = function (fn, context) {
        return function (arguments) {
            return fn.call(context, arguments);
        }
    };

    Slider.prototype.addScrollBlock = function () {
        var node = this.addDiv();
        node.className = 'scroll';
        return node;
    };

    Slider.prototype.addDiv = function () {
        return document.createElement('div');
    };

    Slider.prototype.addRowNode = function () {
        var row = document.createElement('div');
        row.className = 'row';
        row.style.height = this.rowHeight + 'px';

        return row;
    };

    Slider.prototype.addEmptyRowWithPosition = function (value) {
        var row = this.addRowNode();
        row.style.transform = 'translateY(' + value + '%)';

        return row;
    };

    Slider.prototype.createItemTemplate = function (template) {
        return '<div class="item" style="width:' + this.itemWidth + 'px; height:' + this.itemHeight + 'px">' + template + '</div>';
    };

    Slider.prototype.appendBuffer = function (data) {
        var newBuffer = this.buffer.splice(-this.rowsOffset * this.options.itemsCount);
        this.buffer = newBuffer.concat(data);
        this.currentRow = 1;
        this.getRowLength();
    };

    Slider.prototype.prependBuffer = function (data) {
        var newBuffer = this.buffer.splice(0, this.rowsOffset * this.options.itemsCount);
        this.buffer = data.concat(newBuffer);
        this.currentRow = this.buffer.length / this.options.itemsCount - 1;
        newBuffer = null;
    };

    Slider.prototype.isBottom = function () {
        return (this.currentRow + this.rowsOffset) >= this.rowsLength;
    };

    Slider.prototype.isTop = function () {
        return (this.currentRow - this.rowsOffset) <= 0;
    };

    Slider.prototype.startAnimation = function () {
        this.isFrameAnimationInProgress = true;
    };

    Slider.prototype.stopAnimation = function () {
        this.isFrameAnimationInProgress = false;
    };

    Slider.prototype.isAnimating = function () {
        return this.isFrameAnimationInProgress;
    };

    Slider.prototype.isStartPage = function () {
        return this.page === 1;
    };

    Slider.prototype.incrementPage = function () {
        if (this.endPage) return;
        this.page += 1;
        this.startPage = false;
    };

    Slider.prototype.decrementPage = function () {
        if (this.startPage) return;
        this.page -= 1;
        this.endPage = false;
    };

    Slider.prototype.pageNumber = function () {
        return this.page;
    };

    return Slider;
})(window, Animator);