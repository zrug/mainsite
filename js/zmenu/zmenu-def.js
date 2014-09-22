global.mainMenuDef01 = {
	$wrapper: $(".menu.main-nav"),
	items: [
		new Menuitem({model:{text:"首页", href:"home.html"}}),
		new Menuitem({model:{text:"项目", href:""},
					  sub: new Menu({
						at: "bottom",
						items: [
							new Menuitem({model:{text:"全部项目", href:"allProjects.html"}}),
							new Menuitem({model:{text:"项目专题", href:""}}),
							new Menuitem({model:{text:"创建项目", href:"project.html"}})
						]
					  })
		}),
		new Menuitem({model:{text:"人脉", href:""},
					  sub: new Menu({
						at: "bottom",
						items: [
							new Menuitem({model:{text:"人脉人脉", href:""}}),
							new Menuitem({model:{text:"人脉人脉", href:""}}),
							new Menuitem({model:{text:"人脉人脉", href:""}}),
							new Menuitem({model:{text:"人脉人脉", href:""}})
						]
					  })
		}),
		new Menuitem({model:{text:"组织", href:""} }),
		new Menuitem({model:{text:"交易", href:""} })
	]
};
