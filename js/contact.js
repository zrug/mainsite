
var ContactsRows = function (options) {
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
	};

	this.dutiesValues = {
		"auctionUnitContacts": {
			"values": ["项目经理","采购经理","设计经理","项目总负责","其他"]
		},
		"ownerUnitContacts": {
			"values": ["设计报建"]
		},
		"explorationUnitContacts": {
			"values": ["项目负责人"]
		},
		"designInstituteContacts": {
			"values": ["建筑师","结构工程师","电气工程师","暖通工程师","给排水工程师","幕墙工程师等"]
		},
		"contractorUnitContacts": {
			"values": ["现场经理","采购负责人"]
		},
		"pileFoundationUnitContacts": {
			"values": ["现场经理","采购负责人"]
		}
	};

	this.postToServer = function (options, callback) {
		var _this = this;
		options.projectId = this.opt.projectId;
		var allContacts = new Array();
		$(this.category).each(function (i, o) {
			if (_this.list[this]) {
				var result = _this.list[this].postToServer(options);
				if (result && result.length > 0) {
					for (var i=0; i<result.length; i++) {
						allContacts.push(result[i]);
					}
				}
			}
		});
		return allContacts;
	}

	this.init = function (options) {
		this.opt = $.extend({}, options);
		var $contactSection = this.opt.view;
		var projectId = this.opt.projectId;
		var allContacts = this.opt.contacts;
		var _this = this;
		$('.contacts').each(function () {
			var category = $(this).attr('id');
			var contactsRow = new ContactsRow({
				'category': category,
				'dutiesValues': _this.dutiesValues[category].values
			});
			_this.list[category] = contactsRow;
			_this.category.push(category);
			$(this).append(contactsRow.el);

			if (allContacts) {
				_this.list[category].fillData( _.filter(allContacts, function (c) { return c.contactCategory == category }) );
			}
		});

		// summon contact input dialog
	    $('.contact-card').on('click', function () {
	        var fillContactSection = function (data) {
	            $contactSection.find('#name').val(data.name),
	            $contactSection.find('#duties').val(data.duties), 
	            $contactSection.find('#telephone').val(data.telephone), 
	            $contactSection.find('#workAt').val(data.workAt), 
	            $contactSection.find('#workAddress').val(data.workAddress)
	        }
	        var clearContactSection = function (data) {
	            $contactSection.find('#name').val(''),
	            $contactSection.find('#duties').val(''), 
	            $contactSection.find('#telephone').val(''), 
	            $contactSection.find('#workAt').val(''), 
	            $contactSection.find('#workAddress').val('')
	        }
	        var row = $(this).parent().attr('id');
	        var index = $(this).index();

	        $contactSection.find('#category').val(row);
	        $contactSection.find('#index').val(index);

	        $contactSection.find('#duties option').remove();
	        $(_this.dutiesValues[row].values).each(function () {
	        	$contactSection.find('#duties').append($('<option value="'+this+'">'+this+'</option>'));
	        });

	        if (_this.list[row].list[index].local_data) {
	        	// console.log(_this.list[row].list[index].local_data);
	            fillContactSection(_this.list[row].list[index].local_data);
	        } else {
	            clearContactSection();
	        }

	        $contactSection.bPopup({
	            opacity: 0.6,
	            easing: 'easeOutBack', //uses jQuery easing plugin
	            speed: 450,
	            transition: 'slideUp',
	            closeClass: 'close'
	        });
	    });

		// dismiss contact dialog
	    $('#contact-section-ok').on('click', function () {
	        if ($contactSection.find('#name').val().length == 0) { return; }

	        var row = $contactSection.find('#category').val();
	        var index = $contactSection.find('#index').val();
	        var contact = _this.list[row].list[index];

	        if (!contact.local_data) {
	            index = _this.list[row].last;
	            _this.list[row].last++;
	        }
	        contact.fillData({
	            "name": $contactSection.find('#name').val(),
	            "duties": $contactSection.find('#duties').val(), 
	            "telephone": $contactSection.find('#telephone').val(), 
	            "workAt": $contactSection.find('#workAt').val(), 
	            "workAddress": $contactSection.find('#workAddress').val(),
	            "project": $('#projectName').val()
	        });
	        // contact.edited = true;
	        _this.list[row].refresh();
	    });
	};
	this.init(options);
	// console.log(this);
}

