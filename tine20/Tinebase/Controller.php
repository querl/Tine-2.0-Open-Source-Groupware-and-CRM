<?php
/**
 * Tine 2.0
 * 
 * @package     Tinebase
 * @subpackage  Server
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 * @version     $Id$
 */

/**
 * the class provides functions to handle applications
 * 
 * @package     Tinebase
 * @subpackage  Server
 */
class Tinebase_Controller
{
    /**
     * holdes the instance of the singleton
     *
     * @var Tinebase_Controller
     */
    private static $instance = NULL;
    
    /**
     * stores the tinebase session namespace
     *
     * @var Zend_Session_Namespace
     */
    protected $session;
    
    protected $_config;
    
    const PDO_MYSQL = 'Pdo_Mysql';
    
    const PDO_OCI = 'Pdo_Oci';
    
    /**
     * the constructor
     *
     */
    private function __construct() 
    {    
    }
    
    /**
     * initialize the framework
     *
     */
    protected function _initFramework()
    {
        Zend_Session::start();

        if(file_exists(dirname(__FILE__) . '/../config.inc.php')) {
            $this->_config = new Zend_Config(require dirname(__FILE__) . '/../config.inc.php');
        } else {
            try {
                $this->_config = new Zend_Config_Ini($_SERVER['DOCUMENT_ROOT'] . '/../config.ini');
            } catch (Zend_Config_Exception $e) {
                die ('central configuration file ' . $_SERVER['DOCUMENT_ROOT'] . '/../config.ini not found');
            }
        }
        Zend_Registry::set('configFile', $this->_config);
        
        // Timezones must be setup before logger, as logger has timehandling!
        $this->setupTimezones();
        
        $this->setupLogger();
        
        $this->setupMailer();

        $this->setupDatabaseConnection();

        $this->setupUserLocale();
        
        $this->setupCache();
        
        $this->session = new Zend_Session_Namespace('tinebase');
        
        if (!isset($this->session->jsonKey)) {
            $this->session->jsonKey = md5(time());
        }
        Zend_Registry::set('jsonKey', $this->session->jsonKey);

        if (isset($this->session->currentAccount)) {
            Zend_Registry::set('currentAccount', $this->session->currentAccount);
        }
        
    }
    
    /**
     * the singleton pattern
     *
     * @return Tinebase_Controller
     */
    public static function getInstance() 
    {
        if (self::$instance === NULL) {
            self::$instance = new Tinebase_Controller;
        }
        
        return self::$instance;
    }
    
    /**
     * returns an instance of the controller of an application
     *
     * @param string $_applicationName
     * @return object the controller of the application
     */
    public static function getApplicationInstance($_applicationName)
    {
        $controllerName = ucfirst((string) $_applicationName) . '_Controller';
        
        if (!class_exists($controllerName)) {
            throw new Exception('class '. $controllerName . ' not found');
        }
        
        $controller = call_user_func(array($controllerName, 'getInstance'));
        
        return $controller;
    }
    
    /**
     * handler for HTTP api requests
     * @todo session expre handling
     * 
     * @return HTTP
     */
    public function handleHttp()
    {
        
        $this->_initFramework();
        Zend_Registry::get('logger')->debug('is http request. method: ' . (isset($_REQUEST['method']) ? $_REQUEST['method'] : 'EMPTY'));
        
        $server = new Tinebase_Http_Server();

        $server->setClass('Tinebase_Http', 'Tinebase');

        if (Zend_Auth::getInstance()->hasIdentity()) {
            $userApplications = Zend_Registry::get('currentAccount')->getApplications();
            
            foreach ($userApplications as $application) {
                $applicationName = ucfirst((string) $application);
                try {
                    $server->setClass($applicationName.'_Http', $applicationName);
                } catch (Exception $e) {
                    // do nothing
                }
            }
        } 
        
        if (empty($_REQUEST['method'])) {
            if (Zend_Auth::getInstance()->hasIdentity()) {
                $_REQUEST['method'] = 'Tinebase.mainScreen';
            } else {
                $_REQUEST['method'] = 'Tinebase.login';
            }
        }

        $server->handle($_REQUEST);
    }

