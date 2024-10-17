<?php
if (!defined('ABSPATH')) exit;

class HiringProcessAddonAdmin {
    private $settings;

    public function __construct() {
        $this->settings = $this->get_settings();
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_admin_menu() {
        add_submenu_page(
            'settings.php',
            'Hiring Process Addon Settings',
            'Hiring Process Addon',
            'manage_options',
            'hiring-process-addon',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('hiring_process_addon_settings', 'hiring_process_addon_settings', array($this, 'sanitize_settings'));
    }

    public function sanitize_settings($input) {
        $sanitized_input = array();
        $sanitized_input['webhook_url'] = esc_url_raw($input['webhook_url']);
        $sanitized_input['test_duration'] = intval($input['test_duration']);
        $sanitized_input['ping_count'] = intval($input['ping_count']);
        return $sanitized_input;
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>Hiring Process Addon Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('hiring_process_addon_settings');
                do_settings_sections('hiring-process-addon');
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Webhook URL</th>
                        <td><input type="text" name="hiring_process_addon_settings[webhook_url]" value="<?php echo esc_attr($this->settings['webhook_url']); ?>" class="regular-text" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Test Duration (seconds)</th>
                        <td><input type="number" name="hiring_process_addon_settings[test_duration]" value="<?php echo esc_attr($this->settings['test_duration']); ?>" min="1" max="30" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Ping Count</th>
                        <td><input type="number" name="hiring_process_addon_settings[ping_count]" value="<?php echo esc_attr($this->settings['ping_count']); ?>" min="1" max="50" /></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    private function get_settings() {
        return get_option('hiring_process_addon_settings', array(
            'webhook_url' => 'https://prod-20.westus.logic.azure.com:443/workflows/2b9f99f269914bd69502208c3e4ec3b7/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VH9YLMvQRDRRmEV5yPPqTV8l-grUkaHSl0_2mNCq0Tg',
            'test_duration' => 5,
            'ping_count' => 10,
        ));
    }
}

$hiring_process_addon_admin = new HiringProcessAddonAdmin();
