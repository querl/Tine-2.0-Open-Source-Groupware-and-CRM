<?php
/**
 * Tine 2.0
 *
 * @package     ActiveSync
 * @license     http://www.tine20.org/licenses/agpl-nonus.txt AGPL Version 1 (Non-US)
 *              NOTE: According to sec. 8 of the AFFERO GENERAL PUBLIC LICENSE (AGPL), 
 *              Version 1, the distribution of the Tine 2.0 ActiveSync module in or to the 
 *              United States of America is excluded from the scope of this license.
 * @copyright   Copyright (c) 2008-2009 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>Lars Kneschke <l.kneschke@metaways.de>
 */

/**
 * controller tasks class
 *
 * @package     ActiveSync
 */
class ActiveSync_Controller_Tasks extends ActiveSync_Controller_Abstract 
{
    /**
     * filter types
     */
    const FILTER_NOTHING    = 0;
    const FILTER_INCOMPLETE = 8;
    
    /**
     * available filters
     * 
     * @var array
     */
    protected $_filterArray = array(
        self::FILTER_INCOMPLETE
    );
    
    protected $_mapping = array(
        #'Body'              => 'body',
        #'BodySize'          => 'bodysize',
        #'BodyTruncated'     => 'bodytruncated',
        #'Categories'        => 'categories',
        #'Category'          => 'category',
        'Complete'          => 'completed',
        #'DateCompleted'     => 'datecompleted',
        #'DueDate'           => 'duedate',
        'UtcDueDate'        => 'due',
        'Importance'        => 'priority',
        #'Recurrence'        => 'recurrence',
        #'Type'              => 'type',
        #'Start'             => 'start',
        #'Until'             => 'until',
        #'Occurrences'       => 'occurrences',
        #'Interval'          => 'interval',
        #'DayOfWeek'         => 'dayofweek',
        #'DayOfMonth'        => 'dayofmonth',
        #'WeekOfMonth'       => 'weekofmonth',
        #'MonthOfYear'       => 'monthofyear',
        #'Regenerate'        => 'regenerate',
        #'DeadOccur'         => 'deadoccur',
        #'ReminderSet'       => 'reminderset',
        #'ReminderTime'      => 'remindertime',
        #'Sensitivity'       => 'sensitivity',
        #'StartDate'         => 'startdate',
        #'UtcStartDate'      => 'utcstartdate',
        'Subject'           => 'summary',
        #'Rtf'               => 'rtf'
    );
    
    /**
     * name of Tine 2.0 backend application
     * 
     * @var string
     */
    protected $_applicationName     = 'Tasks';
    
    /**
     * name of Tine 2.0 model to use
     * 
     * @var string
     */
    protected $_modelName           = 'Task';
    
    /**
     * type of the default folder
     *
     * @var int
     */
    protected $_defaultFolderType   = ActiveSync_Command_FolderSync::FOLDERTYPE_TASK;
    
    /**
     * default container for new entries
     * 
     * @var string
     */
    protected $_defaultFolder       = ActiveSync_Preference::DEFAULTTASKLIST;
    
    /**
     * type of user created folders
     *
     * @var int
     */
    protected $_folderType          = ActiveSync_Command_FolderSync::FOLDERTYPE_TASK_USER_CREATED;
    
    /**
     * name of property which defines the filterid for different content classes
     * 
     * @var string
     */
    protected $_filterProperty = 'tasksfilter_id';        
    
