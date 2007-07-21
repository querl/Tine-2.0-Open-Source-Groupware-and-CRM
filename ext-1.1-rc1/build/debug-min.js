/*
 * Ext JS Library 1.1 RC 1
 * Copyright(c) 2006-2007, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://www.extjs.com/license
 */


Ext.debug={init:function(){var CP=Ext.ContentPanel;var bd=Ext.get(document.body);var _3=new Ext.LayoutDialog("x-debug-browser",{autoCreate:true,width:800,height:450,title:"Ext Debug Console &amp; Inspector",proxyDrag:true,shadow:true,center:{alwaysShowTabs:true},constraintoviewport:false});_3.el.swallowEvent("click");var _4=_3.getLayout();_4.beginUpdate();var _5=_4.add("center",new Ext.debug.InnerLayout("x-debug-console",400,{title:"Debug Console"}));var _6=_4.add("center",new Ext.debug.InnerLayout("x-debug-inspector",250,{title:"DOM Inspector"}));var _7=_5.add("east",new CP({autoCreate:{tag:"div",children:[{tag:"div"},{tag:"textarea"}]},fitContainer:true,fitToFrame:true,title:"Script Console",autoScroll:Ext.isGecko,setSize:function(w,h){Ext.ContentPanel.prototype.setSize.call(this,w,h);if(Ext.isGecko&&Ext.isStrict){var s=this.adjustForComponents(w,h);this.resizeEl.setSize(s.width-2,s.height-2);}}}));var _b=_7.el;var _c=_b.child("textarea");_7.resizeEl=_c;var _d=_7.toolbar=new Ext.Toolbar(_b.child("div"));_d.add({text:"Run",handler:function(){var s=_c.dom.value;if(_f.checked){try{var rt=eval(s);Ext.debug.dump(rt===undefined?"(no return)":rt);}catch(e){Ext.debug.log(e.message||e.descript);}}else{var rt=eval(s);Ext.debug.dump(rt===undefined?"(no return)":rt);}}},{text:"Clear",handler:function(){_c.dom.value="";_c.dom.focus();}});var _f=Ext.DomHelper.append(_d.el,{tag:"input",type:"checkbox",checked:"checked"});_f.checked=true;_d.add("-",_f,"Trap Errors");var _11=new Ext.grid.PropertyGrid(bd.createChild(),{nameText:"Style",enableHdMenu:false,enableColumnResize:false});var _12=_6.add("east",new Ext.GridPanel(_11,{title:"(No element selected)"}));_11.render();_11.getView().mainHd.setDisplayed(false);_5.tbar.add({text:"Clear",handler:function(){Ext.debug.console.jsonData=[];Ext.debug.console.refresh();}});var _13=_6.main.getEl();var tb=_6.tbar;var _15,_16;function inspectListener(e,t){if(!_15.contains(e.getPoint())){findNode(t);}}function stopInspecting(e,t){if(!_15.contains(e.getPoint())){_1b.toggle(false);if(findNode(t)!==false){e.stopEvent();}}}function stopInspectingEsc(e,t){if(e.getKey()==e.ESC){_1b.toggle(false);}}var _1b=tb.addButton({text:"Inspect",enableToggle:true,pressed:false,toggleHandler:function(n,_1f){var d=Ext.get(document);if(_1f){d.on("mouseover",inspectListener,window,{buffer:50});d.on("mousedown",stopInspecting);d.on("keydown",stopInspectingEsc);_15=_3.el.getRegion();_16=true;}else{d.un("mouseover",inspectListener);d.un("mousedown",stopInspecting);d.on("keydown",stopInspectingEsc);_16=false;var n=_21.getSelectionModel().getSelectedNode();if(n&&n.htmlNode){onNodeSelect(_21,n,false);}}}});tb.addSeparator();var _22=tb.addButton({text:"Highlight Selection",enableToggle:true,pressed:false,toggleHandler:function(n,_24){var n=_21.getSelectionModel().getSelectedNode();if(n&&n.htmlNode){n[_24?"frame":"unframe"]();}}});tb.addSeparator();var _25=tb.addButton({text:"Refresh Children",disabled:true,handler:function(){var n=_21.getSelectionModel().getSelectedNode();if(n&&n.reload){n.reload();}}});tb.add("-",{text:"Collapse All",handler:function(){_21.root.collapse(true);}});_4.endUpdate();_4.getRegion("center").showPanel(0);_11.on("propertychange",function(s,_28,_29){var _2a=_11.treeNode;if(_2b){_2a.htmlNode.style[_28]=_29;}else{_2a.htmlNode[_28]=_29;}_2a.refresh(true);});var stb=new Ext.Toolbar(_11.view.getHeaderPanel(true));var _2d=stb.addButton({text:"DOM Attributes",menu:{items:[new Ext.menu.CheckItem({id:"dom",text:"DOM Attributes",checked:true,group:"xdb-styles"}),new Ext.menu.CheckItem({id:"styles",text:"CSS Properties",group:"xdb-styles"})]}});_2d.menu.on("click",function(){_2b=_2d.menu.items.get("styles").checked;_2e[_2b?"show":"hide"]();_2d.setText(_2b?"CSS Properties":"DOM Attributes");var n=_21.getSelectionModel().getSelectedNode();if(n){onNodeSelect(_21,n);}});var _30=stb.addButton({text:"Add",disabled:true,handler:function(){Ext.MessageBox.prompt("Add Property","Property Name:",function(btn,v){var _33=_11.store.store;if(btn=="ok"&&v&&!_33.getById(v)){var r=new Ext.grid.PropertyRecord({name:v,value:""},v);_33.add(r);_11.startEditing(_33.getCount()-1,1);}});}});var _2e=stb.addButton({text:"Computed Styles",hidden:true,pressed:false,enableToggle:true,toggleHandler:function(){var n=_21.getSelectionModel().getSelectedNode();if(n){onNodeSelect(_21,n);}}});var _2b=false,_36;var _37=/^\s*$/;var _38=Ext.util.Format.htmlEncode;var _39=Ext.util.Format.ellipsis;var _3a=/\s?([a-z\-]*)\:([^;]*)(?:[;\s\n\r]*)/gi;function findNode(n){if(!n||n.nodeType!=1||n==document.body||n==document){return false;}var pn=[n],p=n;while((p=p.parentNode)&&p.nodeType==1&&p.tagName.toUpperCase()!="HTML"){pn.unshift(p);}var cn=_36;for(var i=0,len=pn.length;i<len;i++){cn.expand();cn=cn.findChild("htmlNode",pn[i]);if(!cn){return false;}}cn.select();var a=cn.ui.anchor;_13.dom.scrollTop=Math.max(0,a.offsetTop-10);cn.highlight();return true;}function nodeTitle(n){var s=n.tagName;if(n.id){s+="#"+n.id;}else{if(n.className){s+="."+n.className;}}return s;}function onNodeSelect(t,n,_46){if(_46&&_46.unframe){_46.unframe();}var _47={};if(n&&n.htmlNode){if(_22.pressed){n.frame();}if(_16){return;}_30.enable();_25.setDisabled(n.leaf);var dom=n.htmlNode;_12.setTitle(nodeTitle(dom));if(_2b&&!_2e.pressed){var s=dom.style?dom.style.cssText:"";if(s){var m;while((m=_3a.exec(s))!=null){_47[m[1].toLowerCase()]=m[2];}}}else{if(_2b){var cl=Ext.debug.cssList;var s=dom.style,fly=Ext.fly(dom);if(s){for(var i=0,len=cl.length;i<len;i++){var st=cl[i];var v=s[st]||fly.getStyle(st);if(v!=undefined&&v!==null&&v!==""){_47[st]=v;}}}}else{for(var a in dom){var v=dom[a];if((isNaN(a+10))&&v!=undefined&&v!==null&&v!==""&&!(Ext.isGecko&&a[0]==a[0].toUpperCase())){_47[a]=v;}}}}}else{if(_16){return;}_30.disable();_25.disabled();}_11.setSource(_47);_11.treeNode=n;_11.view.fitColumns();}var _52="^(?:";var eds=_11.colModel.editors;for(var _54 in eds){_52+=eds[_54].id+"|";}Ext.each([_3.shim?_3.shim.id:"noshim",_3.proxyDrag.id],function(id){_52+=id+"|";});_52+=_3.el.id;_52+=")$";var _56=new RegExp(_52);var _57=new Ext.tree.TreeLoader();_57.load=function(n,cb){var _5a=n.htmlNode==bd.dom;var cn=n.htmlNode.childNodes;for(var i=0,c;c=cn[i];i++){if(_5a&&_56.test(c.id)){continue;}if(c.nodeType==1){n.appendChild(new Ext.debug.HtmlNode(c));}else{if(c.nodeType==3&&!_37.test(c.nodeValue)){n.appendChild(new Ext.tree.TreeNode({text:"<em>"+_39(_38(String(c.nodeValue)),35)+"</em>",cls:"x-tree-noicon"}));}}}cb();};var _21=new Ext.tree.TreePanel(_13,{enableDD:false,loader:_57,lines:false,rootVisible:false,animate:false,hlColor:"ffff9c"});_21.getSelectionModel().on("selectionchange",onNodeSelect,null,{buffer:250});var _5e=_21.setRootNode(new Ext.tree.TreeNode("Ext"));_36=_5e.appendChild(new Ext.debug.HtmlNode(document.getElementsByTagName("html")[0]));_21.render();Ext.debug.console=new Ext.JsonView(_5.main.getEl(),"<pre><xmp>> {msg}</xmp></pre>");Ext.debug.console.jsonData=[];Ext.debug.dialog=_3;},show:function(){var d=Ext.debug;if(!d.dialog){d.init();}if(!d.dialog.isVisible()){d.dialog.show();}},hide:function(){if(Ext.debug.dialog){Ext.debug.dialog.hide();}},log:function(_60,_61,etc){Ext.debug.show();var m="";for(var i=0,len=arguments.length;i<len;i++){m+=(i==0?"":", ")+arguments[i];}var cn=Ext.debug.console;cn.jsonData.unshift({msg:m});cn.refresh();},logf:function(_67,_68,_69,etc){Ext.debug.log(String.format.apply(String,arguments));},dump:function(o){if(typeof o=="string"||typeof o=="number"||typeof o=="undefined"||o instanceof Date){Ext.debug.log(o);}else{if(!o){Ext.debug.log("null");}else{if(typeof o!="object"){Ext.debug.log("Unknown return type");}else{if(o instanceof Array){Ext.debug.log("["+o.join(",")+"]");}else{var b=["{\n"];for(var key in o){var to=typeof o[key];if(to!="function"&&to!="object"){b.push(String.format("  {0}: {1},\n",key,o[key]));}}var s=b.join("");if(s.length>3){s=s.substr(0,s.length-2);}Ext.debug.log(s+"\n}");}}}}},_timers:{},time:function(_70){_70=_70||"def";Ext.debug._timers[_70]=new Date().getTime();},timeEnd:function(_71,_72){var t=new Date().getTime();_71=_71||"def";var v=String.format("{0} ms",t-Ext.debug._timers[_71]);Ext.debug._timers[_71]=new Date().getTime();if(_72!==false){Ext.debug.log("Timer "+(_71=="def"?v:_71+": "+v));}return v;}};Ext.debug.HtmlNode=function(){var _75=Ext.util.Format.htmlEncode;var _76=Ext.util.Format.ellipsis;var _77=/^\s*$/;var _78=[{n:"id",v:"id"},{n:"className",v:"class"},{n:"name",v:"name"},{n:"type",v:"type"},{n:"src",v:"src"},{n:"href",v:"href"}];function hasChild(n){for(var i=0,c;c=n.childNodes[i];i++){if(c.nodeType==1){return true;}}return false;}function renderNode(n,_7d){var tag=n.tagName.toLowerCase();var s="&lt;"+tag;for(var i=0,len=_78.length;i<len;i++){var a=_78[i];var v=n[a.n];if(v&&!_77.test(v)){s+=" "+a.v+"=&quot;<i>"+_75(v)+"</i>&quot;";}}var _84=n.style?n.style.cssText:"";if(_84){s+=" style=&quot;<i>"+_75(_84.toLowerCase())+"</i>&quot;";}if(_7d&&n.childNodes.length>0){s+="&gt;<em>"+_76(_75(String(n.innerHTML)),35)+"</em>&lt;/"+tag+"&gt;";}else{if(_7d){s+=" /&gt;";}else{s+="&gt;";}}return s;}var _85=function(n){var _87=!hasChild(n);this.htmlNode=n;this.tagName=n.tagName.toLowerCase();var _88={text:renderNode(n,_87),leaf:_87,cls:"x-tree-noicon"};_85.superclass.constructor.call(this,_88);this.attributes.htmlNode=n;if(!_87){this.on("expand",this.onExpand,this);this.on("collapse",this.onCollapse,this);}};Ext.extend(_85,Ext.tree.AsyncTreeNode,{cls:"x-tree-noicon",preventHScroll:true,refresh:function(_89){var _8a=!hasChild(this.htmlNode);this.setText(renderNode(this.htmlNode,_8a));if(_89){Ext.fly(this.ui.textNode).highlight();}},onExpand:function(){if(!this.closeNode&&this.parentNode){this.closeNode=this.parentNode.insertBefore(new Ext.tree.TreeNode({text:"&lt;/"+this.tagName+"&gt;",cls:"x-tree-noicon"}),this.nextSibling);}else{if(this.closeNode){this.closeNode.ui.show();}}},onCollapse:function(){if(this.closeNode){this.closeNode.ui.hide();}},render:function(_8b){_85.superclass.render.call(this,_8b);},highlightNode:function(){},highlight:function(){},frame:function(){this.htmlNode.style.border="1px solid #0000ff";},unframe:function(){this.htmlNode.style.border="";}});return _85;}();Ext.debug.InnerLayout=function(id,w,cfg){var el=Ext.DomHelper.append(document.body,{id:id});var _90=new Ext.BorderLayout(el,{north:{initialSize:28},center:{titlebar:false},east:{split:true,initialSize:w,titlebar:true}});Ext.debug.InnerLayout.superclass.constructor.call(this,_90,cfg);_90.beginUpdate();var _91=_90.add("north",new Ext.ContentPanel({autoCreate:true,fitToFrame:true}));this.main=_90.add("center",new Ext.ContentPanel({autoCreate:true,fitToFrame:true,autoScroll:true}));this.tbar=new Ext.Toolbar(_91.el);var _92=_91.resizeEl=_91.el.child("div.x-toolbar");_92.setStyle("border-bottom","0 none");_90.endUpdate(true);};Ext.extend(Ext.debug.InnerLayout,Ext.NestedLayoutPanel,{add:function(){return this.layout.add.apply(this.layout,arguments);}});Ext.debug.cssList=["background-color","border","border-color","border-spacing","border-style","border-top","border-right","border-bottom","border-left","border-top-color","border-right-color","border-bottom-color","border-left-color","border-top-width","border-right-width","border-bottom-width","border-left-width","border-width","bottom","color","font-size","font-size-adjust","font-stretch","font-style","height","left","letter-spacing","line-height","margin","margin-top","margin-right","margin-bottom","margin-left","marker-offset","max-height","max-width","min-height","min-width","orphans","outline","outline-color","outline-style","outline-width","overflow","padding","padding-top","padding-right","padding-bottom","padding-left","quotes","right","size","text-indent","top","width","word-spacing","z-index","opacity","outline-offset"];if(typeof console=="undefined"){console=Ext.debug;}Ext.EventManager.on(window,"load",function(){Ext.get(document).on("keydown",function(e){if(e.ctrlKey&&e.shiftKey&&e.getKey()==e.HOME){Ext.debug.show();}});});Ext.print=Ext.log=Ext.debug.log;Ext.printf=Ext.logf=Ext.debug.logf;Ext.dump=Ext.debug.dump;Ext.timer=Ext.debug.time;Ext.timerEnd=Ext.debug.timeEnd;