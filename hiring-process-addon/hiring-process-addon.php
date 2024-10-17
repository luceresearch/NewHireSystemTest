<?php
/**
 * Plugin Name: Hiring Process Addon for LibreSpeed
 * Description: A comprehensive system test addon for the hiring process
 * Version: 1.0
 * Author: Assistant
 */

if (!defined('ABSPATH')) exit;

require_once(__DIR__ . '/admin.php');

class HiringProcessAddon {
    private $plugin_settings;
    private $admin;

    public function __construct() {
        $this->plugin_settings = get_option('hiring_process_addon_settings', array(
            'webhook_url' => 'https://prod-20.westus.logic.azure.com:443/workflows/2b9f99f269914bd69502208c3e4ec3b7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VH9YLMvQRDRRmEV5yPPqTV8l-grUkaHSl0_2mNCq0Tg',
            'test_duration' => 5,
            'ping_count' => 10,
            'speedtest_url' => 'https://speedtest.luceresearch.com/',
        ));

        $this->admin = new HiringProcessAddonAdmin();
        
        add_action('librespeed_admin_menu', array($this, 'add_librespeed_submenu'));
        add_shortcode('hiring_process_test', array($this, 'hiring_process_test_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function add_librespeed_submenu() {
        add_submenu_page(
            'librespeed',
            'Hiring Process Addon Settings',
            'Hiring Process Addon',
            'manage_options',
            'hiring-process-addon',
            array($this->admin, 'settings_page')
        );
    }

    public function enqueue_scripts() {
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        wp_enqueue_style('hiring-process-addon-style', plugins_url('hiring-process-addon.css', __FILE__));
        wp_enqueue_script('hiring-process-addon-script', plugins_url('hiring-process-addon.js', __FILE__), array('jquery'), '1.0', true);
        wp_localize_script('hiring-process-addon-script', 'hiringProcessAddonSettings', $this->plugin_settings);
    }

    public function hiring_process_test_shortcode($atts) {
        ob_start();
        ?>
        <div id="hiring-process-test">
            <h1>Comprehensive Bandwidth & System Test for Hiring Process</h1>
            <p>This application collects detailed system information, including geolocation, bandwidth, and device specifics to evaluate if your environment is suitable for the hiring process. By using this page, you agree to share these details for assessment purposes.</p>

            <div class="section">
                <h2><i class="fas fa-user info-icon"></i> Applicant Information</h2>
                <form id="applicant-form">
                    <label for="name">Full Name:</label>
                    <input type="text" id="name" name="name" required placeholder="Enter your full name">

                    <label for="email">Email Address:</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email address">

                    <label for="address-input">Street Address:</label>
                    <input type="text" id="address-input" name="address" required placeholder="Enter your street address">

                    <label for="city">City:</label>
                    <input type="text" id="city" name="city" required placeholder="Enter your city">

                    <label for="state">State/Province:</label>
                    <input type="text" id="state" name="state" required placeholder="Enter your state or province">

                    <label for="zip">ZIP/Postal Code:</label>
                    <input type="text" id="zip" name="zip" required placeholder="Enter your ZIP or postal code">

                    <label for="phone">Phone Number:</label>
                    <input type="text" id="phone" name="phone" required placeholder="Enter your phone number">

                    <button type="button" onclick="beginTest()">Begin Comprehensive Test</button>
                </form>
            </div>

            <div id="progress-container" class="section" style="display: none;">
                <h2><i class="fas fa-tasks info-icon"></i> Test Progress</h2>
                <p id="progress-message">Initializing tests...</p>
                <div class="progress-bar">
                    <div id="progress-bar-inner" class="progress-bar-inner">0%</div>
                </div>
            </div>

            <div id="system-info-container" class="section" style="display: none;">
                <h2><i class="fas fa-laptop info-icon"></i> System Information</h2>
                <pre id="system-info"></pre>
            </div>

            <div id="completion-message" class="section" style="display: none;">
                <h2><i class="fas fa-check-circle info-icon"></i> Test Complete</h2>
                <p>Thank you for completing the comprehensive system test. Our team will review the results and contact you soon with further instructions.</p>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
}

$hiring_process_addon = new HiringProcessAddon();
