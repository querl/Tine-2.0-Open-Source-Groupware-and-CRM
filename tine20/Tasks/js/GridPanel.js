/*
 * Tine 2.0
 * 
 * @package     Tasks
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.namespace('Tine.Tasks');

/**
 * Tasks grid panel
 * 
 * @namespace   Tine.Tasks
 * @class       Tine.Tasks.GridPanel
 * @extends     Tine.widgets.grid.GridPanel
 * 
 * <p>Tasks Grid Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Tasks.GridPanel
 */
Tine.Tasks.GridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    /**
     * record class
     * @cfg {Tine.Tasks.Task} recordClass
     */
    recordClass: Tine.Tasks.Task,
    
    /**
     * @private grid cfg
     */
    defaultSortInfo: {field: 'due', dir: 'ASC'},
    gridConfig: {
        clicksToEdit: 'auto',
        quickaddMandatory: 'summary',
        autoExpandColumn: 'summary',
        // drag n drop
        enableDragDrop: true,
        ddGroup: 'containerDDGroup'
    },
    
    // specialised translations
    // ngettext('Do you really want to delete the selected task?', 'Do you really want to delete the selected tasks?', n);
    i18nDeleteQuestion: ['Do you really want to delete the selected task?', 'Do you really want to delete the selected tasks?'],
    
    /**
     * @private
     */
    initComponent: function() {
        this.recordProxy = Tine.Tasks.JsonBackend;
        
        //this.actionToolbarItems = this.getToolbarItems();
        this.gridConfig.cm = this.getColumnModel();
        this.initFilterToolbar();
        
        this.plugins = this.plugins || [];
        this.plugins.push(/*this.action_showClosedToggle,*/ this.filterToolbar);
        
        Tine.Tasks.GridPanel.superclass.initComponent.call(this);
        
        // the editGrids onEditComplete calls the focusCell after a edit operation
        // this leads to a 'flicker' effect we dont want!
        // mhh! but disabling this, breaks keynav 
        //this.grid.view.focusCell = Ext.emptyFn;
    },
    
    /**
     * initialises filter toolbar
     * @private
     */
    initFilterToolbar: function() {
        this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            recordClass: this.recordClass,
            filterModels: Tine.Tasks.Task.getFilterModel(),
            defaultFilter: 'query',
            filters: [
                {field: 'status_id', operator: 'notin', value: Tine.Tasks.status.getClosedStatus()},
                {field: 'container_id', operator: 'equals', value: {path: Tine.Tinebase.container.getMyNodePath()}}
            ],
            plugins: [
                new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()
            ]
        });
    },
    
    /**
     * returns cm
     * @return Ext.grid.ColumnModel
     * @private
     */
    getColumnModel: function(){
        return new Ext.grid.ColumnModel({
        defaults: {
            sortable: true,
            resizable: true
        },
        columns: [
        {   id: 'tags', header: this.app.i18n._('Tags'), width: 40,  dataIndex: 'tags', sortable: false, renderer: Tine.Tinebase.common.tagsRenderer },
        {   id: 'lead_name', header: this.app.i18n._('Lead'), dataIndex: 'relations', width: 175, sortable: false, hidden: true, renderer: this.leadRenderer },
        {
            id: 'summary',
            header: this.app.i18n._("Summary"),
            width: 400,
            dataIndex: 'summary',
            quickaddField: new Ext.form.TextField({
                emptyText: this.app.i18n._('Add a task...')
            })
        }, {
            id: 'due',
            header: this.app.i18n._("Due Date"),
            width: 60,
            dataIndex: 'due',
            renderer: Tine.Tinebase.common.dateRenderer,
            editor: new Ext.ux.form.ClearableDateField({}),
            quickaddField: new Ext.ux.form.ClearableDateField({})
        }, {
            id: 'priority',
            header: this.app.i18n._("Priority"),
            width: 45,
            dataIndex: 'priority',
            renderer: Tine.widgets.Priority.renderer,
            editor: new Tine.widgets.Priority.Combo({
                allowBlank: false,
                autoExpand: true,
                blurOnSelect: true
            }),
            quickaddField: new Tine.widgets.Priority.Combo({
                autoExpand: true
            })
        }, {
            id: 'percent',
            header: this.app.i18n._("Percent"),
            width: 50,
            dataIndex: 'percent',
            renderer: Ext.ux.PercentRenderer,
            editor: new Ext.ux.PercentCombo({
                autoExpand: true,
                blurOnSelect: true
            }),
            quickaddField: new Ext.ux.PercentCombo({
                autoExpand: true
            })
        }, {
            id: 'status_id',
            header: this.app.i18n._("Status"),
            width: 45,
            dataIndex: 'status_id',
            renderer: Tine.Tasks.status.getStatusIcon,
            editor: new Tine.Tasks.status.ComboBox({
                autoExpand: true,
                blurOnSelect: true,
                listClass: 'x-combo-list-small'
            }),
            quickaddField: new Tine.Tasks.status.ComboBox({
                autoExpand: true
            })
        }, {
            id: 'creation_time',
            header: this.app.i18n._("Creation Time"),
            hidden: true,
            width: 90,
            dataIndex: 'creation_time',
            renderer: Tine.Tinebase.common.dateTimeRenderer
        }, {
            id: 'completed',
            header: this.app.i18n._("Completed"),
            hidden: true,
            width: 90,
            dataIndex: 'completed',
            renderer: Tine.Tinebase.common.dateTimeRenderer
        }, {
            id: 'organizer',
            header: this.app.i18n._('Responsible'),
            width: 150,
            dataIndex: 'organizer',
            renderer: Tine.Tinebase.common.accountRenderer,
            quickaddField: new Tine.Addressbook.SearchCombo({
                // at the moment we support accounts only
                userOnly: true,
                nameField: 'n_fileas',
                blurOnSelect: true,
                selectOnFocus: true,
                value: Tine.Tinebase.registry.get('currentAccount').accountDisplayName,
                selectedRecord: new Tine.Addressbook.Model.Contact(Tine.Tinebase.registry.get('userContact')),
                getValue: function() {
                    if (this.selectedRecord) {
                        return this.selectedRecord.get('account_id');
                    }
                }
            })
        }]
        });
    },
    
    /**
     * return lead name for first linked Crm_Model_Lead
     * 
     * @param {Object} data
     * @return {String} lead name
     */
    leadRenderer: function(data) {    
    
        if( Ext.isArray(data) && data.length > 0) {
            var index = 0;
            // get correct relation type from data (contact) array and show first matching record (org_name + n_fileas)
            while (index < data.length && data[index].related_model != 'Crm_Model_Lead') {
                index++;
            }
            if (data[index]) {
                var name = (data[index].related_record.lead_name !== null ) ? data[index].related_record.lead_name : '';
                return Ext.util.Format.htmlEncode(name);
            }
        }
    },    

    /**
     * return additional tb items
     * @private
     */
    getToolbarItems: function(){
        this.action_showClosedToggle = new Tine.widgets.grid.FilterButton({
            text: this.app.i18n._('Show closed'),
            iconCls: 'action_showArchived',
            field: 'showClosed'
        });
        
        return [
            new Ext.Toolbar.Separator(),
            this.action_showClosedToggle
        ];
    },
    
    /**
     * Return CSS class to apply to rows depending upon due status
     * 
     * @param {Tine.Tasks.Task} record
     * @param {Integer} index
     * @return {String}
     */
    getViewRowClass: function(record, index) {
        var due = record.get('due');
        
        var className = '';
        if (due) {
            var dueDay = due.format('Y-m-d');
            var today = new Date().format('Y-m-d');

            if (dueDay == today) {
                className += 'tasks-grid-duetoday';
            } else if (dueDay < today) {
                className += 'tasks-grid-overdue';
            }
            
        }
        return className;
    }
});
