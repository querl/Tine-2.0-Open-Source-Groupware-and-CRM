/**
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Philipp Schuele <p.schuele@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id$
 *
 * @todo add timezone translation
 */

Ext.namespace('Tine.widgets');

/**
 * timezone chooser widget
 */
Tine.widgets.TimezoneChooser = Ext.extend(Ext.form.ComboBox, {
    
    /**
     * @cfg {Sring}
     */
    fieldLabel: null,
    
    displayField: 'timezoneTranslation',
    valueField: 'timezone',
    triggerAction: 'all',
    width: 100,
    listWidth: 250,
    editable: false,
    //typeAhead: true,
    
    initComponent: function() {
        this.value = Tine.Tinebase.Registry.get('timeZone');
        this.fieldLabel = this.fieldLabel ? this.fieldLabel : _('Timezone');

        this.tpl = new Ext.XTemplate(
            '<tpl for=".">' +
                '<div class="x-combo-list-item">' +
                    '{[this.translate(values.timezone, values.timezoneTranslation)]}' + 
                '</div>' +
            '</tpl>',{
                translate: function(timezone, timezoneTranslation) {
                    // use timezoneTranslation as fallback
                	translation = (Locale.getTranslationData('CityToTimezone', timezone)) 
                	   ? Locale.getTranslationData('CityToTimezone', timezone)
                	   : timezoneTranslation;                	
                    return timezone + (translation ? (' - <i>(' + translation + ')</i>') : '');
                }
            }
        );
        
        this.store = new Ext.data.JsonStore({
            id: 'timezone',
            root: 'results',
            totalProperty: 'totalcount',
            fields: Tine.Tinebase.Model.Timezone,
            baseParams: {
                method: 'Tinebase.getAvailableTimezones'
            }
        });
        Tine.widgets.TimezoneChooser.superclass.initComponent.call(this);
        
        this.on('select', this.onTimezoneSelect, this);
    },
    
    /**
     * timezone selection ajax call
     */
    onTimezoneSelect: function(combo, record, idx) {
        var currentTimezone = Tine.Tinebase.Registry.get('timeZone');
        var newTimezone = record.get('timezone');
        
        if (newTimezone != currentTimezone) {
            Ext.MessageBox.wait(_('setting new timezone...'), _('Please Wait'));
            
            Ext.Ajax.request({
                scope: this,
                params: {
                    method: 'Tinebase.setTimezone',
                    timezoneString: newTimezone,
                    saveaspreference: true
                },
                success: function(result, request){
                    var responseData = Ext.util.JSON.decode(result.responseText);
                    window.location = window.location;
                }
            });
        }
    }
});