    /**
     * handler for JSON api requests
     * @todo session expre handling
     * 
     * @return JSON
     */
    public function handleJson()
    {
        $this->_initFramework();
        Zend_Registry::get('logger')->debug('is json request. method: ' . $_REQUEST['method']);
        
        // check json key for all methods but login and user registration
        if (    !($_POST['method'] === 'Tinebase.login' || preg_match('/Tinebase_UserRegistration/', $_POST['method'])) 
                && $_POST['jsonKey'] != Zend_Registry::get('jsonKey') ) { 
                    
            Zend_Registry::get('logger')->WARN(__METHOD__ . '::' . __LINE__ . '  Fatal: got wrong json key! (' . $_POST['jsonKey'] . ') Possible CSRF attempt!' .
                ' affected account: ' . print_r(Zend_Registry::get('currentAccount')->toArray(), true) .
                ' request: ' . print_r($_REQUEST, true)
            );
            
            throw new Exception('Possible CSRF attempt detected!');
        }

        $server = new Zend_Json_Server();
        
        // add json apis which require no auth
        $server->setClass('Tinebase_Json', 'Tinebase');
        $server->setClass('Tinebase_Json_UserRegistration', 'Tinebase_UserRegistration');
        
        // register addidional Json apis only available for authorised users
        if (Zend_Auth::getInstance()->hasIdentity()) {
            // addidional Tinebase json apis
            $server->setClass('Tinebase_Json_Container', 'Tinebase_Container');

            // application apis
            $userApplications = Zend_Registry::get('currentAccount')->getApplications();
            foreach ($userApplications as $application) {
                $applicationName = ucfirst((string) $application);
                try {
                    $server->setClass($applicationName.'_Json', $applicationName);
                } catch (Exception $e) {
                    // do nothing
                }
            }
        }
            /*
             if (session expired) {
                unset($_REQUEST);
                $_REQUEST['method'] = 'Tinebase.login';
                
                $server = new Tinebase_Http_Server();        
                $server->setClass('Tinebase_Http', 'Tinebase');
                $server->handle($_REQUEST);
                return;
             }
            */ 
         
        $server->handle($_REQUEST);
    }
    
    /**
     * handler for SNOM api requests
     * 
     * @return xml
     */
    public function handleSnom()
    {
        if(isset($_REQUEST['PHPSESSID'])) {
            Zend_Session::setId($_REQUEST['PHPSESSID']);
        }
        
        $this->_initFramework();
        Zend_Registry::get('logger')->debug('is snom xml request. method: ' . (isset($_REQUEST['method']) ? $_REQUEST['method'] : 'EMPTY'));
        
        $server = new Tinebase_Http_Server();
        $server->setClass('Voipmanager_Snom', 'Voipmanager');
                    
        $server->handle($_REQUEST);
    }
    
    /**
     * initializes the logger
     *
     */
    protected function setupLogger()
    {
        $logger = new Zend_Log();
        
        if (isset($this->_config->logger)) {
            try {
                $loggerConfig = $this->_config->logger;
                
                $filename = $loggerConfig->filename;
                $priority = (int)$loggerConfig->priority;
    
                $writer = new Zend_Log_Writer_Stream($filename);
                $logger->addWriter($writer);
    
                $filter = new Zend_Log_Filter_Priority($priority);
                $logger->addFilter($filter);
            } catch (Exception $e) {
                error_log("Tine 2.0 can't setup the configured logger! The Server responded: $e");
                $writer = new Zend_Log_Writer_Null;
                $logger->addWriter($writer);
            }
        } else {
            $writer = new Zend_Log_Writer_Null;
            $logger->addWriter($writer);
        }

        Zend_Registry::set('logger', $logger);

        Zend_Registry::get('logger')->debug(__METHOD__ . '::' . __LINE__ .' logger initialized');
    }
    
    protected function setupCache()
    {
        // create zend cache
        if ($this->_config->caching && $this->_config->caching->active) {
            $frontendOptions = array(
                'cache_id_prefix' => SQL_TABLE_PREFIX,
                'lifetime' => ($this->_config->caching->lifetime) ? $this->_config->caching->lifetime : 7200,
                'automatic_serialization' => true // turn that off for more speed
            );
                        
            $backendType = ($this->_config->caching->backend) ? ucfirst($this->_config->caching->backend) : 'File';
            
            switch ($backendType) {
                case 'File':
                    $backendOptions = array(
                        'cache_dir' => ($this->_config->caching->path) ? $this->_config->caching->path : session_save_path()  // Directory where to put the cache files
                    );
                break;
                case 'Memcached':                        
                    $backendOptions = array(
                        'servers' => array(
                            'host' => ($this->_config->caching->host) ? $this->_config->caching->host : 'localhost',
                            'port' => ($this->_config->caching->port) ? $this->_config->caching->port : 11211,
                            'persistent' => TRUE
                    ));
                break;
            }
        } else {
            $backendType = 'File';
            $frontendOptions = array(
                'caching' => false
            );
            $backendOptions = array(
                'cache_dir' => session_save_path()
            );
        }    

        // getting a Zend_Cache_Core object
        $cache = Zend_Cache::factory('Core', $backendType, $frontendOptions, $backendOptions);
        Zend_Registry::set('cache', $cache);
    }
    
