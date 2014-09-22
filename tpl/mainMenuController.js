$('.main-menu').html(' \
<div class="avatar"> \
    <img src="" class="avatar-image"> \
    <button class="login modal-login-show md-trigger" data-modal="modal-login">登录</button> \
    <button class="logout">登出</button> \
</div> \
<ul class="main-menu-buttons"> \
    <li><a href="#" class="main-menu-button">通知中心</a></li> \
    <li><a href="#" class="main-menu-button">通知中心</a></li> \
    <li><a href="#" class="main-menu-button">通知中心</a></li> \
    <li class="separate"></li> \
    <li><a href="#" class="main-menu-button">通知中心</a></li> \
    <li><a href="#" class="main-menu-button">通知中心</a></li> \
    <li><a href="#" class="main-menu-button trigger-of-main-menu">关闭</a></li> \
</ul> \
');

(function MainMenuController () {
    this.$self = $('.main-menu');
    this.width = this.$self.width();
    this.$trigger = $('.trigger-of-main-menu');
    this.menu_x = $('.navicon-button.x');
    this.isOpen = false;
    this.speed = 400;
    this.limit = 105;
    var _this = this;

    this.toggle = function () {
        var _self = _this.$self;
        if (_this.isOpen) {

           _self.animate({ textIndent: _this.limit }, {
                step: function(now, fx) {
                    _self.css('transform', "translate3d(" + now + "%, 0, 0)");
                },
                duration: _this.speed
            }, 'easeOutExpo');

        } else {

            this.$self.css({
                'height': $('body').height() - $('.site-nav').height() - $('.header').height() - $('.footer').height(),
            });
           _self.animate({ textIndent: 0 }, {
                step: function(now, fx) {
                    _self.css('transform', "translate3d(" + now + "%, 0, 0)");
                },
                duration: _this.speed
            }, 'easeOutExpo');

        }
        _this.menu_x.toggleClass('open');
        _this.isOpen = !_this.isOpen;
        return false;
    };

    this.init = function () {
        this.$self.css({
            'transform': "translate3d(" + this.limit + "%, 0, 0)",
            'textIndent': this.limit
        });
        this.$trigger.on('click', function () { _this.toggle() });

        var _self = this.$self;

    };
    this.init();
})();