var Project = function (options) {
    this.opt = $.extend({}, options);
    this.content = $('.content');
    this.inModify = false;

    this.init = function (options) {

        if (options && options.projectId) {
            console.log('init project data with id: ' + options.projectId);

            this.initSectionNav(options.projectId);

            var url = "/Projects/projects?projectId=" + options.projectId;
            var _this = this;

/////////// get project from server by projectId
            $.get(global.serviceUrl + url, function (msg) {

                if (msg && msg.d && msg.d.status && msg.d.status.statusCode == global.status.success) {
                    var data = msg.d.data;
                    console.log(data);
                    _this.fillContentFromJsonData(data);
                    _this.whichStage(data);
                }

            }).done(function (msg) {

                if (typeof ContactsRows === "function") {
                    _this.contacts = new ContactsRows({
                        view: $('.contact-section'),
                        projectId: global.QueryString.projectId,
                        contacts: msg.d.data.projectBaseContacts
                    });
                }
                if (typeof PhotosRows === "function") {
                    _this.photos = new PhotosRows({
                        view: $('.photo-section'),
                        projectId: global.QueryString.projectId,
                        photos: msg.d.data.projectImages
                    });
                }
            });

        } else {
            console.log('new project');
            this.whichStage();

            if (typeof ContactsRows === "function") {
                this.contacts = new ContactsRows({
                    view: $('.contact-section')
                });
            }
            if (typeof PhotosRows === "function") {
                this.photos = new PhotosRows({
                    view: $('.photo-section')
                });
            }
        }
    }
    this.init(options);
};

Project.prototype.modify = function () {
    this.inModify = true;
}
Project.prototype.dateToString = function (date, time) {
    if (!date) return null;
    var v = new Date(date).Format('yyyy-MM-dd');
    return v + 'T' + (time || '00:00:00.00');
}
Project.prototype.stringToDate = function (string) {
    var v = string.split('T');
    return {
        'date': new Date(v[0]).Format('yyyy/MM/dd'),
        'time': v[1]
    };
}

Project.prototype.addProjectToServer = function (data, successfunc, errorfunc) {
    var _this = this, url, action;

    var uploadEnd = function () {
        alert('项目信息保存成功');
        global.uploadEnd();
        console.log('redirection: ' + (global.inTests ? '#':'project.html?projectId='+_this.opt.projectId));
        // location.href = global.inTests ? '#':'project.html?projectId='+_this.opt.projectId;
    }
    var afterUpload = function () {
        console.log('afterUpload uploadCount: ' + global.uploadCount);
        if (global.uploadCount == 0) {
            uploadEnd();
        }
    };

    if (!data.projectBaseInfomation) data.projectBaseInfomation = {};
    data.projectBaseInfomation.id = this.opt.projectId;

    if (this.inModify) {
        url = '/Projects/UpdateProject';
        action = 'MODIFY';
        data.projectBaseInfomation.updateBy = global.getUserId();
    } else {
        url = '/Projects/AddProject';
        action = 'ADD';
        data.projectBaseInfomation.createdBy = global.getUserId();
    }

    console.log(action + ' projectToServer url:' + url);


    data.projectBaseContacts = _this.contacts.postToServer({
        projectId: '',
        projectName: data.projectName
    });
    console.log(JSON.stringify(data));

    global.uploadStart();

/////////// post project to server
    $.post(global.serviceUrl + url, data, function (msg) {
        console.log(msg);
    }).done(function (msg) {
        console.log('making photos ... ');
        if (_this.photos && _this.photos.uploadCount() > 0) {
            // count how many photos and contacts will be upload
            global.uploadCount = _this.photos.uploadCount();
            console.log("total: ["+global.uploadCount+"] photos: ["+_this.photos.uploadCount()+"]");

            _this.photos.postToServer({
                projectId: (_this.opt.projectId),
                afterUpload: afterUpload
            });
        } else {
            uploadEnd();
        }
    });

};

