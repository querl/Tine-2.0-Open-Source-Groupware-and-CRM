<?php
/**
 * Tine 2.0
 *
 * @package     Tinebase
 * @subpackage  Setup
 * @license     http://www.gnu.org/licenses/agpl.html AGPL3
 * @copyright   Copyright (c) 2009-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Philipp Schüle <p.schuele@metaways.de>
 */

/**
 * Tinebase updates for version 4.x
 *
 * @package     Tinebase
 * @subpackage  Setup
 */
class Tinebase_Setup_Update_Release4 extends Setup_Update_Abstract
{    
    /**
     * update to 4.1
     * - add index for accounts.contact_id
     */
    public function update_0()
    {
        if ($this->getTableVersion('accounts') < 7) {
            $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>contact_id</name>
                    <field>
                        <name>contact_id</name>
                    </field>
                </index>
            ');
            try {
                $this->_backend->addIndex('accounts', $declaration);
            } catch (Zend_Db_Statement_Exception $zdse) {
                Setup_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' ' . $zdse->getMessage());
            }
            
            $this->setTableVersion('accounts', '7');
        }
        
        $this->setApplicationVersion('Tinebase', '4.1');
    }
        
    /**
     * update to 4.2
     * - add index for groups.list_id and access_log.sessionid
     */
    public function update_1()
    {
        if ($this->getTableVersion('groups') < 3) {
            $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>list_id</name>
                    <field>
                        <name>list_id</name>
                    </field>
                </index>
            ');
            try {
                $this->_backend->addIndex('groups', $declaration);
            } catch (Zend_Db_Statement_Exception $zdse) {
                Setup_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' ' . $zdse->getMessage());
            }
            $this->setTableVersion('groups', '3');
        }
        
        if ($this->getTableVersion('access_log') < 3) {
            $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>sessionid</name>
                    <field>
                        <name>sessionid</name>
                    </field>
                </index>
            ');
            try {
                $this->_backend->addIndex('access_log', $declaration);
            } catch (Zend_Db_Statement_Exception $zdse) {
                Setup_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' ' . $zdse->getMessage());
            }
            $this->setTableVersion('access_log', '3');
        }
        
        $this->setApplicationVersion('Tinebase', '4.2');
    }
        
    /**
     * update to 4.3
     * - add index for applications.status
     */
    public function update_2()
    {
        if ($this->getTableVersion('applications') < 2) {
            $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>status</name>
                    <field>
                        <name>status</name>
                    </field>
                </index>
            ');
            try {
                $this->_backend->addIndex('applications', $declaration);
            } catch (Zend_Db_Statement_Exception $zdse) {
                Setup_Core::getLogger()->warn(__METHOD__ . '::' . __LINE__ . ' ' . $zdse->getMessage());
            }
            $this->setTableVersion('applications', '7');
        }
        
        $this->setApplicationVersion('Tinebase', '4.3');
    }
    
    /**
     * update to 4.4
     * - extend length of some accounts fields
     */
    public function update_3()
    {
        $declaration = new Setup_Backend_Schema_Field_Xml('
    		<field>
            	<name>login_name</name>
            	<type>text</type>
            	<length>255</length>
            	<notnull>true</notnull>
            </field>
        ');
        $this->_backend->alterCol('accounts', $declaration);
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
    		<field>
                <name>email</name>
                <type>text</type>
                <length>255</length>
            </field>
        ');
        $this->_backend->alterCol('accounts', $declaration);
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
    		<field>
                <name>first_name</name>
                <type>text</type>
                <length>255</length>
            </field>
        ');
        $this->_backend->alterCol('accounts', $declaration);
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
    		<field>
                <name>last_name</name>
                <type>text</type>
                <length>255</length>
                <notnull>true</notnull>
    		</field>
        ');
        $this->_backend->alterCol('accounts', $declaration);
        
        $this->setTableVersion('accounts', '8');
        
        $this->setApplicationVersion('Tinebase', '4.4');
    }
    
    /**
     * update to 4.5
     * - remove container acl duplicates
     */
    public function update_4()
    {
        $tablePrefix = SQL_TABLE_PREFIX;
        
        $brokenACLs = $this->_db->query("
            SELECT *, COUNT(`container_id`) as `cnt` 
            FROM `{$tablePrefix}container_acl`
            GROUP BY `container_id`, `account_type`, `account_id`, `account_grant`
            HAVING `cnt` > 1;
        ")->fetchAll(Zend_Db::FETCH_ASSOC);
        
        $deleteCount = 0;
        foreach ($brokenACLs as $brokenACL) {
            $deleteCount += $this->_db->delete("{$tablePrefix}container_acl", array(
                "`container_id` = ?" => $brokenACL['container_id'],
                "`account_type` LIKE ?" => $brokenACL['account_type'],
                "`account_id` LIKE ?" => $brokenACL['account_id'],
                "`account_grant` LIKE ?" => $brokenACL['account_grant'],
                "`id` NOT LIKE ?" => $brokenACL['id'],
            ));
        }
        
        $this->setApplicationVersion('Tinebase', '4.5');
    }

    /**
     * update to 4.6
     * - add unique id column to relations table
     */
    public function update_5()
    {
        $this->_backend->dropIndex('relations', 'PRIMARY');
        
        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>rel_id</name>
                <type>text</type>
                <length>40</length>
                <notnull>true</notnull>
            </field>
        ');
        $this->_backend->alterCol('relations', $declaration, 'id');

        $declaration = new Setup_Backend_Schema_Field_Xml('
            <field>
                <name>id</name>
                <type>text</type>
                <length>40</length>
                <notnull>true</notnull>
            </field>
        ');
        $this->_backend->addCol('relations', $declaration, 0);
        
        // add unique ids to all existing relations
        $tablePrefix = SQL_TABLE_PREFIX;
        $relations = $this->_db->query("
            SELECT * 
            FROM `{$tablePrefix}relations`
        ")->fetchAll(Zend_Db::FETCH_ASSOC);
        foreach ($relations as $relation) {
            $relation['id'] = Tinebase_Record_Abstract::generateUID();
            $where = array(
                $this->_db->quoteInto($this->_db->quoteIdentifier('rel_id') .       ' = ?', $relation['rel_id']),
                $this->_db->quoteInto($this->_db->quoteIdentifier('own_model') .    ' = ?', $relation['own_model']),
                $this->_db->quoteInto($this->_db->quoteIdentifier('own_backend') .  ' = ?', $relation['own_backend']),
                $this->_db->quoteInto($this->_db->quoteIdentifier('own_id') .       ' = ?', $relation['own_id']),
            );
            $this->_db->update($tablePrefix . 'relations', $relation, $where);
        }
        
        $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>id</name>
                    <primary>true</primary>
                    <field>
                        <name>id</name>
                    </field>
                </index>
            ');
        $this->_backend->addIndex('relations', $declaration);
        
        $declaration = new Setup_Backend_Schema_Index_Xml('
                <index>
                    <name>rel_id-own_model-own_backend-own_id</name>
                    <unique>true</unique>
                    <field>
                        <name>rel_id</name>
                    </field>
                    <field>
                        <name>own_model</name>
                    </field>
                    <field>
                        <name>own_backend</name>
                    </field>
                    <field>
                        <name>own_id</name>
                    </field>
                </index>
            ');
        $this->_backend->addIndex('relations', $declaration);
        
        $this->setTableVersion('relations', '5');
        $this->setApplicationVersion('Tinebase', '4.6');
    }
    
    /**
     * update to 4.7
     * - add credential cache cleanup task to scheduler
     */
    public function update_6()
    {
        $scheduler = Tinebase_Core::getScheduler();
        Tinebase_Scheduler_Task::addCredentialCacheCleanupTask($scheduler);
        $this->setApplicationVersion('Tinebase', '4.7');
    }    

    /**
     * update to 4.8
     * - add temp file cleanup task to scheduler
     */
    public function update_7()
    {
        $scheduler = Tinebase_Core::getScheduler();
        Tinebase_Scheduler_Task::addTempFileCleanupTask($scheduler);
        $this->setApplicationVersion('Tinebase', '4.8');
    }    
}
