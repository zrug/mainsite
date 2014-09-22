global.scrollingLoader = {
    index: 0,
    pageSize: 12,
    identify: 0,
    q: global.QueryString.q
};

$(function () {

    // load first page
    projectCardLoader(global.scrollingLoader);

    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= 
            $('.content').offset().top + $('.content').height() ) { 

            if ( global.scrollingLoader.identify >= $(window).scrollTop()-100 && global.scrollingLoader.identify <= $(window).scrollTop()+100 ) {

            } else {
                global.scrollingLoader.identify = $(window).scrollTop();

                global.scrollingLoader.index ++;
                projectCardLoader(global.scrollingLoader);
            }
        }
    });

    $('#q').on('keydown', function (e) {
        if (e.keyCode == 13) {
            console.log($(this).val());
            location.href="?q=" + $(this).val();
            $(this).select();
        }
    }).on('click', function () {
        $(this).select();
    }).focus().val(decodeURIComponent(global.QueryString.q || ''));

    $('.relogin').on('click', function () {
        location.href = "login.html";
    });

    $('.advsrch-trigger').on('click', function () {
        $('.advsrch').animate({
            top: '50px'
        }, 400).addClass('active');
    });
    $('.btn-close').on('click', function () {
        $('.advsrch').animate({
            top: '-220px'
        }, 400).removeClass('active');
    });


});

var projectCardLoader = function (opt) {

    var makeProjectCards = function (datas) {
        var dataToDate = function (data) {
            if (!data) return "";
            var date = new Date(data);
            return date.getFullYear() + '-' + (date.getMonth()*1+1) + '-' + date.getDate();
        }
        var card = function (data) {
            var el = $('<dd class="porject-card"> \
                            <div class="fakemap" id="map"> \
                                <img src="images/fakemap.png" /> \
                            </div> \
                            <p class="gray" id="projectName"></p> \
                            <p class="" id="projectProgress"> \
                                <img src="images/projectCardSection1.png" id="projectSection" /> \
                            </p> \
                            <p class="" id="mapicon"></p> \
                            <p class="blue" id="investment-title">投资额</p> \
                            <p class="gray" id="investment"></p> \
                            <p class="blue" id="areaOfStructure-title">建筑面积</p> \
                            <p class="gray" id="areaOfStructure"></p> \
                            <p class="gray" id="expectedStartTime"></p> \
                            <p class="orange" id="expectedFinishTime"></p> \
                            <div class="mappoint" id=""></div> \
                            <p class="blue" id="district"></p> \
                            <p class="gray" id="province_city"></p> \
                            <div class="focus"></div> \
                        </dd>');

            el.find('#projectName').text(
                data.projectName ?
                ( data.projectName.length < 10 ? data.projectName : (data.projectName.substring(0, 9) + '...') ) : ''
            );
            el.find('#province_city').text(
                data.landAddress ?
                ( data.landAddress.length < 10 ? data.landAddress : (data.landAddress.substring(0, 9) + '...') ) : ''
            );
            el.find('#district').text(
                data.landProvince ?
                ( data.landProvince.length < 5 ? data.landProvince : (data.landProvince.substring(0, 4) + '...') ) + ' - ' : ''
            );

            el.find('#investment').text('￥' + (data.investment || "").toLocaleString());
            el.find('#areaOfStructure').text((data.landArea || "").toLocaleString() + '㎡');
            el.find('#expectedStartTime').text(dataToDate(data.expectedStartTime));
            el.find('#expectedFinishTime').text(dataToDate(data.expectedFinishTime));

            el.attr({'ref': data.id});
            el.on('click', function () {
                var surl = 'projectDetail.html?projectId=' + $(this).attr('ref');
                location.href = surl;
            });
            el.find('.focus').on('click', function () {
                console.log('focus focus');
            })
            return el;
        };

        var pageCount = Math.round(datas.status.totalCount / global.scrollingLoader.pageSize);
        var pageRecordStartAt = global.scrollingLoader.index * global.scrollingLoader.pageSize + 1;
        var pageRecordEndAt = (global.scrollingLoader.index+1) * global.scrollingLoader.pageSize;
        pageRecordEndAt = pageRecordEndAt > datas.status.totalCount ? datas.status.totalCount : pageRecordEndAt;
        console.log( "第["+(global.scrollingLoader.index+1)+"]页，共["+pageCount+"]页，\
第["+pageRecordStartAt+"]-["+pageRecordEndAt+"]条，共["+datas.status.totalCount+"]条" );
        
        // $('.content dl dd').remove();
        $(datas.data).each(function () {
            $('.content dl').append(card(this));
        });
        $('.endOfPage').show();
    }

    var url = (opt.q ? '/Projects/PiProjectSeach?keywords=' + opt.q + '&' : '/Projects/AllProjects?')
        + 'pageIndex=' + opt.index + '&pageSize=' + opt.pageSize;

    console.log(global.serviceUrl + url);


$.ajaxSetup({
    headers: {
        'Authorization': '5dc180cc-d1df-424c-bbbf-0de57da5831c:234467a5-e04f-4a26-a10a-4c04814bbb52'
    }
});

    $.get(global.serviceUrl + url, function (msg) {
        console.log(msg);
        makeProjectCards(msg.d);
    });

};
