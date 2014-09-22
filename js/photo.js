
// global temp variables, not safity, will remove later
var tmp = { obj: {} };

var PhotosRows = function (options) {
	this.list = [];
	this.category = [];

	this.uploadCount = function () {
		var count = 0;
		var _this = this;
		$(this.category).each(function (i, o) {
			if (_this.list[this]) {
				count += _this.list[this].uploadCount();
			}
		});
		return count;
	}
	this.postToServer = function (options) {
		var _this = this;
		$(this.category).each(function (i, o) {
			if (_this.list[this])
				options.category = this;
				_this.list[this].postToServer(options);
		});
	}
	this.dropPhoto = function (options) {
		// console.log('PhotosRows dropPhoto');
		// console.log(options);
		var _this = this;
		if (_this.list[options.category]) {
			_this.list[options.category].dropPhoto(options);
		}
	}

	this.init = function (options) {
		this.opt = $.extend({}, options);
		var projectId = this.opt.projectId;
		var allPhotos = options.photos;
		var _this = this;

		$('.photos').each(function () {
			var category = $(this).attr('fieldId');
			var photosRow = new PhotosRow({
				'view': _this.opt.view,
				'category': category
			});
			_this.list[category] = photosRow;
			_this.category.push(category);
			$(this).append(photosRow.el);

			if (allPhotos) {
				_this.list[category].fillData( _.filter(allPhotos, function (c) { return c.imageCategory == category }) );
			}
		});

		// make image uploader
		if (_this.category.length > 0) {

			var readMultipleFiles = function (evt) {
				var category = $(this).attr('ref');
			    //Retrieve all the files from the FileList object
			    var files = evt.target.files; 
			    		
			    if (files) {
			        for (var i = 0; i < files.length; i++) {

			        	if (files[i].type != 'image/jpeg') {
					        var pop = new PopingView();
					        pop.show({ text: files[i].name+" 文件类型错误，请上传JPG格式的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
			        		continue;
			        	}
			        	if (files[i].size > 200000) {
					        var pop = new PopingView();
					        pop.show({ text: files[i].name+" 文件过大，请上传200K以内的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
			        		continue;
			        	}
		        		// console.log('FileUpload:' +files[i].name+' will be uploaded ...');

			            (function (i) {
			                var reader = new FileReader();
			                reader.onload = function (event) {
			                    tmp.obj = {
			                        "edited": true,
			                        "category": category,
		                            "imgContent": event.target.result,
		                            "file": files[i]
			                    };
			                    project.photos.dropPhoto(tmp.obj);
			                };
			                reader.readAsDataURL(files[i]);
			            })(i);
			        }
			    } else {
					console.log("Failed to load files"); 
			    }
			}
		    $('.attach').hover(function () {
		        $(this).find('.cmps').addClass('cmps-hover');
		    }, function () {
		        $(this).find('.cmps').removeClass('cmps-hover');
		    }).on('click', function () {
				
  				var trigger = $(this).find('input:file')[0];
  				trigger.addEventListener('change', readMultipleFiles, false);
  		        trigger.click();

		    });

		    var ignoreDrag = function(e) {
		        var event = typeof e.originalEvent != 'undefined' ? e.originalEvent : e;
		        if (event.stopPropagation) {
		            event.stopPropagation();
		        }
		        if (event.preventDefault) {
		            event.preventDefault();
		        }
		    };
		    $('.dragtrigger').on("dragover", function () {
		        $(this).find('.holder').height($(this).find('.photos').outerHeight()+30).show();
		        return false;
		    }).on("dragenter", function () {
		    	// console.log('dragenter');
		        $(this).find('.holder').height($(this).find('.photos').outerHeight()+30).show();
		        return false;
		    });

		    $('.holder').on("dragleave", function () {
		        $('.holder').hide();
		        return false;
		    }).on("drop", function (e) {
		        var category = $(this).attr("ref");

		        // ensure that we listen out for the window event
		        // e = e || window.event;
		        e = (e&&e.originalEvent?e.originalEvent:window.event) || e;
		        // console.log(e);
		        ignoreDrag(e);
		        // And that for the fix to work we accept `e.files`
		        var files = (e.files || e.dataTransfer.files);
		        // console.log(files);

		        for (var i = 0; i < files.length; i++) {

		        	if (files[i].type != 'image/jpeg') {
				        var pop = new PopingView();
				        pop.show({ text: files[i].name+" 文件类型错误，请上传JPG格式的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
		        		continue;
		        	}
		        	if (files[i].size > 200000) {
				        var pop = new PopingView();
				        pop.show({ text: files[i].name+" 文件过大，请上传200K以内的文件！", parent: '.wrapper', view: "errorView", timeout: 4000, css: {top: '60px'} });
		        		continue;
		        	}
	        		console.log('FileUpload:' +files[i].name+' will be uploaded ...');

		             (function (i) {
		                var reader = new FileReader();
		                reader.onload = function (event) {
		                    tmp.obj = {
		                        "edited": true,
		                        "category": category,
	                            "imgContent": event.target.result,
	                            "file": files[i]
		                    };
		                    // lists.push(obj);
		                    project.photos.dropPhoto(tmp.obj);
		                };
		                reader.readAsDataURL(files[i]);
		            })(i);
		        }

		        $('.holder').hide();
		        return false;
		    });		
		}
	};
	this.init(options);
}

var PhotosRow = function (options) {
	var _this = this;
	this.refresh = function () {
		return $(this.list).each(function () {
			this.refresh();
		});
	}
	this.uploadCount = function () {
		var count = 0;
		$(this.list).each(function () {
			if (this.needUpload()) count++;
		});
		return count;
	}
	this.postToServer = function (options) {
		$(this.list).each(function () {
			this.postToServer(options);
		});
	}
	this.fillData = function (data) {

		for (var i=data.length-1; i>=0; i--) {
			// console.log(data[i]);
			var obj = data[i];
			obj.edited = false;
			this.dropPhoto(obj);
		}
	}
	this.dropPhoto = function (options) {
		options.view = this.opt.view;
		var photo = new Photo(options, this);
		this.el.prepend(photo.el);
		this.list.push(photo);
	}
	this.init = function (options) {
		this.opt = $.extend({}, options);
		this.list = [];
		this.el = $('<div class="c"><div class="clear"></div></div>');
	}
	this.init(options);
	// console.log(this);
}

var Photo = function (options, container) {

	this.template = {
		photo: function (data) {
			if (data.imgContent) {
				return $('<div class="thumb"><img src="'+data.imgContent+'" /><i class="icon icon-remove"></i></div>');
			} else {
				return $('<div class="thumb" ref="'+data.imageOriginalLocation+'" popwidth="'+data.imageWidth+'" popheight="'+data.imageHeight+'"><img src="'+global.server+data.imageCompressLocation+'" /><i class="icon icon-remove"></i></div>');
			}
		},
	};
	this.needUpload = function () {
		return this.data && this.edited;
	}
	this.postToServer = function (options) {

		var url = '/PiProjectStageUpdate/ImagesAdd';
		if (this.data && this.edited) {
			console.log('postPhotoToServer url:' + global.serviceUrl + url + ', projectId:' + options.projectId + ', category:' + options.category );
			var _options = options;

			var data = {
				"imageBase64": this.data.imgContent.replace('data:image/jpeg;base64,',''), 
		  		"ImageCategory": options.category, 
		  		"projectId": options.projectId
			};

			$.post(global.serviceUrl + url, data, function (msg) {
				console.log(msg);
	            if (global.uploadCount && global.uploadCount > 0) {
	            	console.log('dec global uploadCount from ['+global.uploadCount+'] to ['+(global.uploadCount-1)+'].');
	            	global.uploadCount--;
	            }
	            if (_options.afterUpload && typeof _options.afterUpload === "function") {
	            	_options.afterUpload();
	            }
			});
		}
	}
	this.isEdited = function () {
		return this.edited;
	}
	this.fillData = function (data) {
		var _this = this;
		this.data = data;
		this.el = this.template.photo(this.data);
		this.el.on('click', function () {
			var img = _this.el.clone();
			if (img.attr('ref')) {
				var url = global.server + img.attr('ref');
				var width = img.attr('popwidth');
				var height = img.attr('popheight');
	        	img = $('<img />').attr({'src': url, 'width': width, 'height': height});
			}
			_this.photoSectionView(img);
		}).hover(function () {
			// if ($(_this.el).attr('ref') == undefined)
				// no delete function
				// $(this).find('.icon-remove').show();
		}, function () {
			$(this).find('.icon-remove').hide();
		});
		$(this.el).find('.icon-remove').on('click', function (e) {
			_this.parent.list.splice($(_this.el).index(), 1);
			$(_this.el).remove();
			console.log(_this.parent.list);
			return false;
		});
		return this;
	}
	this.photoSectionView = function (img) {
		console.log(this.opt.view);
		this.opt.view.html(img).bPopup({
            opacity: 0.6,
            speed: 150,
            transition: 'fadeIn',
            closeClass: 'close'
        });
	}
	this.init = function (options, container) {
		this.opt = options;
		this.category = options.imageCategory;
		this.id = global.uuid();
		this.fillData(options);
		this.edited = options.edited;
		this.parent = container;
	}
	this.init(options, container);
	// console.log(this);
}