    /**
     * append task data to xml element
     *
     * @param DOMElement  $_xmlNode   the parrent xml node
     * @param string      $_folderId  the local folder id
     * @param string      $_serverId  the local entry id
     * @param boolean     $_withBody  retrieve body of entry
     */
    public function appendXML(DOMElement $_xmlNode, $_folderId, $_serverId, array $_options, $_neverTruncate = false)
    {
        $data = $_serverId instanceof Tinebase_Record_Abstract ? $_serverId : $this->_contentController->get($_serverId);
        
        foreach ($this->_mapping as $key => $value) {
            if (!empty($data->$value)) {
                switch($value) {
                    case 'completed':
                        continue 2;
                        break;
                        
                    case 'due':
                        if($data->$value instanceof DateTime) {
                            $_xmlNode->appendChild(new DOMElement($key, $data->$value->toString('Y-m-d\TH:i:s') . '.000Z', 'uri:Tasks'));
                            $data->$value->setTimezone(Tinebase_Core::get('userTimeZone'));
                            $_xmlNode->appendChild(new DOMElement('DueDate', $data->$value->toString('Y-m-d\TH:i:s') . '.000Z', 'uri:Tasks'));
                        }
                        break;
                        
                    case 'priority':
                        $priority = ($data->$value <= 2) ? $data->$value : 2;
                        $_xmlNode->appendChild(new DOMElement($key, $priority, 'uri:Tasks'));
                        break;
                        
                    default:
                        $node = new DOMElement($key, null, 'uri:Tasks');
                        
                        $_xmlNode->appendChild($node);
                        
                        $node->appendChild(new DOMText($data->$value));
                        
                        break;
                }
            }
        }   

        // body aka description
        if (!empty($data->description) && version_compare($this->_device->acsversion, '12.0', '>=')) {
            $body = $_xmlNode->appendChild(new DOMElement('Body', null, 'uri:AirSyncBase'));
            
            $body->appendChild(new DOMElement('Type', 1, 'uri:AirSyncBase'));
            
            $dataTag = $body->appendChild(new DOMElement('Data', null, 'uri:AirSyncBase'));
            $dataTag->appendChild(new DOMText(preg_replace("/(\r\n?|\n)/", "\r\n", $data->description)));
        }
        
        // Completed is required
        if ($data->completed instanceof DateTime) {
            $_xmlNode->appendChild(new DOMElement('Complete', 1, 'uri:Tasks'));
            $_xmlNode->appendChild(new DOMElement('DateCompleted', $data->completed->toString('Y-m-d\TH:i:s') . '.000Z', 'uri:Tasks'));
        } else {
            $_xmlNode->appendChild(new DOMElement('Complete', 0, 'uri:Tasks'));
        }
        
        if (isset($data->tags) && count($data->tags) > 0) {
            $categories = $_xmlNode->appendChild(new DOMElement('Categories', null, 'uri:Tasks'));
            foreach ($data->tags as $tag) {
                $categories->appendChild(new DOMElement('Category', $tag, 'uri:Tasks'));
            }
        }
        
    }
        
    /**
     * convert contact from xml to Addressbook_Model_Contact
     *
     * @todo handle images
     * @param SimpleXMLElement $_data
     * @return Addressbook_Model_Contact
     */
    public function toTineModel(SimpleXMLElement $_data, $_entry = null)
    {
        if($_entry instanceof Tasks_Model_Task) {
            $task = $_entry;
        } else {
            $task = new Tasks_Model_Task(null, true);
        }
        
        $xmlData = $_data->children('uri:Tasks');

        foreach($this->_mapping as $fieldName => $value) {
            switch($value) {
                case 'completed':
                    
                    // get status COMPLETED/IN-PROCESS
                    $allStatus = Tasks_Controller_Status::getInstance()->getAllStatus();
                    foreach ($allStatus as $status) {
                        switch ($status->status_name) {
                            case  'COMPLETED':
                                $completedStatus = $status;
                                break;
                            case  'IN-PROCESS':
                                $inprocessStatus = $status;
                                break;
                        }
                    }
                    
                    if((int)$xmlData->$fieldName === 1) {
                        $task->status_id = (isset($completedStatus)) ? $completedStatus->getId() : 2;
                        $task->completed = (string)$xmlData->DateCompleted;
                    } else {
                        $task->status_id = (isset($inprocessStatus)) ? $inprocessStatus->getId() : 3;
                        $task->completed = NULL;
                    }
                    break;
                case 'due':
                    if(isset($xmlData->$fieldName)) {
                        $task->$value = $this->_convertISOToZendDate((string)$xmlData->$fieldName);
                    } else {
                        $task->$value = null;
                    }
                    break;
                default:
                    if(isset($xmlData->$fieldName)) {
                        $task->$value = (string)$xmlData->$fieldName;
                    } else {
                        $task->$value = null;
                    }
                    break;
            }
        }
        
        if (version_compare($this->_device->acsversion, '12.0', '>=')) {
            $airSyncBase = $_data->children('uri:AirSyncBase');
            
            if (isset($airSyncBase->Body) && isset($airSyncBase->Body->Data)) {
                $task->description = preg_replace("/(\r\n?|\n)/", "\r\n", (string)$airSyncBase->Body->Data);
            }
        }
        
        // task should be valid now
        $task->isValid();
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " taskData " . print_r($task->toArray(), true));
        
