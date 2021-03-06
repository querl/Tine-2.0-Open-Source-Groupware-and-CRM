<?php
/**
 * Tine 2.0
 *
 * @package     ActiveSync
 * @license     http://www.tine20.org/licenses/agpl-nonus.txt AGPL Version 1 (Non-US)
 *              NOTE: According to sec. 8 of the AFFERO GENERAL PUBLIC LICENSE (AGPL), 
 *              Version 1, the distribution of the Tine 2.0 ActiveSync module in or to the 
 *              United States of America is excluded from the scope of this license.
 * @copyright   Copyright (c) 2008-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>Lars Kneschke <l.kneschke@metaways.de>
 */

/**
 * controller email class
 *
 * @package     ActiveSync
 */
class ActiveSync_Controller_Email extends ActiveSync_Controller_Abstract 
{
    protected $_mapping = array(
        #'Body'              => 'body',
        'Cc'                => 'cc',
        'DateReceived'      => 'received',
        'From'              => 'from_email',
        #'Sender'            => 'sender',
        'Subject'           => 'subject',
        'To'                => 'to'
    );
    
    /**
     * filter types
     */
    const FILTER_NOTHING        = 0;
    const FILTER_1_DAY_BACK     = 1;
    const FILTER_3_DAYS_BACK    = 2;
    const FILTER_1_WEEK_BACK    = 3;
    const FILTER_2_WEEKS_BACK   = 4;
    const FILTER_1_MONTH_BACK   = 5;
    
    /**
     * available filters
     * 
     * @var array
     */
    protected $_filterArray = array(
        self::FILTER_1_DAY_BACK,
        self::FILTER_3_DAYS_BACK,
        self::FILTER_1_WEEK_BACK,
        self::FILTER_2_WEEKS_BACK,
        self::FILTER_1_MONTH_BACK,
    );
    
    /**
     * felamimail message controller
     *
     * @var Felamimail_Controller_Message
     */
    protected $_messageController;
    
    /**
     * felamimail folder controller
     *
     * @var Felamimail_Controller_Folder
     */
    protected $_folderController;
    
    protected $_applicationName     = 'Felamimail';
    
    protected $_modelName           = 'Message';
    
    /**
     * type of the default folder
     *
     * @var int
     */
    protected $_defaultFolderType   = ActiveSync_Command_FolderSync::FOLDERTYPE_INBOX;
    
    /**
     * type of user created folders
     *
     * @var int
     */
    protected $_folderType          = ActiveSync_Command_FolderSync::FOLDERTYPE_MAIL_USER_CREATED;
    
    /**
     * name of property which defines the filterid for different content classes
     * 
     * @var string
     */
    protected $_filterProperty = 'emailfilter_id';
            
    /**
     * field to sort search results by
     * 
     * @var string
     */
    protected $_sortField = 'received';
    
    /**
     * @var Felamimail_Controller_Message
     */
    protected $_contentController;
    
    /**
     * get all entries changed between to dates
     *
     * @param unknown_type $_field
     * @param unknown_type $_startTimeStamp
     * @param unknown_type $_endTimeStamp
     * @return array
     */
    public function getChanged($_folderId, $_startTimeStamp, $_endTimeStamp = NULL)
    {
        $filter = new $this->_contentFilterClass();
        
        $this->_getContentFilter($filter, 0);
        $this->_getContainerFilter($filter, $_folderId);

        $startTimeStamp = ($_startTimeStamp instanceof DateTime) ? $_startTimeStamp->get(Tinebase_Record_Abstract::ISO8601LONG) : $_startTimeStamp;
        $endTimeStamp = ($_endTimeStamp instanceof DateTime) ? $_endTimeStamp->get(Tinebase_Record_Abstract::ISO8601LONG) : $_endTimeStamp;
        
        $filter->addFilter(new Tinebase_Model_Filter_DateTime(
            'timestamp',
            'after',
            $startTimeStamp
        ));
        
        if($endTimeStamp !== NULL) {
            $filter->addFilter(new Tinebase_Model_Filter_DateTime(
                'timestamp',
                'before',
                $endTimeStamp
            ));
        }
        
        #if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filter " . print_r($filter->toArray(), true));
        
        $result = $this->_contentController->search($filter, NULL, false, true, 'sync');
        
        return $result;
    }
    
