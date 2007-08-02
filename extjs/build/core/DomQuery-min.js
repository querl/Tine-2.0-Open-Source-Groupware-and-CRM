/*
 * Ext JS Library 1.1
 * Copyright(c) 2006-2007, Ext JS, LLC.
 * licensing@extjs.com
 * 
 * http://www.extjs.com/license
 */


Ext.DomQuery=function(){var _1={},_2={},_3={};var _4=/\S/;var _5=/^\s+|\s+$/g;var _6=/\{(\d+)\}/g;var _7=/^(\s?[\/>+~]\s?|\s|$)/;var _8=/^(#)?([\w-\*]+)/;var _9=/(\d*)n\+?(\d*)/,_a=/\D/;function child(p,_c){var i=0;var n=p.firstChild;while(n){if(n.nodeType==1){if(++i==_c){return n;}}n=n.nextSibling;}return null;}function next(n){while((n=n.nextSibling)&&n.nodeType!=1){}return n;}function prev(n){while((n=n.previousSibling)&&n.nodeType!=1){}return n;}function children(d){var n=d.firstChild,ni=-1;while(n){var nx=n.nextSibling;if(n.nodeType==3&&!_4.test(n.nodeValue)){d.removeChild(n);}else{n.nodeIndex=++ni;}n=nx;}return this;}function byClassName(c,a,v){if(!v){return c;}var r=[],ri=-1,cn;for(var i=0,ci;ci=c[i];i++){if((" "+ci.className+" ").indexOf(v)!=-1){r[++ri]=ci;}}return r;}function attrValue(n,_1e){if(!n.tagName&&typeof n.length!="undefined"){n=n[0];}if(!n){return null;}if(_1e=="for"){return n.htmlFor;}if(_1e=="class"||_1e=="className"){return n.className;}return n.getAttribute(_1e)||n[_1e];}function getNodes(ns,_20,_21){var _22=[],ri=-1,cs;if(!ns){return _22;}_21=_21||"*";if(typeof ns.getElementsByTagName!="undefined"){ns=[ns];}if(!_20){for(var i=0,ni;ni=ns[i];i++){cs=ni.getElementsByTagName(_21);for(var j=0,ci;ci=cs[j];j++){_22[++ri]=ci;}}}else{if(_20=="/"||_20==">"){var _29=_21.toUpperCase();for(var i=0,ni,cn;ni=ns[i];i++){cn=ni.children||ni.childNodes;for(var j=0,cj;cj=cn[j];j++){if(cj.nodeName==_29||cj.nodeName==_21||_21=="*"){_22[++ri]=cj;}}}}else{if(_20=="+"){var _29=_21.toUpperCase();for(var i=0,n;n=ns[i];i++){while((n=n.nextSibling)&&n.nodeType!=1){}if(n&&(n.nodeName==_29||n.nodeName==_21||_21=="*")){_22[++ri]=n;}}}else{if(_20=="~"){for(var i=0,n;n=ns[i];i++){while((n=n.nextSibling)&&(n.nodeType!=1||(_21=="*"||n.tagName.toLowerCase()!=_21))){}if(n){_22[++ri]=n;}}}}}}return _22;}function concat(a,b){if(b.slice){return a.concat(b);}for(var i=0,l=b.length;i<l;i++){a[a.length]=b[i];}return a;}function byTag(cs,_32){if(cs.tagName||cs==document){cs=[cs];}if(!_32){return cs;}var r=[],ri=-1;_32=_32.toLowerCase();for(var i=0,ci;ci=cs[i];i++){if(ci.nodeType==1&&ci.tagName.toLowerCase()==_32){r[++ri]=ci;}}return r;}function byId(cs,_38,id){if(cs.tagName||cs==document){cs=[cs];}if(!id){return cs;}var r=[],ri=-1;for(var i=0,ci;ci=cs[i];i++){if(ci&&ci.id==id){r[++ri]=ci;return r;}}return r;}function byAttribute(cs,_3f,_40,op,_42){var r=[],ri=-1,st=_42=="{";var f=Ext.DomQuery.operators[op];for(var i=0,ci;ci=cs[i];i++){var a;if(st){a=Ext.DomQuery.getStyle(ci,_3f);}else{if(_3f=="class"||_3f=="className"){a=ci.className;}else{if(_3f=="for"){a=ci.htmlFor;}else{if(_3f=="href"){a=ci.getAttribute("href",2);}else{a=ci.getAttribute(_3f);}}}}if((f&&f(a,_40))||(!f&&a)){r[++ri]=ci;}}return r;}function byPseudo(cs,_4b,_4c){return Ext.DomQuery.pseudos[_4b](cs,_4c);}var _4d=window.ActiveXObject?true:false;eval("var batch = 30803;");var key=30803;function nodupIEXml(cs){var d=++key;cs[0].setAttribute("_nodup",d);var r=[cs[0]];for(var i=1,len=cs.length;i<len;i++){var c=cs[i];if(!c.getAttribute("_nodup")!=d){c.setAttribute("_nodup",d);r[r.length]=c;}}for(var i=0,len=cs.length;i<len;i++){cs[i].removeAttribute("_nodup");}return r;}function nodup(cs){if(!cs){return[];}var len=cs.length,c,i,r=cs,cj,ri=-1;if(!len||typeof cs.nodeType!="undefined"||len==1){return cs;}if(_4d&&typeof cs[0].selectSingleNode!="undefined"){return nodupIEXml(cs);}var d=++key;cs[0]._nodup=d;for(i=1;c=cs[i];i++){if(c._nodup!=d){c._nodup=d;}else{r=[];for(var j=0;j<i;j++){r[++ri]=cs[j];}for(j=i+1;cj=cs[j];j++){if(cj._nodup!=d){cj._nodup=d;r[++ri]=cj;}}return r;}}return r;}function quickDiffIEXml(c1,c2){var d=++key;for(var i=0,len=c1.length;i<len;i++){c1[i].setAttribute("_qdiff",d);}var r=[];for(var i=0,len=c2.length;i<len;i++){if(c2[i].getAttribute("_qdiff")!=d){r[r.length]=c2[i];}}for(var i=0,len=c1.length;i<len;i++){c1[i].removeAttribute("_qdiff");}return r;}function quickDiff(c1,c2){var _66=c1.length;if(!_66){return c2;}if(_4d&&c1[0].selectSingleNode){return quickDiffIEXml(c1,c2);}var d=++key;for(var i=0;i<_66;i++){c1[i]._qdiff=d;}var r=[];for(var i=0,len=c2.length;i<len;i++){if(c2[i]._qdiff!=d){r[r.length]=c2[i];}}return r;}function quickId(ns,_6c,_6d,id){if(ns==_6d){var d=_6d.ownerDocument||_6d;return d.getElementById(id);}ns=getNodes(ns,_6c,"*");return byId(ns,null,id);}return{getStyle:function(el,_71){return Ext.fly(el).getStyle(_71);},compile:function(_72,_73){_73=_73||"select";var fn=["var f = function(root){\n var mode; ++batch; var n = root || document;\n"];var q=_72,_76,lq;var tk=Ext.DomQuery.matchers;var _79=tk.length;var mm;var _7b=q.match(_7);if(_7b&&_7b[1]){fn[fn.length]="mode=\""+_7b[1].replace(_5,"")+"\";";q=q.replace(_7b[1],"");}while(_72.substr(0,1)=="/"){_72=_72.substr(1);}while(q&&lq!=q){lq=q;var tm=q.match(_8);if(_73=="select"){if(tm){if(tm[1]=="#"){fn[fn.length]="n = quickId(n, mode, root, \""+tm[2]+"\");";}else{fn[fn.length]="n = getNodes(n, mode, \""+tm[2]+"\");";}q=q.replace(tm[0],"");}else{if(q.substr(0,1)!="@"){fn[fn.length]="n = getNodes(n, mode, \"*\");";}}}else{if(tm){if(tm[1]=="#"){fn[fn.length]="n = byId(n, null, \""+tm[2]+"\");";}else{fn[fn.length]="n = byTag(n, \""+tm[2]+"\");";}q=q.replace(tm[0],"");}}while(!(mm=q.match(_7))){var _7d=false;for(var j=0;j<_79;j++){var t=tk[j];var m=q.match(t.re);if(m){fn[fn.length]=t.select.replace(_6,function(x,i){return m[i];});q=q.replace(m[0],"");_7d=true;break;}}if(!_7d){throw"Error parsing selector, parsing failed at \""+q+"\"";}}if(mm[1]){fn[fn.length]="mode=\""+mm[1].replace(_5,"")+"\";";q=q.replace(mm[1],"");}}fn[fn.length]="return nodup(n);\n}";eval(fn.join(""));return f;},select:function(_83,_84,_85){if(!_84||_84==document){_84=document;}if(typeof _84=="string"){_84=document.getElementById(_84);}var _86=_83.split(",");var _87=[];for(var i=0,len=_86.length;i<len;i++){var p=_86[i].replace(_5,"");if(!_1[p]){_1[p]=Ext.DomQuery.compile(p);if(!_1[p]){throw p+" is not a valid selector";}}var _8b=_1[p](_84);if(_8b&&_8b!=document){_87=_87.concat(_8b);}}if(_86.length>1){return nodup(_87);}return _87;},selectNode:function(_8c,_8d){return Ext.DomQuery.select(_8c,_8d)[0];},selectValue:function(_8e,_8f,_90){_8e=_8e.replace(_5,"");if(!_3[_8e]){_3[_8e]=Ext.DomQuery.compile(_8e,"select");}var n=_3[_8e](_8f);n=n[0]?n[0]:n;var v=(n&&n.firstChild?n.firstChild.nodeValue:null);return((v===null||v===undefined||v==="")?_90:v);},selectNumber:function(_93,_94,_95){var v=Ext.DomQuery.selectValue(_93,_94,_95||0);return parseFloat(v);},is:function(el,ss){if(typeof el=="string"){el=document.getElementById(el);}var _99=(el instanceof Array);var _9a=Ext.DomQuery.filter(_99?el:[el],ss);return _99?(_9a.length==el.length):(_9a.length>0);},filter:function(els,ss,_9d){ss=ss.replace(_5,"");if(!_2[ss]){_2[ss]=Ext.DomQuery.compile(ss,"simple");}var _9e=_2[ss](els);return _9d?quickDiff(_9e,els):_9e;},matchers:[{re:/^\.([\w-]+)/,select:"n = byClassName(n, null, \" {1} \");"},{re:/^\:([\w-]+)(?:\(((?:[^\s>\/]*|.*?))\))?/,select:"n = byPseudo(n, \"{1}\", \"{2}\");"},{re:/^(?:([\[\{])(?:@)?([\w-]+)\s?(?:(=|.=)\s?['"]?(.*?)["']?)?[\]\}])/,select:"n = byAttribute(n, \"{2}\", \"{4}\", \"{3}\", \"{1}\");"},{re:/^#([\w-]+)/,select:"n = byId(n, null, \"{1}\");"},{re:/^@([\w-]+)/,select:"return {firstChild:{nodeValue:attrValue(n, \"{1}\")}};"}],operators:{"=":function(a,v){return a==v;},"!=":function(a,v){return a!=v;},"^=":function(a,v){return a&&a.substr(0,v.length)==v;},"$=":function(a,v){return a&&a.substr(a.length-v.length)==v;},"*=":function(a,v){return a&&a.indexOf(v)!==-1;},"%=":function(a,v){return(a%v)==0;},"|=":function(a,v){return a&&(a==v||a.substr(0,v.length+1)==v+"-");},"~=":function(a,v){return a&&(" "+a+" ").indexOf(" "+v+" ")!=-1;}},pseudos:{"first-child":function(c){var r=[],ri=-1,n;for(var i=0,ci;ci=n=c[i];i++){while((n=n.previousSibling)&&n.nodeType!=1){}if(!n){r[++ri]=ci;}}return r;},"last-child":function(c){var r=[],ri=-1,n;for(var i=0,ci;ci=n=c[i];i++){while((n=n.nextSibling)&&n.nodeType!=1){}if(!n){r[++ri]=ci;}}return r;},"nth-child":function(c,a){var r=[],ri=-1;var m=_9.exec(a=="even"&&"2n"||a=="odd"&&"2n+1"||!_a.test(a)&&"n+"+a||a);var f=(m[1]||1)-0,l=m[2]-0;for(var i=0,n;n=c[i];i++){var pn=n.parentNode;if(batch!=pn._batch){var j=0;for(var cn=pn.firstChild;cn;cn=cn.nextSibling){if(cn.nodeType==1){cn.nodeIndex=++j;}}pn._batch=batch;}if(f==1){if(l==0||n.nodeIndex==l){r[++ri]=n;}}else{if((n.nodeIndex+l)%f==0){r[++ri]=n;}}}return r;},"only-child":function(c){var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){if(!prev(ci)&&!next(ci)){r[++ri]=ci;}}return r;},"empty":function(c){var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){var cns=ci.childNodes,j=0,cn,_d4=true;while(cn=cns[j]){++j;if(cn.nodeType==1||cn.nodeType==3){_d4=false;break;}}if(_d4){r[++ri]=ci;}}return r;},"contains":function(c,v){var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){if((ci.textContent||ci.innerText||"").indexOf(v)!=-1){r[++ri]=ci;}}return r;},"nodeValue":function(c,v){var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){if(ci.firstChild&&ci.firstChild.nodeValue==v){r[++ri]=ci;}}return r;},"checked":function(c){var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){if(ci.checked==true){r[++ri]=ci;}}return r;},"not":function(c,ss){return Ext.DomQuery.filter(c,ss,true);},"odd":function(c){return this["nth-child"](c,"odd");},"even":function(c){return this["nth-child"](c,"even");},"nth":function(c,a){return c[a-1]||[];},"first":function(c){return c[0]||[];},"last":function(c){return c[c.length-1]||[];},"has":function(c,ss){var s=Ext.DomQuery.select;var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){if(s(ss,ci).length>0){r[++ri]=ci;}}return r;},"next":function(c,ss){var is=Ext.DomQuery.is;var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){var n=next(ci);if(n&&is(n,ss)){r[++ri]=ci;}}return r;},"prev":function(c,ss){var is=Ext.DomQuery.is;var r=[],ri=-1;for(var i=0,ci;ci=c[i];i++){var n=prev(ci);if(n&&is(n,ss)){r[++ri]=ci;}}return r;}}};}();Ext.query=Ext.DomQuery.select;