Project.prototype.fillContentFromJsonData = function (data) {
    if (!data) return;

    this.data = data;
    var _this = this;
    this.content.find(".field").each(function () {

        // fill value to field one by one
        var valuetype = $(this).attr('valuetype');
        var fieldid = $(this).attr('fieldId');
        var fieldstage = $(this).attr('stage');
        var $els = $('.field-' + fieldid);
        var value = data[fieldstage][fieldid];

        if (value != undefined) {
            $els.each(function () {
                $el = $(this);

                switch (valuetype) {
                    case 'string':
                        if ($el.hasClass('tagSele')) {
                            $el.tagSeleVal(value);
                        } else {
                            $el.val(value);
                            if ($el.find('option').length > 0) {
                                $el.removeClass('gray').change();
                            }
                        }
                        break;
                    case 'number':
                        $el.val(value);
                        break;
                    case 'bool':
                        // TODO: bool T or F -> string 0 or 1
                        value = (value) ? "1" : "0";
                        if ($el.hasClass('tagSele')) {
                            $el.tagSeleVal(value);
                        } else {
                            $el.val(value);
                        }
                        break;
                    case 'date':
                        var conv = _this.stringToDate(value);
                        if ($el[0].tagName == 'DIV') {
                            $el.text(conv.date).data('time', conv.time);
                        } else {
                            $el.val(conv.date).data('time', conv.time);
                        }
                        break;
                }
            });
        }
    });

    if (data.projectLandStage.longitude && data.projectLandStage.latitude) {
        var point = {
            longitude: data.projectLandStage.longitude || '121.47948',
            latitude: data.projectLandStage.latitude || '31.237304'
        };
        $('.btn-openmap').data('geo', point);
    }

}

Project.prototype.getJsonDataFromContent = function (pageContent) {
    var _this = this, data = {
        "projectLandStage": {},
        "projectMainDesignStage": {},
        "projectMainConstructStage": {},
        "projectDecorateStage": {},
        "projectBaseInfomation": {}
    };
    var validate = true;

    pageContent.find(".field").each(function () {

        // checking field values one by one
        var $el = $(this), value;
        var valuetype = $el.attr('valuetype');
        var fieldid = $el.attr('fieldId');
        var fieldstage = $el.attr('stage');
        _this.canPass($el);

        switch (valuetype) {
            case 'string':
                if ($el.hasClass('tagSele')) {
                    value = $el.tagSeleVal();
                } else {
                    value = $el.val();
                }
                if (value && value.length > 0) {
                    data[fieldstage][fieldid] = value;
                }
                break;
            case 'number':
                value = $el.val();
                if (value && value.length > 0) {
                    if (isNaN(value)) {
                        validate = false;
                        _this.canNotPass($el);
                    } else {
                        data[fieldstage][fieldid] = value;
                    }
                }
                break;
            case 'bool':
                if ($el.hasClass('tagSele')) {
                    value = $el.tagSeleVal();
                } else {
                    value = $el.val();
                }
                if (value && value.length > 0) {
                    value = (value == "1");
                    data[fieldstage][fieldid] = value;
                }
                break;
            case 'date':
                value = _this.dateToString($el.val(), $el.data('time'));
                if (value === '-1') {
                    validate = false;
                    _this.canNotPass($el);
                } else {
                    if (value) {
                        data[fieldstage][fieldid] = value;
                    }
                }
                break;
        }
    });

    if ($('.btn-openmap').data('geo')) {
        var point = $('.btn-openmap').data('geo');
        if (!data.projectLandStage) {
            data.projectLandStage = {};
        }
        data.projectLandStage.longitude = point.longitude;
        data.projectLandStage.latitude = point.latitude;
    }

    return {
        data: data,
        validate: validate
    };
}
Project.prototype.boolValidate = function (value1, value2) {
    var parse = function (v) {
        return ( v==1 || v=='1' || v==true || v=='true');
    }
    return (parse(value1) == parse(value2));
}

Project.prototype.canNotPass = function ($el) {
    $el.addClass('red-border');
}
Project.prototype.canPass = function ($el) {
    $el.removeClass('red-border');
}

Project.prototype.initSectionNav = function (projectId) {
}

