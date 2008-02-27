<?php
/**
 * Tine 2.0
 *
 * @package     Admin
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id$
 */

/**
 * event class for added account
 *
 * @package     Admin
 */
class Admin_Event_AddAccount extends Tinebase_Events_Abstract 
{
    /**
     * the just added account
     *
     * @var Tinebase_Account_Model_FullAccount
     */
    public $account;
}