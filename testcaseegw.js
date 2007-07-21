/*
 * Ext JS Library 1.0.1
 * Copyright(c) 2006-2007, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://www.extjs.com/license
 */

 
var grid, ds;
 
Ext.onReady(function(){
	Ext.BLANK_IMAGE_URL = "ext-1.1-rc1/resources/images/default/s.gif";
	Ext.QuickTips.init();

	
	
	//============================================
	//============== create HTML Code =============
	//============================================
	
	bodyTag			= Ext.Element.get(document.body); //get Instance of BodyTagExtJsElement
	containerDivTag		= bodyTag.createChild({tag: 'div'});	

	headerDivTag		= containerDivTag.createChild({tag: 'div',id: 'header',cls: 'x-layout-inactive-content',style: 'padding: 0px 0px 0px 0px'});

	navDivTag		= containerDivTag.createChild({tag: 'div',id: 'nav',cls: 'x-layout-inactive-content'});
		
	contentDivTag		= containerDivTag.createChild({tag: 'div',id: 'content',cls: 'x-layout-inactive-content'});
	toolbardivDivTag	= contentDivTag.createChild({tag: 'div',id: 'toolbardiv',cls: 'x-layout-inactive-content'});
	gridDivTag		= contentDivTag.createChild({tag: 'div',id: 'grid',cls: 'x-layout-inactive-content'});
				
	footerDivTag		= containerDivTag.createChild({tag: 'div',id: 'footer',cls: 'x-layout-inactive-content',style: 'padding: 0px 0px 0px 0px'});

	searchdivDivTag		= bodyTag.createChild({tag: 'div',id: 'searchdiv',cls: 'x-layout-inactive-content',style: 'padding: 0px 0px 0px 0px',text:'test'});
	searchinputInputTag 	= searchdivDivTag.createChild({type: 'text' ,tag: 'input',id: 'searchinput', name:'searchinput',cls: 'x-layout-inactive-content'});
	
	addressbookArea		= bodyTag.createChild({tag: 'div'});
	calendarArea		= bodyTag.createChild({tag: 'div'});
	
	
	//============================================
	//============ end create HTML Code ============
	//============================================
	
	
	
	//============================================
	//==================== grid ===================
	//============================================
	
	// create the Data Store
	ds = new Ext.data.JsonStore({
		url: 'jsonrpc.php',
		baseParams: {func: 'getData'},
		root: 'results',
		totalProperty: 'totalcount',
		id: 'userid',
		fields: [
			{name: 'userid'},
			{name: 'lastname'},
			{name: 'firstname'},
			{name: 'street'},
			{name: 'zip'},
			{name: 'city'},
			{name: 'birthday'},
			{name: 'addressbook'}
		],
		// turn on remote sorting
		remoteSort: true
	});
	
	ds.setDefaultSort('lastpost', 'desc');
	//ds.load({params:{method:'Felamimail_Json::getData', start:0, limit:50}}); // initial data store load with 5 datasets
	// deliver some data preload with the javascript file already
	ds.loadData({"totalcount":165,"results":[{"userid":0,"lastname":"lastname 0","firstname":"firstname 0","street":"street0","zip":"01234","city":"havanna","birthday":"13.08.1926","addressbook":"personal"},{"userid":1,"lastname":"lastname 1","firstname":"firstname 1","street":"street 1","zip":"01234","city":"havanna","birthday":"13.08.1926","addressbook":"personal"}]});

	//define grid appearance
	var cm = new Ext.grid.ColumnModel([{
		resizable: true,
		id: 'userid', // id assigned so we can apply custom css (e.g. .x-grid-col-topic b { color:#333 })
		header: "ID",
		dataIndex: 'userid',
		width: 30
	},{
		resizable: true,
		id: 'lastname',
		header: "lastname",
		dataIndex: 'lastname',
		//width: 250,
		renderer: renderLastNamePlain
	},{
		resizable: true,
		id: 'firstname',
		header: "firstname",
		dataIndex: 'firstname',
		//width: 250,
		renderer: renderLastNamePlain,
		hidden: true
	},{
		resizable: true,
		header: "street",
		dataIndex: 'street'
		//width: 150
	},{
		resizable: true,
		id: 'city',
		header: "zip/city",
		dataIndex: 'city',
		//width: 150
		renderer: renderCityPlain
	},{
		resizable: true,
		header: "birthday",
		dataIndex: 'birthday'
		//width: 100
	},{
		resizable: true,
		id: 'addressbook',
		header: "addressbook",
		dataIndex: 'addressbook',
		//width: 450,
		renderer: renderLastNamePlain
	}]);
	
	cm.defaultSortable = true; // by default columns are sortable
	
	//render grid content fields in a certain way
	function renderLastName(value, p, record){
		return String.format('<b>{0}</b> {1}', value, record.data['firstname']);
	}
	
	function renderLastNamePlain(value){
		return String.format('<b><i>{0}</i></b>', value);
	}
	
	function renderCity(value, p, record){
		return String.format('{1} / {0}', value, record.data['zip']);
	}
	
	function renderCityPlain(value){
		return String.format('<b><i>{0}</i></b>', value);
	}

	// create the editor grid
	grid = new Ext.grid.Grid(gridDivTag, {
		ds: ds,
		cm: cm,
		autoSizeColumns: false,
		selModel: new Ext.grid.RowSelectionModel({multiSelect:true}),
		enableColLock:false,
		//monitorWindowResize: true,
		loadMask: true,
		enableDragDrop:true,
		ddGroup: 'TreeDD',
		autoExpandColumn: 'lastname'
	});
	
	//reacts on doubleclick in line area from grid
	grid.on('rowdblclick', function(gridPar, rowIndexPar, ePar) {
		var record = gridPar.getDataSource().getAt(rowIndexPar);
		//alert('id: ' + record.data.userid);
		try {
			appId = 'addressbook';
			window.open('popup.php?itemid='+record.data.userid+'&app='+appId,'popupname','width=400,height=400,directories=no,toolbar=no,location=no,menubar=no,scrollbars=no,status=no,resizable=no,dependent=no');
		}
		catch(e) {
			//alert(e);
		}
	});
	
	// displays the context menu
 	grid.on('cellcontextmenu', function(gridP, rowIndexP, cellIndexP, eventP) {
 		eventP.stopEvent();
 		ctxMenu.showAt(eventP.getXY());
 	});

	// update the active menu buttons
 	grid.on('rowclick', function(gridP, rowIndexP, eventP) {
		var rowCount = grid.getSelectionModel().getCount();
		if(rowCount < 1) {
			btns.edit.disable();
			btns.del.disable();
		} else if(rowCount == 1) {
			btns.edit.enable();
			btns.del.enable();
		} else {
			btns.edit.disable();
			btns.del.enable();
		}
 	});

	grid.render();					
	

	//var el = Ext.get("popup");
	//el.setStyle('background-color:#C3DAF9');
	//============================================
	//================== header ===================
	//============================================

	var headerTb = new Ext.Toolbar('header');
	

	
	//============================================
	//=============== end header ===================
	//============================================

	 
	//======================================
	//==========  toolbar definition ============
	//======================================

	var tblk = headerTb;

	tblk.add({
		id: 'add',
		cls:'x-btn-icon show',
		icon:'images/oxygen/16x16/actions/edit-add.png',
		tooltip: 'add new entry'
	},{
		id: 'edit',
		cls:'x-btn-icon edit',
		icon:'images/oxygen/16x16/actions/edit.png',
		disabled: true,
		tooltip: 'edit entry'
	},{
		id: 'del',
		cls:'x-btn-icon delete',
		icon:'images/oxygen/16x16/actions/edit-delete.png',
		disabled: true,
		tooltip: 'delete entry',
		onClick: function() {
			m = grid.getSelections();
			for(i=0;i<m.length;i++) {
				record = ds.getById(m[i].get("userid"));
				ds.remove(record); // removes record only in grid, needs to be done also on server side
			}			
		}
	},'-',{
		id: 'details',
		pressed: false,
		enableToggle:true,
		//text: 'details',
		icon: 'images/oxygen/16x16/actions/fileview-detailed.png',
		cls: 'x-btn-icon details',
		toggleHandler: toggleDetails,
		tooltip: 'view details'
	},'-');

	//----------------------------------------------------------------
	//--------------------------- Combobox -----------------------
	//----------------------------------------------------------------
	
	var store = new Ext.data.SimpleStore({
		fields: ['id', 'state'],
		data : [
	        	['all', 'Alle Stati'],
	        	['important', 'wichtig'],
	        	['unread', 'ungelesen'],
	        	['replied', 'beantwortet'],
	        	['red', 'gelesen'],
	        	['deleted', 'gel&ouml;scht']			
		]
	});
	
	var combo = new Ext.form.ComboBox({
		store: store,
		displayField:'state',
		typeAhead: true,
		mode: 'local',
		triggerAction: 'all',
		emptyText:'select a state...',
		selectOnFocus:true,
		width:135
	});	
	
	tblk.addField(combo);	
	tblk.add('->');

	//======================================
	//==========  toolbar definition ============
	//==========  search field ============
	//======================================

	//template - search result of combo box appearing below the input field
	var resultTpl = new Ext.Template(
		'<div class="search-item">',
		'<h3>{lastname}</h3>',
		'</div>'
	);
	
	//combobox to enter search pattern / selecting contact address
	var searchCombo = new Ext.form.ComboBox({
		store: ds,
		displayField:'searchresults',
		typeAhead: true,
		loadingText: 'Searching...',
		width: 220,
		pageSize:10,
		hideTrigger:true,
		tpl: resultTpl,
		emptyText: 'Search pattern...',
		onSelect: function(record) { 
			ds.reload(
				{	params:{start:0, limit:50, test:1}	}
			);
	
			this.collapse();
			grid.getView().refresh();
		}
	});
	
	// apply it to the exsting input element
	searchCombo.applyTo('searchinput');
	tblk.addElement('searchdiv');

	tblk.add('-');

	headerTb.add(new Ext.Toolbar.Button({
		//text: 'Logout',
		handler: onLogoutButtonClick,
		tooltip: {text:'This buttons logs you out form eGroupWare.', title:'Logout'},
		//cls: 'x-btn-text-icon blist',
		icon: 'images/oxygen/16x16/actions/system-log-out.png',
		cls: 'x-btn-icon details'
        })
	);		
	
	function onLogoutButtonClick(e) {
		Ext.MessageBox.confirm('Confirm', 'Are you sure you want to logout?', function(btn, text){
			//alert(btn);
			if (btn == 'yes'){
				// log out from eGW
			}
		});
	}
	//----------------------------------------------------------------
	//----------------------- end Combobox ---------------------
	//----------------------------------------------------------------
	
	//combobox
	var btns = tblk.items.map;

	//======================================
	//==========  layout definition ============
	//======================================
	var combo;
	
	var layout = new Ext.BorderLayout(document.body, {
		north: {
			split:false,
			initialSize: 26
		},
		south: {
			split:false,
			initialSize: 20
		},
		west: {
			split:true,
			initialSize: 225,
			minSize: 100,
			maxSize: 500,
			autoScroll:true,
			collapsible:true,
			titlebar: true,
			animate: true
		},
		center: {
			split:true,
			collapsible:true,
			//titlebar: true,
			animate: true,						
			useShim:true
		}		
	});
	
	layout.beginUpdate();
	layout.add('north', new Ext.ContentPanel(headerDivTag, {fitToFrame:true}));
	layout.add('south', new Ext.ContentPanel(footerDivTag, {fitToFrame:true}));
	//layout.add('west', new Ext.ContentPanel(navDivTag, {fitToFrame:true, title:'eGroupWare', resizeEl: 'tree'}));
	layout.add('west', new Ext.ContentPanel(navDivTag, {fitToFrame:true}));

	var curGridPanel = new Ext.GridPanel(grid);

	layout.add('center', curGridPanel);
	layout.endUpdate();

	//============================================
	//============ end layout definition =============
	//============================================
	
	//============================================
	//=============== Context Menu ================
	//============================================

	var ctxMenu = new Ext.menu.Menu({
		id:'copyCtx', items: [{
			id:'expand',
			text:'unread'
		},{
                	id:'collapse',
                	text:'important'
		}]
	});
	
	var ctxMenuTreeFellow = new Ext.menu.Menu({
		id:'copyCtx', items: [{
			id:'expand',
			text:'unread fellow'
		},{
                	id:'collapse',
                	text:'important fellow'
		}]
	});
	
	var ctxMenuTreeTeam = new Ext.menu.Menu({
		id:'copyCtx', items: [{
			id:'expand',
			text:'unread team'
		},{
                	id:'collapse',
                	text:'important team'
		}]
	});
	
	//============================================
	//============== end Context Menu =============
	//============================================
	

	//============================================
	//=============== tree definition ===============
	//============================================

	var Tree = Ext.tree;

	treeLoader = new Tree.TreeLoader({dataUrl:'jsonrpc.php', baseParams:{func:'getTree'}});
	treeLoader.baseParams.func = 'getTree';
	treeLoader.on("beforeload", function(loader, node) {
		loader.baseParams.application = node.attributes.application;
	}, this);
	            
	var tree = new Tree.TreePanel('nav', {
		animate:true,
		loader: treeLoader,
		enableDD:true,
		//lines: false,
		ddGroup: 'TreeDD',
		enableDrop: true,			
		containerScroll: true,
		rootVisible:false
	});

	//handle drag and drop
	tree.on('beforenodedrop', function(e) {

			sourceAppId = getAppByNode(e.dropNode);
			targetAppId = getAppByNode(e.target);
	
			//drag drop within the tree
			if(e.tree.id == 'nav') {				
				eval('EGWNameSpace.'+sourceAppId+'.handleDragDrop(e)');
			}
			//drag drop grid to tree
			else 
			{
			
				var s = e.data.selections, r = [];
			    for(var i = 0; i < s.length; i++) {
			        var draggedItem = s[i].data.lastname;				
					//alert(this.getRootNode().getDepth());
					//alert(this.getRootNode().findChild('id', 'personal_lk'));
					//alert(e.tree.getRootNode().findChild('id','4'));
					
					//FIND CHILD is searching only in the current level !!, submenu levels are not concerned
					
					//if(!this.getRootNode().findChild('id', 'personal_lk')){ // <-- filter duplicates , still wrong
			            r.push(new Ext.tree.TreeNode({ // build array of TreeNodes to add
			                allowDrop:false,
			                text: 'Test #' + draggedItem,
			                id: draggedItem,
							cls: 'file', 
							contextMenuClass: 'ctxMenuTreeFellow',						
							leaf: true
			            }));
			        //}
			    }
			    e.dropNode = r;  // return the new nodes to the Tree DD
			    e.cancel = r.length < 1; // cancel if all nodes were duplicates*/			
			}
	});		
	

	tree.on('click', function(node) {
		//apply panels depending on application type
		switch(node.attributes.application) {
			case 'addressbook': 			
				layout.beginUpdate();
				EGWNameSpace.AddressBook.show(layout);
				layout.endUpdate();
		
				break;
		
			case 'Asterisk_Json': 	
				layout.beginUpdate();
				EGWNameSpace.Asterisk.show(layout, node);
				layout.endUpdate();
		
				break;
		}
 	});
 	
	// set the root node
	var root = new Tree.TreeNode({
		text: 'root',
		draggable:false,
		allowDrop:false,
		id:'root'
	});
	tree.setRootNode(root);

	var overview = new Tree.AsyncTreeNode({
		text:'Information', 
		cls:'treemain', 
		allowDrag:true,
		allowDrop:true,		
		id:'overview',
		icon:'images/oxygen/16x16/actions/kdeprint-printer-infos.png',
		leaf:true
	});
	root.appendChild(overview);
	
	var addressbook = new Tree.AsyncTreeNode({
		text:'Addressbook', 
		cls:'treemain', 
		allowDrag:true, 
		allowDrop:true,		
		id:'addressbook',
		icon:'images/oxygen/16x16/apps/kaddressbook.png',
		children: [
			{text:'my addressbook', cls:'file', allowDrag:true, id:'myaddressbook', leaf:true},
			{text:'internal addressbook', cls:'file', allowDrag:true, id:'internaladdressbook', leaf:true},
			{text:'fellows addressbooks', cls:'folder', allowDrag:true, id:'fellowsaddressbooks'},
			{text:'team addressbooks', cls:'folder', allowDrag:true, id:'teamaddressbooks'}
		]
	});
	
	root.appendChild(addressbook);

	var asterisk = new Tree.AsyncTreeNode({
		text:'Asterisk', 
		cls:'treemain', 
		allowDrag:false, 
		allowDrop:true,		
		id:'asterisk',
		icon:'images/oxygen/16x16/apps/kcall.png',
		application:'Asterisk_Json',
		datatype:'overview',
		children: [
			{text:'phones', cls:'folder', allowDrag:true, id:'phones', leaf:true, application:'Asterisk_Json', datatype:'phones'},
			{text:'lines', cls:'folder', allowDrag:true, id:'lines', leaf:true, application:'Asterisk_Json', datatype:'lines'},
			{text:'classes', cls:'folder', allowDrag:true, id:'classes', leaf:true, application:'Asterisk_Json', datatype:'classes'},
			{text:'config', cls:'folder', allowDrag:true, id:'config', leaf:true, application:'Asterisk_Json', datatype:'config'},
			{text:'settings', cls:'folder', allowDrag:true, id:'settings', leaf:true, application:'Asterisk_Json', datatype:'settings'},
			{text:'software', cls:'folder', allowDrag:true, id:'software', leaf:true, application:'Asterisk_Json', datatype:'software'}
		]
	});
	
	root.appendChild(asterisk);

	var calendar = new Tree.AsyncTreeNode({
		text:'Calendar', 
		cls:'treemain', 
		allowDrag:true,
		allowDrop:true,		
		id:'calendar',
		icon:'images/oxygen/16x16/apps/korganizer.png',
		children: [
			{text:'my calendar', cls:'file', allowDrag:true, id:'mycalendar', leaf:true},
			{text:'fellows calendar', cls:'folder', allowDrag:true, id:'fellowscalendar'},
			{text:'team calendar', cls:'folder', allowDrag:true, id:'teamcalendar'}
		]
	});
	
	root.appendChild(calendar);

	var email = new Tree.AsyncTreeNode({
		text:'Email', 
		cls:'treemain', 
		allowDrag:true, 
		allowDrop:true,		
		leaf:false,
		id:'email',
		application:'Felamimail_Json',
		icon:'images/oxygen/16x16/apps/kmail.png',
		children: [
			{text:'l.kneschke@officespot.net', cls:'folder', allowDrag:true, id:'mailbox1', leaf:false, application:'Felamimail_Json'},
			{text:'lars@kneschke.de', cls:'folder', allowDrag:true, id:'mailbox2', leaf:false, application:'Felamimail_Json'}
		]
	});
	
	root.appendChild(email);

	var tasks = new Tree.AsyncTreeNode({
		text:'Tasks', 
		cls:'treemain', 
		allowDrag:true, 
		allowDrop:true,		
		id:'tasks',
		icon:'images/oxygen/16x16/apps/todolist.png',
		children: [
			{text:'my tasks', cls:'file', allowDrag:true, id:'mytasks', leaf:true},
			{text:'fellows tasks', cls:'folder', allowDrag:true, id:'fellowstasks'},
			{text:'team tasks', cls:'folder', allowDrag:true, id:'teamtasks'}
		]
	});
	
	root.appendChild(tasks);

	// render the tree
	tree.render();
	root.expand(); 
	overview.select();
	
	//============================================
	//============== end tree definition =============
	//============================================

	
	
	//============================================
	//================= footer ====================
	//============================================
	
	var headerTb = new Ext.Toolbar('footer');
	headerTb.add('5 unread emails * next meeting in 15 minutes * 2 phonecalls for today');
	
	
	
	//============================================
	//=============== end footer ===================
	//============================================
	

	//----------------------------------------------------------------
	//---------------------------- toolbar --------------------------
	//----------------------------------------------------------------
	
	var gridHeader = grid.getView().getHeaderPanel(true);
	//var gridFooter = grid.getView().getFooterPanel(true); // page navi was originally placed in footer area of table grid
	
	// add a paging toolbar to the grid's header
	//var pagingHeader = new Ext.Toolbar(gridHeader);
	
	// add a paging toolbar to the grid's footer
	var pagingHeader = new Ext.PagingToolbar(gridHeader, ds, {
		pageSize: 50,
		displayInfo: true,
		displayMsg: 'Displaying topics {0} - {1} of {2}',
		emptyMsg: "No topics to display"
	});
	
	pagingHeader.add(
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer(),
		new Ext.Toolbar.Spacer()
	);
	
	pagingHeader.addItem(new Ext.Toolbar.Separator());
	//pagingHeader.addElement('search');	//div search combo box
	//pagingHeader.addField(combo);	//div search combo box


	
	//------------------------ toolbar functions ------------------------
	
	function toggleDetails(btn, pressed) {
	        cm.getColumnById('lastname').renderer = pressed ? renderLastName : renderLastNamePlain;
        	cm.getColumnById('city').renderer = pressed ? renderCity : renderCityPlain;
        	grid.getView().refresh();
        }
	
	//----------------------------------------------------------------
	//------------------------ end toolbar ------------------------
	//----------------------------------------------------------------
												
	
	
	
	
	//============================================
	//================ end grid ====================
	//============================================

	
});


