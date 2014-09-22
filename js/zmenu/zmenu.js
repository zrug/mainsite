var Menu = function (opt) {
	this.cfg = {};
	this.init = function (opt) {
		this.cfg = $.extend(this.cfg, opt);

		if (typeof this.cfg.$wrapper === "undefined") {
			this.cfg.$wrapper = $("<div></div>").addClass("submenu");
		}
		this.el = this.cfg.$wrapper[0];
		this.count = this.cfg.items.length;

		var _this = this;
		$(this.cfg.items).each(function (i, o) {
			_this.cfg.$wrapper.append(o.el);
		});
	};
	this.appear = function (p) {
		var at = {top:p.posi.top, left:p.posi.left};
		switch (this.cfg.at) {
			case "bottom":
				at.top += p.height;
				break;
			case "left":
				at.left += p.width;
				break;
		}
		$(this.el).css(at).fadeIn(200);
		return $(this.el);
	};
	this.disappear = function (posi) {
		var _this = this;
		$(this.el).stop(true,true).fadeOut(200, function () {
			$(_this.el).css({top:'-999px', left:'-999px'});
		});
	};
	this.init(opt);
}

var Menuitem = function (opt) {
	this.cfg = {};
	this.init = function (opt) {
		opt.model.target = opt.model.target || "_self";
		this.cfg = $.extend(this.cfg, opt);

		this.cfg.templateID = this.cfg.templateID || "#menuitem";
		this.template = this.templateMaker();

		this.el = document.createElement("div");
		$(this.el).append(
			this.template( this.cfg.model )
		).addClass("menuitem");
	};
	this.templateMaker = function () {
		var html = '<a href="<%= href %>" target="<%= target%>"><span><%= text %></span></a>';
		return _.template(html);
	}
	this.alive = function () {
		var _this = this;
		$(this.el).on("mouseenter", function () {
			if (_this.cfg.sub && _this.cfg.sub.count > 0) {
				$(_this.el).append(_this.cfg.sub.appear({
					posi:$(_this.el).position(),
					height:$(_this.el).height(),
					width:$(_this.el).width()
				})).addClass('sub');
			}
		}).on("mouseleave", function () {
			if (_this.cfg.sub && _this.cfg.sub.count > 0) {
				_this.cfg.sub.disappear();
				$(_this.el).removeClass('sub');
			}
		});
	};
	this.init(opt);
	this.alive();
}