Project.prototype.whichStage = function (data) {
    var stages = ["LandStage","MainDesignStage","MainConstructStage","DecorateStage"], stage = "LandStage";
    if (data && data.projectBaseInfomation && data.projectBaseInfomation.projectStage)
        stage = data.projectBaseInfomation.projectStage;
    var progress = _.indexOf(stages, stage) + 1;

    $('.progress-bar-body').addClass('percent' + ((progress-1)*20));
    for (var i = 1; i <= progress; i++) {
        $('.stages-code.stage' + i).addClass('active');
    }
}

Project.prototype.doSave = function () {
    var self = $('.btn-save');
    self.off('click').removeClass('active');
    var result = project.getJsonDataFromContent( project.content );
    // console.log(result.data);

    result.projectBaseContacts = project.contacts.postToServer({
        projectId: '',
        projectName: ''
    });
    console.log(result.projectBaseContacts);
    if (result.validate) {
        var _this = this;
        // save project
        project.addProjectToServer( result.data );
    } else {
        console.log('validate is false');
        var pop = new PopingView();
        pop.show({
            view: "errorView",
            parent: '.wrapper',
            text: "数据格式填写错误，已用红色标出，请修改！",
            timeout: 4000,
            css: {
                top: '760px',
                left: '106px'
            }
        }, function () {
            self.addClass('active').on('click', project.doSave);
        });
    }
            self.addClass('active').on('click', project.doSave);
}
Project.prototype.doPublish = function () {
    var self = $('.btn-publish');
    self.off('click').removeClass('active');
}

Project.prototype.install = function (key, obj) {
    this[key] = obj;
}


$(function () {

    // 转select为多选
    $('.tagSele').tagSele();

    // 初始化项目信息
    project = new Project({
        projectId: global.QueryString.projectId
    });

    // 初始化控件
    project.pcd = new PCDselector({
        province: $('#landProvince'),
        city: $('#landCity'),
        district: $('#landDistrict')
    })

    // 初始化selectmenu样式
    // $('.selectmenu').selectmenu();

    // 启动百度地图
    $('.btn-openmap').mapapi();

    // select 未选择时为灰色
    // $('select').on('change', function () {
    //     $(this).removeClass('gray').addClass('black');
    // });
    // select 不为灰色
    $('select').removeClass('gray');

    // 绑定Sheets
    $('.content-trigger').on('click', function () {
        var $this = $(this);
        $this.addClass('active').siblings().removeClass('active');
        $( $this.attr('ref') + '.' + $this.attr('page') ).show().siblings().hide();
    });

    // 绑定Pages
    $('.page-trigger').on('click', function () {
        var progress = $(this).attr('index')*1;
        $(this).parent().addClass('active').siblings('.stages-name').removeClass('active');
        $('.page-wrapper').hide();
        $('.page-wrapper-'+progress).show();
    });
    $('.page-trigger:first').click();

    // 保存及发布
    $('.btn-save').disableSelection().on('click', project.doSave);
    $('.btn-publish').disableSelection().on('click', project.doPublish);

    // 某些字段具有联动修改功能
    $('.field').each(function () {
        var $this = $(this);
        if ($this.attr('twins')) {
            var twinsId = $this.attr('twins');
            $this.on('change', function () {
                $('.field-' + twinsId).each(function () {
                    if ($(this)[0].tagName == 'DIV') {
                        $(this).text($this.val());
                    } else {
                        $(this).val($this.val());
                    }
                });
            })
        }
    });

    // 启动日历插件
    $('.datepicker').datepicker({
        showButtonPanel: true,
        changeMonth: true,
        changeYear: true,
        showOptions: { direction: "down" }
    }).each(function () {
        var sid = 'dp' + global.uuid8();
        $(this).addClass(sid).parent().siblings('span')
                .find('.icon-calendar').attr({'ref': sid});
    });
    $('.icon-calendar').on('click', function () {
        $('.' + $(this).attr('ref')).datepicker('show');
    });


    if (global.QueryString.projectId != undefined) {
        project.modify();
        console.log('modify ing project');
    } else {
        $('.btn-history-toggle').off('click').removeClass('btn-history-toggle').addClass('btn-history-disable');
        console.log('new ing project');
    }
    console.log('user: ' + $.cookie('userID') + ' token: ' + ($.cookie('token') ? '(c)'+$.cookie('token') : '(o)'+global.test_token) );

});