    /**
     * initializes the database connection
     *
     */
    protected function setupDatabaseConnection()
    {
        if (isset($this->_config->database)) {
            $dbConfig = $this->_config->database;
            
            define('SQL_TABLE_PREFIX', $dbConfig->get('tableprefix') ? $dbConfig->get('tableprefix') : 'tine20_');
        
            $dbBackend = constant('self::' . strtoupper($dbConfig->get('backend', self::PDO_MYSQL)));
            
            switch($dbBackend) {
                case self::PDO_MYSQL:
                    $db = Zend_Db::factory('Pdo_Mysql', $dbConfig->toArray());
                    break;
                case self::PDO_OCI:
                    $db = Zend_Db::factory('Pdo_Oci', $dbConfig->toArray());
                    break;
                default:
                    throw new Exception('Invalid database backend type defined. Please set backend to ' . self::PDO_MYSQL . ' or ' . self::PDO_OCI . ' in config.ini.');
                    break;
            }
            
            Zend_Db_Table_Abstract::setDefaultAdapter($db);

            Zend_Registry::set('dbAdapter', $db);
        } else {
            die ('database section not found in central configuration file');
        }
    }
    
    /**
     * sets the user locale
     *
     * @todo $locale = new Zend_Locale('auto');
     */
    protected function setupUserLocale()
    {
        try {
            $locale = new Zend_Locale();
        } catch (Zend_Locale_Exception $e) {
            $locale = new Zend_Locale('en_US');
        }
        Zend_Registry::set('locale', $locale);
    }
    
    /**
     * intializes the timezone handling
     *
     */
    protected function setupTimezones()
    {
        // All server operations are done in UTC
        date_default_timezone_set('UTC');
        
        // Timezone for client
        Zend_Registry::set('userTimeZone', 'Europe/Berlin');
    }

    /**
     * create new user seesion
     *
     * @param string $_username
     * @param string $_password
     * @param string $_ipAddress
     * @return bool
     */
    public function login($_username, $_password, $_ipAddress)
    {
        $authResult = Tinebase_Auth::getInstance()->authenticate($_username, $_password);
        
        if ($authResult->isValid()) {
            $accountsController = Tinebase_User::getInstance();
            try {
                $account = $accountsController->getFullUserByLoginName($authResult->getIdentity());
            } catch (Exception $e) {
                Zend_Session::destroy();
                
                throw new Exception('account ' . $authResult->getIdentity() . ' not found in account storage');
            }
            
            Zend_Registry::set('currentAccount', $account);

            $this->session->currentAccount = $account;
            
            $account->setLoginTime($_ipAddress);
            
            Tinebase_AccessLog::getInstance()->addLoginEntry(
                session_id(),
                $authResult->getIdentity(),
                $_ipAddress,
                $authResult->getCode(),
                Zend_Registry::get('currentAccount')
           );
            
            return true;
        } else {
            Tinebase_AccessLog::getInstance()->addLoginEntry(
                session_id(),
                $_username,
                $_ipAddress,
                $authResult->getCode()
           );
            
            Tinebase_AccessLog::getInstance()->addLogoutEntry(
                session_id(),
                $_ipAddress
           );
            
            Zend_Session::destroy();
            
            sleep(2);
            
            return false;
        }
    }
    
    public function changePassword($_oldPassword, $_newPassword1, $_newPassword2)
    {
        //error_log(print_r(Zend_Registry::get('currentAccount')->toArray(), true));
        $loginName = Zend_Registry::get('currentAccount')->accountLoginName;
        Zend_Registry::get('logger')->debug("change password for $loginName");
        
        if (!Tinebase_Auth::getInstance()->isValidPassword($loginName, $_oldPassword)) {
            throw new Exception('old password worng');
        }
        
        Tinebase_Auth::getInstance()->setPassword($loginName, $_newPassword1, $_newPassword2);
    }
    
    /**
     * destroy session
     *
     * @return void
     */
    public function logout($_ipAddress)
    {
        if (Zend_Registry::isRegistered('currentAccount')) {
            $currentAccount = Zend_Registry::get('currentAccount');
    
            Tinebase_AccessLog::getInstance()->addLogoutEntry(
                session_id(),
                $_ipAddress,
                $currentAccount->accountId
           );
        }
        
        Zend_Session::destroy();
    }   
    
    /**
     * function to initialize the smtp connection
     *
     */
    protected function setupMailer()
    {
        if (isset($this->_config->mail)) {
            $mailConfig = $this->_config->mail;
        } else {
            $mailConfig = new Zend_Config(array(
                'smtpserver' => 'localhost', 
                'port' => 25
           ));
        }
        
        $transport = new Zend_Mail_Transport_Smtp($mailConfig->smtpserver,  $mailConfig->toArray());
        Zend_Mail::setDefaultTransport($transport);
    }
    
    /**
     * gets image info and data
     * 
     * @param  string $_application application which manages the image
     * @param  string $_identifier identifier of image/record
     * @param  string $_location optional additional identifier
     * @return Tinebase_Model_Image
     */
    public function getImage($_application, $_identifier, $_location='')
    {
        $appController = $this->getApplicationInstance($_application);
        if (!method_exists($appController, 'getImage')) {
            throw new Exception("$_application has no getImage function");
        }
        $image = $appController->getImage($_identifier, $_location);
        
        if (!$image instanceof Tinebase_Model_Image) {
            throw new Exception("$_application returned invalid image");
        }
        return $image;
    }
}