//returns application name (names of first level nodes)
function getAppByNode(node) {

	//root
	if(node.getDepth() == 0) {
		return false;
	}

	//other depths
	curNode = node;
	while(curNode.getDepth() > 1) {
		curNode = curNode.parentNode;
	}

	return new String(curNode.id);
}
	






/*

 	tree.on('click', function(node) {
	
	
 		if(node.isLeaf() == true) {
			var appDataType = 'default';

			if(typeof node.attributes.datatype != "undefined") {
				appDataType = node.attributes.datatype;
			}
			if(currentAppDataType != appDataType) {
				switch(appDataType) {
					case 'phones':
						ds = new Ext.data.JsonStore({
							url: 'jsonrpc.php',
							baseParams: {function:'getData'},
							root: 'results',
							totalProperty: 'totalcount',
							id: 'phone_id',
							fields: [
								{name: 'phone_id'},
								{name: 'macaddress'},
								{name: 'phonemodel'},
								{name: 'phoneswversion'},
								{name: 'phoneipaddress'},
								{name: 'lastmodify'},
								{name: 'class_id'},
								{name: 'description'}
							],
							// turn on remote sorting
							remoteSort: true
						});
			
						ds.setDefaultSort('macaddress', 'desc');

		//define grid appearance
		var ccm = new Ext.grid.ColumnModel([{
			resizable: true,
			id: 'phone_id', // id assigned so we can apply custom css (e.g. .x-grid-col-topic b { color:#333 })
			header: "ID",
			dataIndex: 'phone_id',
			width: 30
		},{
			resizable: true,
			id: 'macaddress',
			header: "macaddress",
			dataIndex: 'macaddress',
			//width: 250,
			//renderer: renderLastNamePlain
		},{
			resizable: true,
			header: 'description',
			dataIndex: 'description',
			//width: 150
		},{
			resizable: true,
			id: 'phonemodel',
			header: 'phonemodel',
			dataIndex: 'phonemodel',
			//width: 250,
			//renderer: renderLastNamePlain,
			hidden: true
		},{
			resizable: true,
			header: 'phoneswversion',
			dataIndex: 'phoneswversion',
			//width: 150
		},{
			resizable: true,
			id: 'phoneipaddress',
			header: 'phoneipaddress',
			dataIndex: 'phoneipaddress',
			//width: 150
			//renderer: renderCityPlain
		},{
			resizable: true,
			header: 'lastmodify',
			dataIndex: 'lastmodify',
			//width: 100
		},{
			resizable: true,
			id: 'class_id',
			header: 'classid',
			dataIndex: 'class_id',
			//width: 450,
			//renderer: renderLastNamePlain,
		}]);
	
		cm.defaultSortable = true; // by default columns are sortable
		
		grid.destroy();
	
	// create the editor grid
	grid = new Ext.grid.Grid('grid', {
		ds: ds,
		cm: cm,
		autoSizeColumns: false,
		selModel: new Ext.grid.RowSelectionModel({multiSelect:true}),
		enableColLock:false,
		//monitorWindowResize: true,
		loadMask: true,
		autoExpandColumn: 'description'
	});

	
	//reacts on doubleclick in line area from grid
	grid.on('rowdblclick', function(gridPar, rowIndexPar, ePar) {
		var record = gridPar.getDataSource().getAt(rowIndexPar);
		//alert('id: ' + record.data.userid);
		try {
			window.open('popup.php?userid='+record.data.userid,'popupname','width=400,height=400,directories=no,toolbar=no,location=no,menubar=no,scrollbars=no,status=no,resizable=no,dependent=no');
		}
		catch(e) {
			//alert(e);
		}
	});
	
	// displays the context menu
 	grid.on('cellcontextmenu', function(gridP, rowIndexP, cellIndexP, eventP) {
 		eventP.stopEvent();
 		ctxMenu.showAt(eventP.getXY());
 	});

	// update the active menu buttons
 	grid.on('rowclick', function(gridP, rowIndexP, eventP) {
		var rowCount = grid.getSelectionModel().getCount();
		if(rowCount < 1) {
			btns.edit.disable();
			btns.delete.disable();
		} else if(rowCount == 1) {
			btns.edit.enable();
			btns.delete.enable();
		} else {
			btns.edit.disable();
			btns.delete.enable();
		}
 	});

	grid.render();				
						break;
				}
			}
			currentAppDataType = appDataType;
//	 		ds.load({params:{start:0, limit:50, nodeid:node.id, application:node.attributes.application, datatype:appDataType}});
// 			grid.getView().refresh();
//			alert(3);
 		}
 	});
 	
 	tree.on('contextmenu', function(node, eventP) {
 		eventP.stopEvent();
 		eval(node.attributes.contextMenuClass).showAt(eventP.getXY());
 	});

*/


