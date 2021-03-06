<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @copyright   Copyright (c) 2010-2010 Metaways Infosystems GmbH (http://www.metaways.de)
 */

/**
 * sql backend class for tree file(and directory) objects
 *
 * @package     Tinebase
 */
class Tinebase_Tree_FileObject extends Tinebase_Backend_Sql_Abstract
{
    /**
     * Table name without prefix
     *
     * @var string
     */
    protected $_tableName = 'tree_fileobjects';
    
    /**
     * Model name
     *
     * @var string
     */
    protected $_modelName = 'Tinebase_Model_Tree_FileObject';

    /**
     * if modlog is active, we add 'is_deleted = 0' to select object in _getSelect()
     *
     * @var boolean
     */
    protected $_modlogActive = false;
    
    /**
     * get the basic select object to fetch records from the database
     *  
     * @param array|string|Zend_Db_Expr $_cols columns to get, * per default
     * @param boolean $_getDeleted get deleted records (if modlog is active)
     * @return Zend_Db_Select
     */
    protected function _getSelect($_cols = '*', $_getDeleted = FALSE)
    {
        $select = parent::_getSelect($_cols, $_getDeleted);
        
        $select
            ->joinLeft(
                /* table  */ array('tree_filerevisions' => $this->_tablePrefix . 'tree_filerevisions'), 
                /* on     */ $this->_db->quoteIdentifier($this->_tableName . '.id') . ' = ' . $this->_db->quoteIdentifier('tree_filerevisions.id') . ' AND ' . $this->_db->quoteIdentifier($this->_tableName . '.revision') . ' = ' . $this->_db->quoteIdentifier('tree_filerevisions.revision'),
                /* select */ array('revision', 'hash', 'size')
            );
            
        return $select;
    }        

    /**
     * get value of next revision for given fileobject
     * 
     * @param Tinebase_Model_Tree_FileObject $_objectId
     */
    protected function _getNextRevision(Tinebase_Model_Tree_FileObject $_objectId)
    {
        $objectId = $_objectId instanceof Tinebase_Model_Tree_FileObject ? $_objectId->getId() : $_objectId;
        
        $transactionId = Tinebase_TransactionManager::getInstance()->startTransaction(Tinebase_Core::getDb());

        $select = $this->_db->select()
            ->from($this->_tablePrefix . $this->_tableName)
            ->where($this->_db->quoteIdentifier($this->_tablePrefix . $this->_tableName . '.id') . ' = ?', $objectId);
        
        // lock row
        $stmt = $this->_db->query($select);
        $queryResult = $stmt->fetchAll();
        
        // increase revision
        $where = $this->_db->quoteInto('id = ?', $objectId);
        $data  = array('revision' => new Zend_Db_Expr($this->_db->quoteIdentifier('revision') . ' + 1'));
        $this->_db->update($this->_tablePrefix . $this->_tableName, $data, $where);

        // fetch updated revision
        $stmt = $this->_db->query($select);
        $queryResult = $stmt->fetchAll();
        
        $revision = $queryResult[0]['revision'];
        
        // store new revisionid and unlock row
        Tinebase_TransactionManager::getInstance()->commitTransaction($transactionId);
        
        return $revision;
    }
    
    /**
     * converts record into raw data for adapter
     *
     * @param  Tinebase_Record_Abstract $_record
     * @return array
     */
    protected function _recordToRawData($_record)
    {
        $record = parent::_recordToRawData($_record);
        
        // get updated by _getNextRevision only
        unset($record['revision']);
        
        return $record;
    }
    
    /**
     * update foreign key values
     * 
     * @param string $_mode create|update
     * @param Tinebase_Record_Abstract $_record
     */
    protected function _updateForeignKeys($_mode, Tinebase_Record_Abstract $_record)
    {
        if ($_record->type != Tinebase_Model_Tree_FileObject::TYPE_FILE || empty($_record->hash)) {
            return;
        }
        $data = null;
        
        if ($_mode == 'create') {
            $data = array(
                'id'            => $_record->getId(),
                'revision'      => $this->_getNextRevision($_record),
                'creation_time' => Tinebase_DateTime::now()->toString(Tinebase_Record_Abstract::ISO8601LONG),
            	'created_by'    => Tinebase_Core::getUser()->getId(),
                'hash'          => $_record->hash,
                'size'          => $_record->size
            );
        } else {
            // select latest hash of id and compare with new hash
            $currentRecord = $this->get($_record);
            if ($currentRecord->hash !== $_record->hash) {
                $data = array(
                    'id'            => $_record->getId(),
                    'revision'      => $this->_getNextRevision($_record),
                    'creation_time' => Tinebase_DateTime::now()->toString(Tinebase_Record_Abstract::ISO8601LONG),
                	'created_by'    => Tinebase_Core::getUser()->getId(),
                    'hash'          => $_record->hash,
                    'size'          => $_record->size
                );
            }
        }
        
        if ($data !== null) {
            $this->_db->insert($this->_tablePrefix . 'tree_filerevisions', $data);
        }
    }    
}