        return $task;
    }
    
    /**
     * convert contact from xml to Addressbook_Model_ContactFilter
     *
     * @param SimpleXMLElement $_data
     * @return array
     */
    protected function _toTineFilterArray(SimpleXMLElement $_data)
    {
        $xmlData = $_data->children('uri:Tasks');
        
        foreach($this->_mapping as $fieldName => $field) {
            if(isset($xmlData->$fieldName)) {
                switch ($field) {
                    case 'due':
                        $value = $this->_convertISOToZendDate((string)$xmlData->$fieldName);
                        break;
                        
                    default:
                        $value = (string)$xmlData->$fieldName;
                        break;
                        
                }
                $filterArray[] = array(
                    'field'     => $field,
                    'operator'  => 'equals',
                    'value'     => $value
                );
            }
        }
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filterData " . print_r($filterArray, true));
        
        return $filterArray;
    }
    
    /**
     * converts an iso formated date into DateTime
     *
     * @param  string  $_iso  ISO8601 representation of a datetime filed
     * @return DateTime
     */
    protected function _convertISOToZendDate($_iso)
    {
        $matches = array();
        
        preg_match("/^(\d{4})-(\d{2})-(\d{2})[T ]{1}(\d{2}):(\d{2}):(\d{2})/", $_iso, $matches);
        
        if (count($matches) !== 7) {
            throw new Tinebase_Exception_UnexpectedValue("invalid date format $_iso");
        }
        
        return new Tinebase_DateTime($_iso);
    }
    
	/**
     * return list of supported folders for this backend
     *
     * @return array
     */
    public function getSupportedFolders()
    {
        $folders[$this->_specialFolderName] = array(
            'folderId'      => $this->_specialFolderName,
            'parentId'      => 0,
            'displayName'   => $this->_applicationName,
            'type'          => $this->_defaultFolderType
        );
        
        return $folders;
    }
    
    protected function _getSyncableFolders()
    {
        $folders = array();
        
        $containers = Tinebase_Container::getInstance()->getPersonalContainer(Tinebase_Core::getUser(), $this->_applicationName, Tinebase_Core::getUser(), Tinebase_Model_Grants::GRANT_SYNC);
        foreach ($containers as $container) {
            $folders[$container->id] = array(
                'folderId'      => $container->id,
                'parentId'      => 0,
                'displayName'   => $container->name,
                'type'          => (count($folders) == 0) ? $this->_defaultFolderType : $this->_folderType
            );
        }
                
        // we ignore the folders of others users and shared folders for now
                
        return $folders;
    }
    
    /**
     * return contentfilter array
     * 
     * @param $_filterType
     * @return Tinebase_Model_Filter_FilterGroup
     */
    protected function _getContentFilter(Tinebase_Model_Filter_FilterGroup $_filter, $_filterType)
    {
        if(in_array($_filterType, $this->_filterArray)) {
            switch($_filterType) {
                case self::FILTER_INCOMPLETE:
                    $_filter->removeFilter('status_id');
                    
                    $status = Tasks_Controller_Status::getInstance()
                        ->getAllStatus()
                        ->filter('status_is_open', 1);

                    if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filter by status ids " . print_r($status->getArrayOfIds(), true));
                    
                    $_filter->addFilter(new Tinebase_Model_Filter_Int(
                        'status_id', 
                        'in', 
                        $status->getArrayOfIds()
                    ));
                    
                    break;
            }
        }
    }
}
