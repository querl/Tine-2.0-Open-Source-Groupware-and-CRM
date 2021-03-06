<?php
/**
 * Tine 2.0 - http://www.tine20.org
 * 
 * @package     Addressbook
 * @license     http://www.gnu.org/licenses/agpl.html
 * @copyright   Copyright (c) 2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @author      Lars Kneschke <l.kneschke@metaways.de>
 */

/**
 * Test helper
 */
require_once dirname(dirname(dirname(__FILE__))) . DIRECTORY_SEPARATOR . 'TestHelper.php';

if (!defined('PHPUnit_MAIN_METHOD')) {
    define('PHPUnit_MAIN_METHOD', 'Tinebase_Filesystem_StreamWrapperTest::main');
}

/**
 * Test class for Tinebase_User
 */
class Tinebase_Filesystem_StreamWrapperTest extends PHPUnit_Framework_TestCase
{
    /**
     * @var array test objects
     */
    protected $objects = array();

    /**
     * Runs the test methods of this class.
     *
     * @access public
     * @static
     */
    public static function main()
    {
		$suite  = new PHPUnit_Framework_TestSuite('Tine 2.0 filesystem streamwrapper tests');
        PHPUnit_TextUI_TestRunner::run($suite);
	}

    /**
     * Sets up the fixture.
     * This method is called before a test is executed.
     *
     * @access protected
     */
    protected function setUp()
    {
        if (empty(Tinebase_Core::getConfig()->filesdir)) {
            $this->markTestSkipped('filesystem base path not found');
        }
        
        $this->_basePath   = 'tine20:///' . Tinebase_Application::getInstance()->getApplicationByName('Tinebase')->getId() . '/internal/phpunit';
        
        $this->objects['directories'] = array();
    }

    /**
     * Tears down the fixture
     * This method is called after a test is executed.
     *
     * @access protected
     */
    protected function tearDown()
    {
        if (substr($this->_basePath, 0, 9) == 'tine20://') {
            $this->_rmdir($this->_basePath);
        }
    }
    
    protected function _rmdir($_path)
    {
        if ($dir = opendir($_path)) {
            while (($element = readdir($dir)) !== false) { 
                $path = $_path . '/' . $element;
                
                if (is_dir($path)) {
                    $this->_rmdir($path);
                } else {
                    unlink($path);
                }
            }
        }
        rmdir($_path);
        
        closedir($dir);
    }
    
    public function testMkdir()
    {
        $testPath = $this->_basePath . '/PHPUNIT-VIA-STREAM';
        
        mkdir($testPath, 0777, true);
        
        $this->objects['directories']['streampath'] = $testPath;
        
        $this->assertTrue(file_exists($testPath), 'path created by mkdir not found');
        $this->assertTrue(is_dir($testPath)     , 'path created by mkdir is not a directory');
        
        return $testPath;
    }
    
    public function testRmdir()
    {
        $path = $this->testMkdir();

        $result = rmdir($path);
        clearstatcache();
        
        unset($this->objects['directories']['streampath']);
        
        $this->assertTrue($result, 'wrong result for rmdir command');
        $this->assertFalse(file_exists($path), 'failed to delete directory');
    }
    
    public function testCreateFile()
    {
        $testPath = $this->testMkdir()  . '/phpunit.txt';
        
        $fp = fopen($testPath, 'x');
        fwrite($fp, 'phpunit');
        fclose($fp);
        
        $this->assertTrue(file_exists($testPath) ,  'failed to create file');
        $this->assertTrue(is_file($testPath)     ,  'path created by mkdir is not a directory');
        $this->assertEquals(7, filesize($testPath), 'failed to write content to file');
    }
    
    public function testReadFile()
    {
        $testPath = $this->testMkdir()  . '/phpunit.txt';
        
        $fp = fopen($testPath, 'x');
        fwrite($fp, 'phpunit');
        fclose($fp);

        $fp = fopen($testPath, 'r');
        $content = fread($fp, 1024);
        fclose($fp);
        
        $this->assertEquals('phpunit', $content, 'failed to read content from file');
    }
    
    public function testUpdateFile()
    {
        $testPath = $this->testMkdir()  . '/phpunit.txt';
        
        file_put_contents($testPath, 'phpunit');
        
        file_put_contents($testPath, 'phpunit2');
        
        $this->assertTrue(file_exists($testPath) ,  'failed to create file');
        $this->assertTrue(is_file($testPath)     ,  'path created by mkdir is not a directory');
        $this->assertEquals(8, filesize($testPath), 'failed to write content to file');
    }
    
    public function testScandir()
    {
        $testPath = $this->testMkdir();
        $this->testCreateFile();
        
        $children = scandir($testPath);
        
        $this->assertTrue(in_array('phpunit.txt', $children));
    }
    
    public function testRename()
    {
        $testPath = $this->testMkdir();        
        $this->testCreateFile();
        
        $testPath2 = $testPath . '/RENAMED';
        mkdir($testPath2, 0777, true);
        
        $children = scandir($testPath);
        
        rename($testPath . '/phpunit.txt', $testPath2 . '/phpunit2.txt');
        
        $children = scandir($testPath2);
        
        $this->assertTrue(in_array('phpunit2.txt', $children));
    }
}		
	

if (PHPUnit_MAIN_METHOD == 'Tinebase_Filesystem_StreamWrapperTest::main') {
    Tinebase_Filesystem_StreamWrapperTest::main();
}