    /**
     * append email data to xml element
     *
     * @param DOMElement  $_xmlNode   the parrent xml node
     * @param string      $_folderId  the local folder id
     */
    public function appendFileReference(DOMElement $_xmlNode, $_fileReference)
    {
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " append fileReference " . $_fileReference/* . ' options ' . print_r($_options, true)*/);
        
        list($messageId, $partId) = explode('-', $_fileReference, 2);
        
        $file = $this->_contentController->getMessagePart($messageId, $partId);
        
        $_xmlNode->appendChild(new DOMElement('ContentType', $file->type, 'uri:AirSyncBase'));
        $_xmlNode->appendChild(new DOMElement('Data', base64_encode($file->getDecodedContent()), 'uri:ItemOperations'));  
    }
    
    /**
     * append email data to xml element
     *
     * @param DOMElement  $_xmlNode   the parrent xml node
     * @param string      $_folderId  the local folder id
     * @param string      $_serverId  the local entry id
     * @param boolean     $_withBody  retrieve body of entry
     */
    public function appendXML(DOMElement $_xmlNode, $_folderId, $_serverId, array $_options, $_neverTruncate = false)
    {
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " append email " . $_serverId/* . ' options ' . print_r($_options, true)*/);
        
        $data = $_serverId instanceof Tinebase_Record_Abstract ? $_serverId : $this->_contentController->get($_serverId);
        
        foreach($this->_mapping as $key => $value) {
            if(!empty($data->$value) || $data->$value == 0) {
                $nodeContent = null;
                
                switch($value) {
                    case 'received':
                        $nodeContent = $data->$value->toString('Y-m-d\TH:i:s') . '.000Z';
                        break;
                        
                    case 'from_email':
                        $nodeContent = $this->_createEmailAddress($data->from_name, $data->from_email); 
                        break;
                        
                    case 'to':
                    case 'cc':
                        $nodeContent = implode(', ', $data->$value);
                        
                        break;
                    default:
                        $nodeContent = $data->$value;
                        break;
                }
                
                // skip empty elements
                if($nodeContent === null || $nodeContent == '') {
                    //Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " Value for $key is empty. Skip element.");
                    continue;
                }
                
                // ... append it to parent node aka append it to the document ...
                $node = $_xmlNode->appendChild(new DOMElement($key, null, 'uri:Email'));
                
                // strip off any non printable control characters
                if (!ctype_print($nodeContent)) {
                    # another way to remove non printing characters
                    $nodeContent = $this->removeControlChars($nodeContent);
                }
                
                // ... and now add the content (DomText takes care of special chars)
                $node->appendChild(new DOMText($nodeContent));
            }
        }
        
        // read flag
        if (in_array('\Seen', $data->flags)) {
            $_xmlNode->appendChild(new DOMElement('Read', 1, 'uri:Email'));                 
        } else {
            $_xmlNode->appendChild(new DOMElement('Read', 0, 'uri:Email'));
        }
        
        // attachments?
        if ($data->has_attachment == true) {
            $attachments = $this->_contentController->getAttachments($data);
            
            if (count($attachments) > 0) {
                $tagAttachments = $_xmlNode->appendChild(new DOMElement('Attachments', null, 'uri:AirSyncBase'));
                
                foreach ($attachments as $attachment) {
                    $tagAttachment = $tagAttachments->appendChild(new DOMElement('Attachment', null, 'uri:AirSyncBase'));
                    
                    $tagAttachment->appendChild(new DOMElement('DisplayName', $this->removeControlChars($attachment['filename']), 'uri:AirSyncBase'));
                    $tagAttachment->appendChild(new DOMElement('FileReference', $data->getId() . '-' . $attachment['partId'], 'uri:AirSyncBase'));
                    $tagAttachment->appendChild(new DOMElement('Method', 1, 'uri:AirSyncBase'));
                    $tagAttachment->appendChild(new DOMElement('EstimatedDataSize', $this->removeControlChars($attachment['size']), 'uri:AirSyncBase'));
                }
            }
        }
        
        // get truncation
        $truncateAt = null;
        
        if (isset($_options['mimeSupport']) && $_options['mimeSupport'] == 2 && (version_compare($this->_device->acsversion, '12.0', '<=') || isset($_options['bodyPreferences'][4]))) {
            if ($_neverTruncate === false && isset($_options['bodyPreferences'][4]) && isset($_options['bodyPreferences'][4]['truncationSize'])) {
                $truncateAt = $_options['bodyPreferences'][4]['truncationSize'];
            }
            $airSyncBaseType = 4;
        } elseif (isset($_options['bodyPreferences'][2])) {
            if ($_neverTruncate === false && isset($_options['bodyPreferences'][2]['truncationSize'])) {
                $truncateAt = $_options['bodyPreferences'][2]['truncationSize'];
            }
            $airSyncBaseType = 2;
        } else {
            if ($_neverTruncate === false && isset($_options['bodyPreferences'][1]) && isset($_options['bodyPreferences'][1]['truncationSize'])) {
                $truncateAt = $_options['bodyPreferences'][1]['truncationSize'];
            }
            $airSyncBaseType = 1;
        }
        
        if ($_neverTruncate === false) {
            if (isset($_options['mimeTruncation']) && $_options['mimeTruncation'] < 8) {
                switch($_options['mimeTruncation']) {
                    case 0:
                        $truncateAt = 0;
                        break;
                    case 1:
                        $truncateAt = 4096;
                        break;
                    case 2:
                        $truncateAt = 5120;
                        break;
                    case 3:
                        $truncateAt = 7168;
                        break;
                    case 4:
                        $truncateAt = 10240;
                        break;
                    case 5:
                        $truncateAt = 20480;
                        break;
                    case 6:
                        $truncateAt = 51200;
                        break;
                    case 7:
                        $truncateAt = 102400;
                        break;
                }
            }
        }
        
        if ($airSyncBaseType == 4) {
            // getMessagePart will return Zend_Mime_Part
            $messageBody = $this->_contentController->getMessagePart($_serverId);
            $messageBody = stream_get_contents($messageBody->getRawStream()); 
            
            if (version_compare($this->_device->acsversion, '12.0', '<')) {
                // if the email contains non 7bit ascii characters we can't transfer them via MIMEData xml and we need to fall back to plain text
                if (preg_match('/(?:[^\x00-\x7F])/', $messageBody)) {
                    $airSyncBaseType = 1;
                    $messageBody     = $this->_contentController->getMessageBody($_serverId, null, Zend_Mime::TYPE_TEXT, NULL, true);
                }
            }
        } else {
            $messageBody = $this->_contentController->getMessageBody($_serverId, null, $airSyncBaseType == 2 ? Zend_Mime::TYPE_HTML : Zend_Mime::TYPE_TEXT, NULL, true);
        }
        
        // remove control chars
        $messageBody = $this->removeControlChars($messageBody);
        
        if($truncateAt !== null && strlen($messageBody) > $truncateAt) {
            $messageBody  = substr($messageBody, 0, $truncateAt);
            // maybe the last character is no unicode character anymore
            $messageBody  = @iconv('utf-8', 'utf-8//IGNORE', $messageBody);
            $isTruncacted = 1;
        } else {
            $isTruncacted = 0;
        }
        
        if (strlen($messageBody) > 0) {
            if (version_compare($this->_device->acsversion, '12.0', '>=')) {
                $body = $_xmlNode->appendChild(new DOMElement('Body', null, 'uri:AirSyncBase'));
                $body->appendChild(new DOMElement('Type', $airSyncBaseType, 'uri:AirSyncBase'));
                $body->appendChild(new DOMElement('Truncated', $isTruncacted, 'uri:AirSyncBase'));
                $body->appendChild(new DOMElement('EstimatedDataSize', $data->size, 'uri:AirSyncBase'));
                
                $dataTag = $body->appendChild(new DOMElement('Data', null, 'uri:AirSyncBase'));
                $dataTag->appendChild(new DOMText($messageBody));
                
                $_xmlNode->appendChild(new DOMElement('NativeBodyType', $airSyncBaseType, 'uri:AirSyncBase'));
            } else {
                if ($airSyncBaseType == 4) {
                    $_xmlNode->appendChild(new DOMElement('MIMETruncated', $isTruncacted, 'uri:Email'));
                    
                    $body = $_xmlNode->appendChild(new DOMElement('MIMEData', null, 'uri:Email'));
                    $body->appendChild(new DOMText($messageBody));
                    
                } else {
                    $_xmlNode->appendChild(new DOMElement('BodyTruncated', $isTruncacted, 'uri:Email'));
                    
                    $body = $_xmlNode->appendChild(new DOMElement('Body', null, 'uri:Email'));
                    $body->appendChild(new DOMText($messageBody));
                }
            }
        }
        
        if ($airSyncBaseType == 4) {
            $_xmlNode->appendChild(new DOMElement('MessageClass', 'IPM.Note.SMIME', 'uri:Email'));
        } else {
            $_xmlNode->appendChild(new DOMElement('MessageClass', 'IPM.Note', 'uri:Email'));
        }
        $_xmlNode->appendChild(new DOMElement('ContentClass', 'urn:content-classes:message', 'uri:Email'));
        
        return;
        /*
        foreach($message->getHeaders() as $headerName => $headerValue) {
            switch($headerName) {
                case 'importance':
                    switch (strtolower($headerValue)) {
                        case 'low':
                            $_xmlNode->appendChild($_xmlDocument->createElementNS('uri:Email', 'Importance', 0));
                            break;
                    	
                        case 'high':
                            $_xmlNode->appendChild($_xmlDocument->createElementNS('uri:Email', 'Importance', 2));
                            break;
                            
                    }
                    
                    break;
            }
        }
        */
    }
    
    /**
     * delete entry
     *
     * @param  string  $_collectionId
     * @param  string  $_id
     * @param  array   $_options
     */
    public function delete($_collectionId, $_id, $_options)
    {
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " delete ColectionId: $_collectionId Id: $_id");
        
        $folder  = Felamimail_Controller_Folder::getInstance()->get($_collectionId);
        $account = Felamimail_Controller_Account::getInstance()->get($folder->account_id);
        
        if ($_options['deletesAsMoves'] === true && !empty($account->trash_folder)) {
            // move message to trash folder
            $trashFolder = Felamimail_Controller_Folder::getInstance()->getByBackendAndGlobalName($account, $account->trash_folder);
            Felamimail_Controller_Message_Move::getInstance()->moveMessages($_id, $trashFolder);
            Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " moved entry $_id to trash folder");
        } else {
            // set delete flag
            Felamimail_Controller_Message_Flags::getInstance()->addFlags($_id, Zend_Mail_Storage::FLAG_DELETED);
            Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " deleted entry " . $_id);
        }
    }
    
    /**
     * get id's of all contacts available on the server
     *
     * @return array
     */
    protected function _getServerEntries($_folderId, $_filterType)
    {
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " get server entries for folder " . $_folderId);
        
        $filter = new $this->_contentFilterClass();
        
        $this->_getContentFilter($filter, $_filterType);
        $this->_getContainerFilter($filter, $_folderId);
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filter " . print_r($filter->toArray(), true));
        
        $messages = $this->_contentController->search($filter, null, false, true);
        
    	return $messages;    	
    }
    
    /**
     * update existing entry
     *
     * @param  string  $_collectionId
     * @param  string  $_id
     * @param SimpleXMLElement $_data
     * @return Tinebase_Record_Abstract
     */
    public function change($_collectionId, $_id, SimpleXMLElement $_data)
    {
        Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " CollectionId: $_collectionId Id: $_id");
        
        $xmlData = $_data->children('uri:Email');
        
        if(isset($xmlData->Read)) {
            if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " CollectionId: $_collectionId Id: $_id set read flag: $xmlData->Read");
            if((int)$xmlData->Read === 1) {
                Felamimail_Controller_Message_Flags::getInstance()->addFlags($_id, Zend_Mail_Storage::FLAG_SEEN);
            } else {
                Felamimail_Controller_Message_Flags::getInstance()->clearFlags($_id, Zend_Mail_Storage::FLAG_SEEN);
            }
            
            $message = $this->_contentController->get($_id);
            $message->timestamp = $this->_syncTimeStamp;
            $this->_contentController->update($message);
        }
        
        return;
    }
    
    /**
     * convert email from xml to Felamimail_Model_Message
     *
     * @param  SimpleXMLElement  $_data
     * @param  mixed             $_entry
     */
    public function toTineModel(SimpleXMLElement $_data, $_entry = null)
    {
        // does nothing => you can't add emails via ActiveSync
    }
    
    /**
     * create rfc email address 
     * 
     * @param  string  $_realName
     * @param  string  $_address
     * @return string
     */
    protected function _createEmailAddress($_realName, $_address)
    {
        return !empty($_realName) ? sprintf('"%s" <%s>', str_replace('"', '\\"', $_realName), $_address) : $_address; 
    }
    
    /**
     * convert contact from xml to Addressbook_Model_ContactFilter
     *
     * @param SimpleXMLElement $_data
     * @return Addressbook_Model_ContactFilter
     */
    protected function _toTineFilterArray(SimpleXMLElement $_data)
    {
        $xmlData = $_data->children('Email');
        
        $filterArray = array();
        
        foreach($this->_mapping as $fieldName => $value) {
            if(isset($xmlData->$fieldName)) {
                $filterArray[] = array(
                    'field'     => $value,
                    'operator'  => 'equals',
                    'value'     => (string)$xmlData->$fieldName
                );
            }
        }
        
        #if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filterData " . print_r($filterArray, true));
        
        return $filterArray;
    }
    
    /**
     * return list of supported folders for this backend
     *
     * @return array
     */
    public function getSupportedFolders()
    {
        if (!Tinebase_Core::getUser()->hasRight('Felamimail', Tinebase_Acl_Rights::RUN)) {
            // no folders
            return array();
        }
        
        $defaultAccountId = Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT};
        
        if (empty($defaultAccountId)) {
            if (Tinebase_Core::isLogLevel(Zend_Log::INFO)) Tinebase_Core::getLogger()->info(__METHOD__ . '::' . __LINE__ . " no default account set. Can't sync any folders.");
            return array();            
        }
        
        try {
            $account = Felamimail_Controller_Account::getInstance()->get($defaultAccountId);
        } catch (Tinebase_Exception_NotFound $ten) {
            // no folders
            return array();
        }
        
        if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " accountData " . print_r($account->toArray(), true));
        
        // update folder cache
        Felamimail_Controller_Cache_Folder::getInstance()->update($account);
        
        // get folders
        $folderController = Felamimail_Controller_Folder::getInstance();
        $folders = $folderController->getSubfolders($account->getId(), '');

        $result = array();
        
        foreach ($folders as $folder) {
            if (! empty($folder->parent)) {
                try {
                    $parent   = $folderController->getByBackendAndGlobalName($folder->account_id, $folder->parent);
                    $parentId = $parent->getId();
                } catch (Tinebase_Exception_NotFound $ten) {
                    continue;
                }
            } else {
                $parentId = 0;
            }
            
            $result[$folder->getId()] = array(
                'folderId'      => $folder->getId(),
                'parentId'      => $parentId,
                'displayName'   => $folder->localname,
                'type'          => $this->_getFolderType($folder->localname)
            );
        }
        
        #if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " folder result " . print_r($result, true));
        
        return $result;
    }
    
    /**
     * (non-PHPdoc)
     * @see ActiveSync/Controller/ActiveSync_Controller_Interface#moveItem()
     */
    public function moveItem($_srcFolder, $_srcItem, $_dstFolder)
    {
        $filter = new Felamimail_Model_MessageFilter(array(
            array(
                'field'     => 'id',
                'operator'  => 'equals',
                'value'     => $_srcItem
            )
        ));
        
        Felamimail_Controller_Message_Move::getInstance()->moveMessages($filter, $_dstFolder);
        
        return $_srcItem;
    }
    
    /**
     * used by the mail backend only. Used to update the folder cache
     * 
     * @param  string  $_folderId
     */
    public function updateCache($_folderId)
    {
        Felamimail_Controller_Cache_Message::getInstance()->updateCache($_folderId, 5);
    }
    
    /**
     * set activesync foldertype
     * 
     * @param string $_folderName
     */
    protected function _getFolderType($_folderName)
    {
        if(strtoupper($_folderName) == 'INBOX') {
            return ActiveSync_Command_FolderSync::FOLDERTYPE_INBOX;
        } elseif (strtoupper($_folderName) == 'TRASH') {
            return ActiveSync_Command_FolderSync::FOLDERTYPE_DELETEDITEMS;
        } elseif (strtoupper($_folderName) == 'SENT') {
            return ActiveSync_Command_FolderSync::FOLDERTYPE_SENTMAIL;
        } else {
            return ActiveSync_Command_FolderSync::FOLDERTYPE_MAIL_USER_CREATED;
        }
    }
    
    /**
     * get folder identified by $_folderId
     *
     * @param string $_folderId
     * @return string
     */
    public function getFolder($_folderId)
    {
        $folders = $this->getSupportedFolders();
        
        if(!array_key_exists($_folderId, $folders)) {
            throw new ActiveSync_Exception_FolderNotFound('folder not found. ' . $_folderId);
        }
        
        return $folders[$_folderId];
    }
    
    /**
     * return contentfilter object
     * 
     * @param $_filterType
     * @return Tinebase_Model_Filter_FilterGroup
     */
    protected function _getContentFilter(Tinebase_Model_Filter_FilterGroup $_filter, $_filterType)
    {
        #$_filter->addFilter(new Tinebase_Model_Filter_Text('recurid', 'isnull', null));
        
        if(in_array($_filterType, $this->_filterArray)) {
            $today = Tinebase_DateTime::now()->setTime(0,0,0);
                
            switch($_filterType) {
                case self::FILTER_1_DAY_BACK:
                    $received = $today->subDay(1);
                    break;
                case self::FILTER_3_DAYS_BACK:
                    $received = $today->subDay(3);
                    break;
                case self::FILTER_1_WEEK_BACK:
                    $received = $today->subWeek(1);
                    break;
                case self::FILTER_2_WEEKS_BACK:
                    $received = $today->subWeek(2);
                    break;
                case self::FILTER_1_MONTH_BACK:
                    $received = $today->subMonth(2);
                    break;
            }
            
            // add period filter
            $_filter->addFilter(new Tinebase_Model_Filter_DateTime('received', 'after', $received->get(Tinebase_Record_Abstract::ISO8601LONG)));
        }
    }
    
    protected function _getContainerFilter(Tinebase_Model_Filter_FilterGroup $_filter, $_containerId)
    {
        // custom filter gets added when created
        $_filter->createFilter(
            'account_id', 
            'equals', 
            Tinebase_Core::getPreference('Felamimail')->{Felamimail_Preference::DEFAULTACCOUNT}
        );
        
        $_filter->addFilter($_filter->createFilter(
            'folder_id', 
            'equals', 
            $_containerId
        ));  

        #if (Tinebase_Core::isLogLevel(Zend_Log::DEBUG)) Tinebase_Core::getLogger()->debug(__METHOD__ . '::' . __LINE__ . " filter " . print_r($_filter->toArray(), true));
    }
}
