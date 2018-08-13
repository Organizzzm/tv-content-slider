var Slider = (function (window, Animator) {
    function Slider(selector, options) {
        this.selector = selector;
        this.options = options;
        this.lazy = options.lazy;
        this.buffer = [];
        this.page = 0;
        this.rowsNumber = 2;
        this.rowsLength = 0;
        this.currentItem = 0;
        this.currentRow = 0;
        this.astScrollTop = 0;
        this.isFrameAnimationInProgress = false;
        this.isTop = true;
        this.isBottom = false;
        this.animator = new Animator();
        this.window = window;
        this.start();
    }

    Slider.prototype.start = function () {
        this.getData();
        this.initElements();
    };

    Slider.prototype.initRowAndItems = function () {
        this.append(this.scrollBlock, this.addMiddleEmptyRow());

        for (var i = 0; i < this.rowsNumber; i++) {
            var itemsTemplate = '',
                position = i * this.options.itemsCount,
                length = position + this.options.itemsCount;

            for (position; position < length; position++) {
                itemsTemplate += this.createItemTemplate(this.options.itemTemplate(this.buffer[position]));
            }

            var row = this.addCalculatedEmptyRow(100 * (i + 1));
            row.innerHTML = itemsTemplate;

            this.append(this.scrollBlock, row);
        }

        this.scrollBlock.style.opacity = 1;
    };

    Slider.prototype.getData = function () {
        this.buffer = this.lazy(this.page);
    };

    Slider.prototype.initElements = function () {
        this.initContainer();
        this.getElementsSize();
        this.initFrame();
        this.initScrollBlock();
        this.initRowAndItems();
        this.bindEvents();
    };

    Slider.prototype.bindEvents = function () {
        this.window.addEventListener('keydown', this.proxy(this.keydownController, this));
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
        var self = this;
        if (self.isFrameAnimationInProgress) return;

        if (this.currentRow - 1 > 0) {
            self.isFrameAnimationInProgress = true;
            self.addTopRow();

            this.animator.start(0, 100,
                function (progress) {
                    self.scrollTransformAnimation(progress, true);
                },
                function () {
                    self.isFrameAnimationInProgress = false;
                    self.currentRow--;
                    self.isBottom = false;
                    self.removeBottomRow();
                }
            );
        } else if (!this.isTop) {
            self.isTop = true;

            this.prepend(this.scrollBlock, this.addTopEmptyRow());
            self.isFrameAnimationInProgress = true;

            this.animator.start(0, 100,
                function (progress) {
                    self.scrollTransformAnimation(progress, true);
                },
                function () {
                    self.isFrameAnimationInProgress = false;
                    self.currentRow--;
                    self.removeBottomRow();
                }
            );
        }
    };

    Slider.prototype.scrollDown = function () {
        if (this.isFrameAnimationInProgress) return;

        if (this.currentRow + 2 < this.rowsLength) {
            var self = this;
            self.isFrameAnimationInProgress = true;
            self.addBottomRow();

            self.animator.start(0, 100,
                function (progress) {
                    self.scrollTransformAnimation(progress);
                },
                function () {
                    self.isFrameAnimationInProgress = false;
                    self.currentRow++;
                    self.isTop = false;
                    self.removeTopRow();
                }
            );
        } else if (!this.isBottom) {
            var newItems = this.options.lazy(++this.page);
            this.addItemsToBuffer(newItems, this.proxy(this.addItemsToBufferHandler, this));
        }
    };

    Slider.prototype.addItemsToBuffer = function (array, callback) {
        if (array.length) {
            this.buffer = this.buffer.concat(array);
            this.getRowLength();
            callback({error: false});
        }
        else callback({error: true});
    };

    Slider.prototype.addItemsToBufferHandler = function (res) {
        var self = this;

        if (res.error) {
            this.isBottom = true;
            self.append(self.scrollBlock, this.addBottomEmptyRow());
            self.isFrameAnimationInProgress = true;

            self.animator.start(0, 100,
                function (progress) {
                    self.scrollTransformAnimation(progress);
                },
                function () {
                    self.isFrameAnimationInProgress = false;
                    self.currentRow++;
                    self.removeTopRow();
                }
            );
        } else {
            self.addBottomRow();
            self.isFrameAnimationInProgress = true;

            self.animator.start(0, 100,
                function (progress) {
                    self.scrollTransformAnimation(progress);
                },
                function () {
                    self.isFrameAnimationInProgress = false;
                    self.currentRow++;
                    self.removeTopRow();
                }
            );
        }
    };

    Slider.prototype.scrollTransformAnimation = function (progress, isIncrement) {
        var length = this.scrollBlock.children.length;

        for (var i = 0; i < length; i++) {
            this.scrollBlock.children[i].style.transform = 'translateY(' + ( isIncrement ? (i * 100 - 100 + progress) : (i * 100 - progress) ) + '%)';
        }
    };

    Slider.prototype.removeTopRow = function () {
        this.scrollBlock.removeChild(this.scrollBlock.children[0]);
    };

    Slider.prototype.removeBottomRow = function () {
        this.scrollBlock.removeChild(this.scrollBlock.children[this.scrollBlock.children.length - 1]);
    };

    Slider.prototype.addBottomRow = function () {
        var startPosition = (this.currentRow + 2) * this.options.itemsCount,
            length = startPosition + this.options.itemsCount,
            row = this.addRowNode(),
            itemsTemplate = '';

        for (var i = startPosition; i < length; i++) {
            itemsTemplate += this.createItemTemplate(this.options.itemTemplate(this.buffer[i]));
        }

        row.innerHTML = itemsTemplate;
        row.style.transform = 'translateY(' + 100 * (this.currentRow + 2) + '%)';
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

    Slider.prototype.getElementsSize = function () {
        this.rowHeight = this.container.clientHeight / this.rowsNumber;
        this.itemWidth = this.container.clientWidth / this.options.itemsCount;
        this.itemHeight = this.rowHeight;
        this.scrollShift = this.rowHeight / 2;
        this.getRowLength();
    };

    Slider.prototype.getRowLength = function () {
        this.rowsLength = ~~(this.buffer.length / this.options.itemsCount);
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
        node.style.height = this.container.clientHeight + 'px';
        node.style.top = -this.scrollShift + 'px';
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

    Slider.prototype.addTopEmptyRow = function () {
        var row = this.addRowNode();
        row.style.transform = 'translateY(-100%)';

        return row;
    };

    Slider.prototype.addBottomEmptyRow = function () {
        var row = this.addRowNode();
        row.style.transform = 'translateY(200%)';

        return row;
    };

    Slider.prototype.addMiddleEmptyRow = function () {
        var row = this.addRowNode();
        row.style.transform = 'translateY(0%)';

        return row;
    };

    Slider.prototype.addCalculatedEmptyRow = function (expression) {
        var row = this.addRowNode();
        row.style.transform = 'translateY(' + expression + '%)';

        return row;
    };

    Slider.prototype.createItemTemplate = function (template) {
        return '<div class="item" style="width:' + this.itemWidth + 'px; height:' + this.itemHeight + 'px">' + template + '</div>';
    };

    return Slider;
})(window, Animator);