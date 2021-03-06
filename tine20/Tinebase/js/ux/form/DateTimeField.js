/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */

/*global Ext*/

Ext.ns('Ext.ux', 'Ext.ux.form');

/**
 * A combination of datefield and timefield
 * 
 * @namespace   Ext.ux.form
 * @class       Ext.ux.form.DateTimeField
 * @extends     Ext.form.Field
 */
Ext.ux.form.DateTimeField = Ext.extend(Ext.form.Field, {
    autoEl: 'div',
    value: '',
    increment: 15,
    timeEditable: true,
    markedInvalid: false,
    
    initComponent: function () {
        Ext.ux.form.DateTimeField.superclass.initComponent.call(this);
        this.lastValues = [];
        
    },
    
    clearInvalid: function () {
    	this.markedInvalid = false;
    	
        if (this.dateField) {
            this.dateField.clearInvalid();
        }
        if (this.timeField) {
            this.timeField.clearInvalid();
        }
    },
    
    clearTime: function () {
        var dateTime = this.getValue();
        if (Ext.isDate(dateTime)) {
            this.setValue(this.getValue().clearTime(true));
        } else {
            this.timeField.setValue(new Date().clearTime());
        }
    },
    
    combineDateTime: function (date, time) {
        date = Ext.isDate(date) ? date : new Date.clearTime();
        
        if (Ext.isDate(time)) {
            date = date.clone();
            date.clearTime();
            date = date.add(Date.HOUR, time.getHours());
            date = date.add(Date.MINUTE, time.getMinutes());
        }
        
        return date;
    },
    
    getName: function () {
        return this.name;
    },
    
    getValue: function () {
        if (! this.dateField) {
            return this.value;
        }
        
        var date = this.dateField.getValue();
        // this is odd, why doesn't Ext.form.TimeField a Date datatype?
        var time = Date.parseDate(this.timeField.getValue(), this.timeField.format);
        
        if (Ext.isDate(date)) {
            date = this.combineDateTime(date, time);
        }
        
        return date;
    },
    
    markInvalid: function (msg) {
    	this.markedInvalid = true;
    	
        this.dateField.markInvalid(msg);
        this.timeField.markInvalid(msg);
    },
    
    onRender: function (ct, position) {
        //Ext.ux.form.DateTimeField.superclass.onRender.call(this, ct, position);
        this.el = document.createElement(this.autoEl);
        this.el.id = this.getId();
        this.el = Ext.get(this.el);
        ct.dom.insertBefore(this.el.dom, position);
        this.el.applyStyles('overflow:visible;');
        
        this.dateField = new Ext.form.DateField({
            lazyRender: false,
            renderTo: this.el,
            readOnly: this.readOnly,
            hideTrigger: this.hideTrigger,
            disabled: this.disabled,
            tabIndex: this.tabIndex === -1 ? this.tabIndex : false,
            allowBlank: this.allowBlank,
            value: this.value,
            listeners: {
                scope: this,
                change: this.onDateChange,
                select: this.onDateChange
            }
        });
        
        this.timeField = new Ext.form.TimeField({
            lazyRender: false,
            increment: this.increment,
            renderTo: this.el,
            readOnly: this.readOnly,
            hideTrigger: this.hideTrigger,
            disabled: this.disabled,
            editable: this.timeEditable,
            tabIndex: this.tabIndex === -1 ? this.tabIndex : false,
            allowBlank: this.allowBlank,
            value: this.value,
            listeners: {
                scope: this,
                change: this.onTimeChange,
                select: this.onTimeChange
            }
        });
        
    },
    
    onDateChange: function () {
        var newValue = this.getValue();
        this.setValue(newValue);
        this.fireEvent('change', this, newValue, this.lastValues.length > 1 ? this.lastValues[this.lastValues.length - 2] : '');
    },
    
    onResize: function (w, h) {
        Ext.ux.form.DateTimeField.superclass.onResize.apply(this, arguments);
        
        // needed for readonly
        this.el.setHeight(16);
        
        this.el.setStyle({'position': 'relative'});
        
        this.dateField.wrap.setStyle({'position': 'absolute'});
        var dateFieldWidth = Math.abs(w * 0.55 - 5);
        this.dateField.setWidth(dateFieldWidth);
        this.dateField.wrap.setWidth(dateFieldWidth);
        
        this.timeField.wrap.setStyle({'position': 'absolute'});
        var timeFieldWidth = Math.abs(w * 0.45);
        this.timeField.setWidth(timeFieldWidth);
        this.timeField.wrap.setWidth(timeFieldWidth);
        this.timeField.wrap.setLeft(dateFieldWidth + 5);
    },
    
    onTimeChange: function () {
        var newValue = this.getValue();
        this.setValue(newValue);
        this.fireEvent('change', this, newValue, this.lastValues.length > 1 ? this.lastValues[this.lastValues.length - 2] : '');
    },
    
    setDisabled: function (bool, what) {
        if (what !== 'time' && this.dateField) {
            this.dateField.setDisabled(bool);
        }
        
        if (what !== 'date' && this.timeField) {
            this.timeField.setDisabled(bool);
        }
    },
    
    setRawValue: Ext.EmptyFn,
    
    setValue: function (value, skipHistory) {
        if (! skipHistory) {
            this.lastValues.push(value);
        }
        
        if (this.dateField && this.timeField) {
            this.dateField.setValue(value);
            this.timeField.setValue(value);
        }
        
        this.value = value;
    },
    
    undo: function () {
        if (this.lastValues.length > 1) {
            this.lastValues.pop();
            this.setValue(this.lastValues[this.lastValues.length - 1], true);
        } else {
            this.reset();
        }
    },
    
    isValid: function (preventMark) {
		return this.dateField.isValid(preventMark) && this.timeField.isValid(preventMark) && ! this.markedInvalid;
    }
});
Ext.reg('datetimefield', Ext.ux.form.DateTimeField);