var ContactsRow = function (options) {
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
		var results = new Array();
		$(this.list).each(function () {
			var result = this.postToServer(options);
			if (result) results.push(result);
		});
		return results;
	}
	this.fillData = function (data) {
		if (data.length > 3) {
			console.log('DATABASE ERROR: Contacts in [' + this.category + '] count [' + data.length + '] > 3');
			data.length = 3;
		}
		for (var i=data.length-1; i>=0; i--) {
			this.list[i].fillData(data[i]);
			this.list[i].refresh();
			this.last++;
		}
	}
	this.init = function (options) {
		var _category = this.category = options.category;
		this.list = [
			new Contact({'category': _category}), 
			new Contact({'category': _category}), 
			new Contact({'category': _category})
		];
		this.el = this.list[0].el.add(this.list[1].el).add(this.list[2].el);
		this.last = 0;
		$('.' + this.category).append(this.el);
	}
	this.init(options);
	// console.log(this);
}

var Contact = function (options) {
	this.edited = false;

	this.template = {
		empty: function () {
			return $('<div class="contact-card empty"></div>');
		},
		card: function () {
			return $('<div class="contact-card"> \
                    <fieldset class="first"> \
                    <input type="text" id="name" class="coltwo" readonly="readonly" placeholder="添加姓名" />  \
                    </fieldset> \
                    <fieldset> \
                    <input type="text" id="telephone" class="coltwo" readonly="readonly" placeholder="添加电话" />  \
                    </fieldset> \
                    <fieldset class="last"> \
                    <label for="duties" class="blue">岗位&nbsp;<img src="images/contact_card_arrow.png" class="duties-img" /></label> \
                    <input type="text" id="duties" class="colone" readonly="readonly" />  \
                    </fieldset> \
                </div>');
		},
	};
	this.setEdited = function () {
		this.edited = true;
	}
	this.isEdited = function () {
		return this.edited;
	}
	this.needUpload = function () {
		console.log('contact needUpload: ' + this.local_data && this.edited);
		return this.local_data && this.edited;
	}
	this.contactToData = function (data) {
		if (data.name) return data;
		return {
	        "baseContactID": data.id,
	        "category": data.contactCategory,
	        "duties": data.contactDuties,
	        "name": data.contactName,
	        "telephone": data.contactCellphone,
	        "url": "",
	        "workAddress": data.contactCompanyAddress,
	        "workAt": data.contactCompany
	    };
	}
	this.dataToContact = function (contact) {
		if (contact.contactName) return contact;
		return {
	        "id": contact.baseContactID,
	        "contactCategory": contact.category,
	        "contactDuties": contact.duties,
	        "contactName": contact.name,
	        "contactCellphone": contact.telephone,
	        "contactCompanyAddress": contact.workAddress,
	        "contactCompany": contact.workAt
	    };
	}
	this.refresh = function () {
		if (this.el.html().length > 0) {
			$('#'+this.id).html(this.el.html()).removeClass('empty');
		}
	}
	this.postToServer = function (options) {
		var result;
		if (this.local_data && this.edited) {
		    result = this.dataToContact(this.local_data);
		    result.contactCategory = this.category;
		    result.contactProjectId = options.projectId;
		    result.isDeleted = false;
		}
		return result;
	}
	this.fillData = function (contactData) {
		if (!contactData) return;
		var data = this.contactToData(contactData);

		if (this.el.hasClass('empty')) {
			this.el = this.template.card().attr({'id':this.id});
		}
		this.el.find('#name').attr({'value':data.name});
		this.el.find('#telephone').attr({'value':data.telephone});
		this.el.find('#duties').attr({'value':data.duties});

		if (this.local_data) {
			if ( (this.local_data.name != data.name) ||
				 (this.local_data.duties != data.duties) ||
				 (this.local_data.telephone != data.telephone) ||
				 (this.local_data.workAt != data.workAt) ||
				 (this.local_data.workAddress != data.workAddress)
				) {
				// console.log('has local_data and be edited');
				this.setEdited();
			}
		} else {
			if (!data.baseContactID) {
				// console.log('have no local_data, but be created');
				this.setEdited();
			}
		}
		this.local_data = $.extend(this.local_data, data);
	}
	this.init = function (options) {
		if (options.data) {
			$.extend(this.local_data, options.data);
		}
		this.category = options.category;
		this.id = global.uuid();
		this.el = this.template.empty().attr({'id': this.id});
	}
	this.init(options);
	// console.log(this);
}










