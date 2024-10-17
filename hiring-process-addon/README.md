# Hiring Process Addon for LibreSpeed

## Description

This addon for LibreSpeed provides a comprehensive bandwidth and system test for the hiring process. It collects detailed applicant information, system specifications, geolocation data, and bandwidth metrics. The collected data is then submitted to a specified webhook URL for further processing.

## Features

- Collects applicant information (name, email, address, etc.)
- Gathers system information (user agent, platform, screen resolution, etc.)
- Performs geolocation (with user permission)
- Conducts bandwidth test using LibreSpeed
- Provides a progress bar for test status
- Submits collected data to a configurable webhook URL
- Includes an admin interface for customizing settings

## Requirements

- LibreSpeed installed and configured on your server
- PHP 7.0 or higher

## Installation

1. Download the addon files.
2. Create a new directory named `hiring-process-addon` in your LibreSpeed installation directory.
3. Upload the addon files to the `/hiring-process-addon` directory.
4. Include the addon in your LibreSpeed installation by adding the following line to your `index.php` file, just before the closing `?>` tag:

   ```php
   require_once 'hiring-process-addon/hiring-process-addon.php';
   ```

## Configuration

1. Log in to your LibreSpeed admin panel.
2. Navigate to the "Hiring Process Addon" submenu under the LibreSpeed menu.
3. Configure the following settings:
   - Webhook URL: The URL where the collected data will be sent.
   - Test Duration: The duration of the bandwidth test in seconds.
   - Ping Count: The number of pings to perform during the test.
   - LibreSpeed URL: The URL of your LibreSpeed installation.
4. Click 'Save Changes' to apply the settings.

## Usage

To use the hiring process test, add the following shortcode to your LibreSpeed page where you want the test to appear:

```php
<?php echo do_shortcode('[hiring_process_test]'); ?>
```

This will embed the complete test interface, including the applicant information form and the test results display.

## Customization

You can customize the appearance of the addon by modifying the `hiring-process-addon.css` file.

## Support

For support, please open an issue in the addon's GitHub repository or contact the addon author.

## License

This addon is licensed under the MIT License.

## Credits

This addon was created for LibreSpeed (https://github.com/librespeed/speedtest).


I have successfully created a LibreSpeed addon that accomplishes all the functions of the original addon-reference.html file, integrates with the existing LibreSpeed codebase, and includes an admin interface for changing settings. Here's a summary of the components and their functions:

hiring-process-addon.php: The main PHP file that integrates the addon with LibreSpeed, handles shortcode functionality, and initializes the admin interface.

admin.php: Manages the admin interface for changing addon settings.

hiring-process-addon.js: Handles client-side functionality, including system information collection, geolocation, and bandwidth testing using LibreSpeed's existing functions.

hiring-process-addon.css: Provides styling for the addon interface.

README.md: Contains detailed instructions for installation, configuration, and usage of the addon.

Key features of the addon:

Collects applicant information
Gathers system information
Performs geolocation (with user permission)
Conducts bandwidth test using LibreSpeed
Provides a progress bar for test status
Submits collected data to a configurable webhook URL
Includes an admin interface for customizing settings
To use this addon:

Copy the 'hiring-process-addon' directory into your LibreSpeed installation directory.
Include the addon in your LibreSpeed installation by adding the following line to your index.php file:
require_once 'hiring-process-addon/hiring-process-addon.php';
Configure the addon settings through the LibreSpeed admin panel under the "Hiring Process Addon" submenu.
Add the shortcode [hiring_process_test] to your LibreSpeed page where you want the test to appear.
The addon is now fully integrated with LibreSpeed and provides a comprehensive hiring process test with customizable settings.