<?php
/**
 * Astra functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Astra
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Define Constants
 */
define( 'ASTRA_THEME_VERSION', '4.11.8' );
define( 'ASTRA_THEME_SETTINGS', 'astra-settings' );
define( 'ASTRA_THEME_DIR', trailingslashit( get_template_directory() ) );
define( 'ASTRA_THEME_URI', trailingslashit( esc_url( get_template_directory_uri() ) ) );
define( 'ASTRA_THEME_ORG_VERSION', file_exists( ASTRA_THEME_DIR . 'inc/w-org-version.php' ) );

/**
 * Minimum Version requirement of the Astra Pro addon.
 * This constant will be used to display the notice asking user to update the Astra addon to the version defined below.
 */
define( 'ASTRA_EXT_MIN_VER', '4.11.6' );

/**
 * Load in-house compatibility.
 */
if ( ASTRA_THEME_ORG_VERSION ) {
	require_once ASTRA_THEME_DIR . 'inc/w-org-version.php';
}

/**
 * Setup helper functions of Astra.
 */
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-theme-options.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-theme-strings.php';
require_once ASTRA_THEME_DIR . 'inc/core/common-functions.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-icons.php';

define( 'ASTRA_WEBSITE_BASE_URL', 'https://wpastra.com' );

/**
 * ToDo: Deprecate constants in future versions as they are no longer used in the codebase.
 */
define( 'ASTRA_PRO_UPGRADE_URL', ASTRA_THEME_ORG_VERSION ? astra_get_pro_url( '/pricing/', 'free-theme', 'dashboard', 'upgrade' ) : 'https://woocommerce.com/products/astra-pro/' );
define( 'ASTRA_PRO_CUSTOMIZER_UPGRADE_URL', ASTRA_THEME_ORG_VERSION ? astra_get_pro_url( '/pricing/', 'free-theme', 'customizer', 'upgrade' ) : 'https://woocommerce.com/products/astra-pro/' );

/**
 * Update theme
 */
require_once ASTRA_THEME_DIR . 'inc/theme-update/astra-update-functions.php';
require_once ASTRA_THEME_DIR . 'inc/theme-update/class-astra-theme-background-updater.php';

/**
 * Fonts Files
 */
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-font-families.php';
if ( is_admin() ) {
	require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-fonts-data.php';
}

require_once ASTRA_THEME_DIR . 'inc/lib/webfont/class-astra-webfont-loader.php';
require_once ASTRA_THEME_DIR . 'inc/lib/docs/class-astra-docs-loader.php';
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-fonts.php';

require_once ASTRA_THEME_DIR . 'inc/dynamic-css/custom-menu-old-header.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/container-layouts.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/astra-icons.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-walker-page.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-enqueue-scripts.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-gutenberg-editor-css.php';
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-wp-editor-css.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/block-editor-compatibility.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/inline-on-mobile.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/content-background.php';
require_once ASTRA_THEME_DIR . 'inc/dynamic-css/dark-mode.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-dynamic-css.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-global-palette.php';

// Enable NPS Survey only if the starter templates version is < 4.3.7 or > 4.4.4 to prevent fatal error.
if ( ! defined( 'ASTRA_SITES_VER' ) || version_compare( ASTRA_SITES_VER, '4.3.7', '<' ) || version_compare( ASTRA_SITES_VER, '4.4.4', '>' ) ) {
	// NPS Survey Integration
	require_once ASTRA_THEME_DIR . 'inc/lib/class-astra-nps-notice.php';
	require_once ASTRA_THEME_DIR . 'inc/lib/class-astra-nps-survey.php';
}

/**
 * Custom template tags for this theme.
 */
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-attr.php';
require_once ASTRA_THEME_DIR . 'inc/template-tags.php';

require_once ASTRA_THEME_DIR . 'inc/widgets.php';
require_once ASTRA_THEME_DIR . 'inc/core/theme-hooks.php';
require_once ASTRA_THEME_DIR . 'inc/admin-functions.php';
require_once ASTRA_THEME_DIR . 'inc/core/sidebar-manager.php';

/**
 * Markup Functions
 */
require_once ASTRA_THEME_DIR . 'inc/markup-extras.php';
require_once ASTRA_THEME_DIR . 'inc/extras.php';
require_once ASTRA_THEME_DIR . 'inc/blog/blog-config.php';
require_once ASTRA_THEME_DIR . 'inc/blog/blog.php';
require_once ASTRA_THEME_DIR . 'inc/blog/single-blog.php';

/**
 * Markup Files
 */
require_once ASTRA_THEME_DIR . 'inc/template-parts.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-loop.php';
require_once ASTRA_THEME_DIR . 'inc/class-astra-mobile-header.php';

/**
 * Functions and definitions.
 */
require_once ASTRA_THEME_DIR . 'inc/class-astra-after-setup-theme.php';

// Required files.
require_once ASTRA_THEME_DIR . 'inc/core/class-astra-admin-helper.php';

require_once ASTRA_THEME_DIR . 'inc/schema/class-astra-schema.php';

/* Setup API */
require_once ASTRA_THEME_DIR . 'admin/includes/class-astra-api-init.php';

if ( is_admin() ) {
	/**
	 * Admin Menu Settings
	 */
	require_once ASTRA_THEME_DIR . 'inc/core/class-astra-admin-settings.php';
	require_once ASTRA_THEME_DIR . 'admin/class-astra-admin-loader.php';
	require_once ASTRA_THEME_DIR . 'inc/lib/astra-notices/class-astra-notices.php';
}

/**
 * Metabox additions.
 */
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-meta-boxes.php';
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-meta-box-operations.php';
require_once ASTRA_THEME_DIR . 'inc/metabox/class-astra-elementor-editor-settings.php';

/**
 * Customizer additions.
 */
require_once ASTRA_THEME_DIR . 'inc/customizer/class-astra-customizer.php';

/**
 * Astra Modules.
 */
require_once ASTRA_THEME_DIR . 'inc/modules/posts-structures/class-astra-post-structures.php';
require_once ASTRA_THEME_DIR . 'inc/modules/related-posts/class-astra-related-posts.php';

/**
 * Compatibility
 */
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-gutenberg.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-jetpack.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/woocommerce/class-astra-woocommerce.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/edd/class-astra-edd.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/lifterlms/class-astra-lifterlms.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/learndash/class-astra-learndash.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-beaver-builder.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-bb-ultimate-addon.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-contact-form-7.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-visual-composer.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-site-origin.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-gravity-forms.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-bne-flyout.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-ubermeu.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-divi-builder.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-amp.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-yoast-seo.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/surecart/class-astra-surecart.php';
require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-starter-content.php';
require_once ASTRA_THEME_DIR . 'inc/addons/transparent-header/class-astra-ext-transparent-header.php';
require_once ASTRA_THEME_DIR . 'inc/addons/breadcrumbs/class-astra-breadcrumbs.php';
require_once ASTRA_THEME_DIR . 'inc/addons/scroll-to-top/class-astra-scroll-to-top.php';
require_once ASTRA_THEME_DIR . 'inc/addons/heading-colors/class-astra-heading-colors.php';
require_once ASTRA_THEME_DIR . 'inc/builder/class-astra-builder-loader.php';

// Elementor Compatibility requires PHP 5.4 for namespaces.
if ( version_compare( PHP_VERSION, '5.4', '>=' ) ) {
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-elementor.php';
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-elementor-pro.php';
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-web-stories.php';
}

// Beaver Themer compatibility requires PHP 5.3 for anonymous functions.
if ( version_compare( PHP_VERSION, '5.3', '>=' ) ) {
	require_once ASTRA_THEME_DIR . 'inc/compatibility/class-astra-beaver-themer.php';
}

require_once ASTRA_THEME_DIR . 'inc/core/markup/class-astra-markup.php';

/**
 * Load deprecated functions
 */
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-filters.php';
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-hooks.php';
require_once ASTRA_THEME_DIR . 'inc/core/deprecated/deprecated-functions.php';

// ------------------------------------------custom Apis------------------------------------abstract


// Add this code to your theme's functions.php file

// Register a custom REST API endpoint to fetch slider data from Elementor carousel
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/main-slider-data', array(
        'methods' => 'GET',
        'callback' => 'get_elementor_slider_data',
        'permission_callback' => '__return_true', // Adjust permissions as needed
    ));
});

// Callback function to extract slider data from Elementor page
function get_elementor_slider_data(WP_REST_Request $request) {
    // Target page ID (from the query, it's page ID 8)
    $page_id = 8;
    
    // Get Elementor data from post meta
    $elementor_data = get_post_meta($page_id, '_elementor_data', true);
    
    if (empty($elementor_data)) {
        return new WP_Error('no_data', 'No Elementor data found for this page.', array('status' => 404));
    }
    
    // Decode the JSON data
    $data = json_decode($elementor_data, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('invalid_json', 'Invalid Elementor JSON data.', array('status' => 500));
    }
    
    // Function to recursively find the image carousel widget
    function find_carousel_widget($elements, &$slider_data = array()) {
        foreach ($elements as $element) {
            if (isset($element['widgetType']) && $element['widgetType'] === 'image-carousel') {
                // Extract carousel images
                if (isset($element['settings']['carousel'])) {
                    $slider_data = $element['settings']['carousel'];
                    return true; // Stop once found
                }
            }
            if (isset($element['elements']) && !empty($element['elements'])) {
                if (find_carousel_widget($element['elements'], $slider_data)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    $slider_data = array();
    find_carousel_widget($data, $slider_data);
    
    if (empty($slider_data)) {
        return new WP_Error('no_carousel', 'No image carousel found in Elementor data.', array('status' => 404));
    }
    
    // Extract image URLs or relevant data
    $images = array();
    foreach ($slider_data as $slide) {
        if (isset($slide['url'])) {
            $images[] = array(
                'url' => $slide['url'],
                'alt' => isset($slide['alt']) ? $slide['alt'] : '',
                'title' => isset($slide['title']) ? $slide['title'] : '',
            );
        }
    }
    
    return array(
        'page_id' => $page_id,
        'images' => $images,
    );
}



// Add this code to your theme's functions.php file

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/static-banners', array(
        'methods' => 'GET',
        'callback' => 'get_elementor_banners_dom',
        'permission_callback' => '__return_true',
    ));
});

function get_elementor_banners_dom() {
    $page_id = 8; // Elementor page ID
    $page = get_post($page_id);

    if (!$page) {
        return new WP_Error('no_page', 'Page not found', array('status' => 404));
    }

    // Render the full content (important for Elementor pages)
    $content = apply_filters('the_content', $page->post_content);

    // Load rendered content into DOMDocument
    $dom = new DOMDocument();
    libxml_use_internal_errors(true); // Suppress parsing errors
    $dom->loadHTML('<?xml encoding="utf-8" ?>' . $content);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);

    $banners = [];

    // Query containers with staticbannersect attribute
    $containers = $xpath->query('//div[@staticbannersect]');

    foreach ($containers as $container) {
        // Find all CTA divs within this container
        $cta_divs = $xpath->query('.//div[contains(@class, "elementor-cta")]', $container);

        foreach ($cta_divs as $cta) {
            // Extract background image from style
            $bg_div = $xpath->query('.//div[contains(@class, "elementor-cta__bg")]', $cta);
            $image_url = '';
            if ($bg_div->length > 0) {
                $style = $bg_div->item(0)->getAttribute('style');
                preg_match('/url\((.*?)\)/', $style, $urlMatch);
                $image_url = $urlMatch[1] ?? '';
            }

            // Extract title
            $title_node = $xpath->query('.//h4[contains(@class, "elementor-cta__title")]', $cta);
            $title = $title_node->length > 0 ? trim($title_node->item(0)->textContent) : '';

            // Extract description
            $desc_node = $xpath->query('.//div[contains(@class, "elementor-cta__description")]', $cta);
            $description = $desc_node->length > 0 ? trim($desc_node->item(0)->textContent) : '';

            // Extract button
            $button_node = $xpath->query('.//a[contains(@class, "elementor-cta__button")]', $cta);
            $button = array(
                'text' => $button_node->length > 0 ? trim($button_node->item(0)->textContent) : '',
                'href' => $button_node->length > 0 ? $button_node->item(0)->getAttribute('href') : ''
            );

            if ($title || $description || $image_url) {
                $banners[] = [
                    'background' => $image_url,
                    'title' => $title,
                    'description' => $description,
                    'button' => $button
                ];
            }
        }
    }

    if (empty($banners)) {
        return new WP_Error('no_banners', 'No static banners found', array('status' => 404));
    }

    return $banners;
}



/*
Plugin Name: Product Chat REST API (Private Threads)
Description: Private chat system between customers and admin for products, with unread counter.
Version: 2.4
Author: Your Name
*/

if ( ! defined( 'ABSPATH' ) ) exit;

// ---------------- CREATE TABLE ----------------
function pc_chat_create_table() {
    global $wpdb;
    $table_name      = $wpdb->prefix . 'product_chat';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        conversation_id VARCHAR(255) NOT NULL,
        product_id BIGINT(20) NOT NULL,
        user_id BIGINT(20) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY conversation_id (conversation_id),
        KEY product_id (product_id),
        KEY user_id (user_id)
    ) {$charset_collate};";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}

register_activation_hook( __FILE__, 'pc_chat_create_table' );

add_action( 'init', function(){
    global $wpdb;
    $table_name = $wpdb->prefix . 'product_chat';
    $exists = $wpdb->get_var( $wpdb->prepare( "SHOW TABLES LIKE %s", $wpdb->esc_like( $table_name ) ) );
    if ( $exists !== $table_name ) pc_chat_create_table();
});

// ---------------- REGISTER REST ROUTES ----------------
add_action('rest_api_init', function() {
    $namespace = 'product-chat/v1';

    // Send message
    register_rest_route($namespace, '/send', [
        'methods' => 'POST',
        'callback' => 'pc_chat_send_message',
        'permission_callback' => '__return_true',
    ]);

    // Fetch messages for a conversation
    register_rest_route($namespace, '/fetch', [
        'methods' => 'GET',
        'callback' => 'pc_chat_fetch_conversation_messages',
        'permission_callback' => '__return_true',
    ]);

    // Mark messages as read
    register_rest_route($namespace, '/mark-read', [
        'methods' => 'POST',
        'callback' => 'pc_chat_mark_read',
        'permission_callback' => '__return_true',
    ]);

    // Optimized: fetch all conversations for sidebar
    register_rest_route($namespace, '/conversations', [
        'methods' => 'GET',
        'callback' => 'pc_chat_fetch_all_conversations',
        'permission_callback' => '__return_true',
    ]);
});

// ---------------- HANDLERS ----------------

// Send message
function pc_chat_send_message( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'product_chat';

    $product_id  = intval($request->get_param('product_id') ?? 0);
    $customer_id = intval($request->get_param('customer_id') ?? 0);
    $message     = sanitize_textarea_field($request->get_param('message') ?? '');
    $sender_id   = intval($request->get_param('sender_id') ?? 0);

    if (!$product_id || !$customer_id || !$sender_id || !$message) {
        return new WP_REST_Response(['success'=>false,'error'=>'product_id, customer_id, sender_id and message are required'],400);
    }

    $conversation_id = "{$customer_id}-{$product_id}";

    $inserted = $wpdb->insert($table, [
        'conversation_id' => $conversation_id,
        'product_id'      => $product_id,
        'user_id'         => $sender_id,
        'message'         => $message,
        'is_read'         => 0,
        'created_at'      => current_time('mysql'),
    ], ['%s','%d','%d','%s','%d','%s']);

    if ($inserted === false) {
        return new WP_REST_Response(['success'=>false,'error'=>'DB insert failed: '.$wpdb->last_error],500);
    }

    return new WP_REST_Response(['success'=>true,'data'=>['id'=>$wpdb->insert_id,'conversation_id'=>$conversation_id]],200);
}

// Fetch messages for a conversation
function pc_chat_fetch_conversation_messages( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'product_chat';

    $product_id  = intval($request->get_param('product_id') ?? 0);
    $customer_id = intval($request->get_param('customer_id') ?? 0);
    if (!$product_id || !$customer_id) return new WP_REST_Response(['success'=>false,'error'=>'product_id and customer_id required'],400);

    $conversation_id = "{$customer_id}-{$product_id}";

    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT c.id, c.message, c.created_at, c.user_id, c.is_read, u.display_name AS user_name
         FROM {$table} c
         LEFT JOIN {$wpdb->users} u ON c.user_id=u.ID
         WHERE c.conversation_id=%s
         ORDER BY c.created_at ASC",
        $conversation_id
    ), ARRAY_A);

    return new WP_REST_Response($results,200);
}

// Mark messages as read
function pc_chat_mark_read( WP_REST_Request $request ) {
    global $wpdb;
    $table = $wpdb->prefix . 'product_chat';

    $product_id  = intval($request->get_param('product_id') ?? 0);
    $customer_id = intval($request->get_param('customer_id') ?? 0);
    if (!$product_id || !$customer_id) return new WP_REST_Response(['success'=>false,'error'=>'product_id and customer_id required'],400);

    $conversation_id = "{$customer_id}-{$product_id}";

    $updated = $wpdb->update($table, ['is_read'=>1], ['conversation_id'=>$conversation_id], ['%d'], ['%s']);
    if ($updated===false) return new WP_REST_Response(['success'=>false,'error'=>'DB update failed: '.$wpdb->last_error],500);

    return new WP_REST_Response(['success'=>true,'updated_rows'=>intval($updated)],200);
}

// ---------------- FAST CONVERSATION SUMMARY ----------------
function pc_chat_fetch_all_conversations() {
    global $wpdb;
    $table = $wpdb->prefix . 'product_chat';

    // Fetch last message and unread count per product × customer
    $sql = "
        SELECT product_id, conversation_id, 
               SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC SEPARATOR '|||'), '|||', 1) as last_message,
               SUM(CASE WHEN is_read=0 AND user_id!=1 THEN 1 ELSE 0 END) as unread_count,
               MAX(created_at) as last_message_time
        FROM {$table}
        GROUP BY product_id, conversation_id
        ORDER BY last_message_time DESC
        LIMIT 200
    ";

    $results = $wpdb->get_results($sql, ARRAY_A);

    return new WP_REST_Response($results,200);
}




/*
Plugin Name: Product Chat User API
Description: REST API for chat users login, registration, and password management.
Version: 1.2
Author: Your Name
*/

if (!defined('ABSPATH')) exit;

// -----------------------------------------------------------
// 1. Create chat users table with wp_chat_user prefix
function wp_chat_user_create_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'chat_user'; // wp_chat_user
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) {$charset_collate};";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);

    // Insert default user if not exists
    $exists = $wpdb->get_var("SELECT id FROM {$table_name} WHERE username='admin'");
    if (!$exists) {
        $wpdb->insert($table_name, [
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'email'    => 'admin@example.com'
        ]);
    }
}

// Activation hook
register_activation_hook(__FILE__, 'wp_chat_user_create_table');

// Ensure table exists on every init
add_action('init', function() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'chat_user';
    $exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $wpdb->esc_like($table_name)));
    if ($exists !== $table_name) {
        wp_chat_user_create_table();
        error_log("wp_chat_user table created.");
    }
});

// -----------------------------------------------------------
// 2. REST API routes
add_action('rest_api_init', function() {
    $namespace = 'chat-user/v1';

    register_rest_route($namespace, '/login', [
        'methods' => 'POST',
        'callback' => 'wp_chat_user_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($namespace, '/change-password', [
        'methods' => 'POST',
        'callback' => 'wp_chat_user_change_password',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route($namespace, '/register', [
        'methods' => 'POST',
        'callback' => 'wp_chat_user_register',
        'permission_callback' => '__return_true',
    ]);
});

// -----------------------------------------------------------
// 3. API Handlers

function wp_chat_user_login(WP_REST_Request $request) {
    global $wpdb;
    $table = $wpdb->prefix . 'chat_user';

    $username = sanitize_text_field($request->get_param('username'));
    $password = sanitize_text_field($request->get_param('password'));

    if (!$username || !$password) return new WP_REST_Response(['success'=>false,'error'=>'Username and password required'],400);

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE username=%s", $username));

    if (!$user || !password_verify($password, $user->password)) {
        return new WP_REST_Response(['success'=>false,'error'=>'Invalid credentials'],401);
    }

    $token = base64_encode($user->id . '|' . wp_generate_password(20,false));

    return new WP_REST_Response([
        'success'=>true,
        'data'=>[
            'id'=>$user->id,
            'username'=>$user->username,
            'email'=>$user->email,
            'token'=>$token
        ]
    ],200);
}

function wp_chat_user_change_password(WP_REST_Request $request) {
    global $wpdb;
    $table = $wpdb->prefix . 'chat_user';

    $username    = sanitize_text_field($request->get_param('username'));
    $old_password = sanitize_text_field($request->get_param('old_password'));
    $new_password = sanitize_text_field($request->get_param('new_password'));

    if (!$username || !$old_password || !$new_password) {
        return new WP_REST_Response(['success'=>false,'error'=>'All fields required'],400);
    }

    $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$table} WHERE username=%s", $username));
    if (!$user || !password_verify($old_password, $user->password)) {
        return new WP_REST_Response(['success'=>false,'error'=>'Invalid old password'],401);
    }

    $updated = $wpdb->update($table, [
        'password'=>password_hash($new_password,PASSWORD_DEFAULT)
    ], ['id'=>$user->id], ['%s'], ['%d']);

    if ($updated===false) return new WP_REST_Response(['success'=>false,'error'=>'DB update failed'],500);

    return new WP_REST_Response(['success'=>true,'message'=>'Password changed successfully'],200);
}

function wp_chat_user_register(WP_REST_Request $request) {
    global $wpdb;
    $table = $wpdb->prefix . 'chat_user';

    $username = sanitize_text_field($request->get_param('username'));
    $password = sanitize_text_field($request->get_param('password'));
    $email    = sanitize_email($request->get_param('email'));

    if (!$username || !$password || !$email) return new WP_REST_Response(['success'=>false,'error'=>'All fields required'],400);

    $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$table} WHERE username=%s",$username));
    if ($exists) return new WP_REST_Response(['success'=>false,'error'=>'Username already exists'],400);

    $inserted = $wpdb->insert($table,[
        'username'=>$username,
        'password'=>password_hash($password,PASSWORD_DEFAULT),
        'email'=>$email
    ], ['%s','%s','%s']);

    if ($inserted===false) return new WP_REST_Response(['success'=>false,'error'=>'DB insert failed'],500);

    return new WP_REST_Response(['success'=>true,'message'=>'User registered successfully','user_id'=>$wpdb->insert_id],200);
}


// ------------------------------------------ Razorpay API for Mobile App ------------------------------------

/**
 * Register custom REST API endpoints for Razorpay.
 */
add_action('rest_api_init', function () {
    // Endpoint to create a Razorpay order
    register_rest_route('my-app/v1', '/create-razorpay-order', array(
        'methods' => 'POST',
        'callback' => 'create_razorpay_order_for_app',
        'permission_callback' => 'is_user_logged_in' // SECURITY: Only logged-in users can create orders.
    ));

    // Endpoint to verify the payment after completion
    register_rest_route('my-app/v1', '/verify-payment', array(
        'methods' => 'POST',
        'callback' => 'verify_razorpay_payment_for_app',
        'permission_callback' => 'is_user_logged_in' // SECURITY: Only logged-in users can verify payments.
    ));
});

/**
 * Callback function to create a Razorpay order.
 *
 * @param WP_REST_Request $request The request object.
 * @return WP_REST_Response|WP_Error The response object.
 */
function create_razorpay_order_for_app($request) {
    // 1. Get data from your app (amount should be sent from your app)
    $params = $request->get_json_params();
    $order_total = isset($params['amount']) ? floatval($params['amount']) : 0;

    if ($order_total <= 0) {
        return new WP_Error('invalid_amount', 'Invalid order amount.', array('status' => 400));
    }

    // Ensure the Razorpay SDK is loaded from the WooCommerce plugin
    if (!class_exists('Razorpay\Api\Api')) {
        $razorpay_plugin_path = WP_PLUGIN_DIR . '/razorpay-for-woocommerce/razorpay-php/Razorpay.php';
        if (file_exists($razorpay_plugin_path)) {
            require_once($razorpay_plugin_path);
        } else {
             return new WP_Error('razorpay_sdk_missing', 'Razorpay SDK not found.', array('status' => 500));
        }
    }

    // Get your Razorpay keys from the WooCommerce settings
    $razorpay_settings = get_option('woocommerce_razorpay_settings');
    if (empty($razorpay_settings) || !isset($razorpay_settings['key_id']) || !isset($razorpay_settings['key_secret'])) {
        return new WP_Error('razorpay_keys_missing', 'Razorpay API keys are not configured in WooCommerce.', array('status' => 500));
    }

    $key_id = $razorpay_settings['key_id'];
    $key_secret = $razorpay_settings['key_secret'];

    $api = new \Razorpay\Api\Api($key_id, $key_secret);

    // 2. Create Razorpay Order
    $razorpay_order_data = [
        'receipt'         => 'rcptid_app_' . time(),
        'amount'          => $order_total * 100, // Amount in the smallest currency unit (paise for INR)
        'currency'        => 'INR', // Or get from request
        'payment_capture' => 1 // Auto-capture payment
    ];

    try {
        $razorpay_order = $api->order->create($razorpay_order_data);
    } catch (Exception $e) {
        return new WP_Error('razorpay_error', $e->getMessage(), array('status' => 500));
    }

    // 3. Send the Razorpay Order ID and your public Key ID back to your app
    $response_data = [
        'razorpay_order_id' => $razorpay_order['id'],
        'key_id'            => $key_id,
    ];

    return new WP_REST_Response($response_data, 200);
}


/**
 * Callback function to verify the Razorpay payment signature.
 *
 * @param WP_REST_Request $request The request object.
 * @return WP_REST_Response|WP_Error The response object.
 */
function verify_razorpay_payment_for_app($request) {
    $params = $request->get_json_params();
    $razorpay_order_id = sanitize_text_field($params['razorpay_order_id']);
    $razorpay_payment_id = sanitize_text_field($params['razorpay_payment_id']);
    $razorpay_signature = sanitize_text_field($params['razorpay_signature']);

    // Check if required parameters are present
    if (empty($razorpay_order_id) || empty($razorpay_payment_id) || empty($razorpay_signature)) {
        return new WP_Error('missing_params', 'Required payment details are missing.', array('status' => 400));
    }

    // Get your key secret
    $razorpay_settings = get_option('woocommerce_razorpay_settings');
    $key_secret = $razorpay_settings['key_secret'];

    $attributes = array(
        'razorpay_order_id'   => $razorpay_order_id,
        'razorpay_payment_id' => $razorpay_payment_id,
        'razorpay_signature'  => $razorpay_signature
    );

    try {
        // You MUST use the utility class from the Razorpay SDK to verify
        $api = new \Razorpay\Api\Api(null, $key_secret);
        $api->utility->verifyPaymentSignature($attributes);

        return new WP_REST_Response(['status' => 'success', 'message' => 'Payment verified successfully.'], 200);

    } catch (\Razorpay\Api\Errors\SignatureVerificationError $e) {
        // Signature is not valid
        return new WP_REST_Response(['status' => 'failed', 'message' => 'Invalid Razorpay signature.'], 400);
    } catch (Exception $e) {
        return new WP_Error('verification_error', $e->getMessage(), array('status' => 500));
    }
}
/*=================================================================== OTP API ================================================*/



/*
Plugin Name: Mobile App OTP Login with JWT
Description: OTP-based authentication with JWT tokens for mobile apps
Version: 2.0
Author: Your Name
*/


// -----------------------------------------------------------
// 1. SMS Configuration (Your existing gateway)
define('SMS_AUTH_KEY', '3133554c49544536353259');
define('SMS_SENDER_ID', 'YULITE');
define('SMS_ROUTE', '2');
define('SMS_DLT_TEMPLATE_ID', '1707175765868353394');
define('SMS_API_URL', 'http://control.yourbulksms.com/api/sendhttp.php');

// JWT Configuration
define('JWT_SECRET_KEY',JWT_AUTH_SECRET_KEY);// 'your-secret-key-change-this-to-random-string'); // CHANGE THIS!
define('JWT_EXPIRY_HOURS', 720); // 30 days

// -----------------------------------------------------------
// 2. Ensure table exists (using your schema)
function mobile_otp_check_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'user_otp'; // wp_user_otp
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id BIGINT(20) UNSIGNED DEFAULT NULL,
        mobile VARCHAR(15) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_verified TINYINT(1) DEFAULT 0,
        attempts INT DEFAULT 0,
        PRIMARY KEY (id),
        KEY mobile (mobile),
        KEY user_id (user_id),
        KEY expires_at (expires_at)
    ) {$charset_collate};";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

add_action('init', 'mobile_otp_check_table');

// -----------------------------------------------------------
// 3. JWT Helper Functions

/**
 * Generate JWT token
 */
function generate_jwt_token($user_id, $mobile) {
    $issued_at = time();
    $expiration_time = $issued_at + (JWT_EXPIRY_HOURS * 3600);
    
    
   $payload = array(
    'iss'      => get_bloginfo('url'), // Issuer
    'iat'      => $issued_at,          // Issued at
    'exp'      => $expiration_time,    // Expiration
    'user_id'  => $user_id,
    'mobile'   => $mobile,
    'data'     => array(
        'user' => array(
            'id' => $user_id
        )
    )
);

    
    // Simple JWT implementation
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify JWT token
 */
function verify_jwt_token($token) {
    if (empty($token)) {
        return false;
    }
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $tokenParts;
    
    // Verify signature
    $valid_signature = str_replace(['+', '/', '='], ['-', '_', ''], 
        base64_encode(hash_hmac('sha256', $header . "." . $payload, JWT_SECRET_KEY, true))
    );
    
    if ($signature !== $valid_signature) {
        return false;
    }
    
    // Decode payload
    $payload_decoded = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    
    // Check expiration
    if (isset($payload_decoded['exp']) && $payload_decoded['exp'] < time()) {
        return false;
    }
    
    return $payload_decoded;
}

// -----------------------------------------------------------
// 4. REST API Routes
add_action('rest_api_init', function() {
    $namespace = 'mobile-app/v1';

    // Send OTP
    register_rest_route($namespace, '/send-otp', [
        'methods' => 'POST',
        'callback' => 'mobile_app_send_otp',
        'permission_callback' => '__return_true',
    ]);

    // Verify OTP and Login
    register_rest_route($namespace, '/verify-otp', [
        'methods' => 'POST',
        'callback' => 'mobile_app_verify_otp',
        'permission_callback' => '__return_true',
    ]);

    // Refresh Token
    register_rest_route($namespace, '/refresh-token', [
        'methods' => 'POST',
        'callback' => 'mobile_app_refresh_token',
        'permission_callback' => 'mobile_app_verify_token',
    ]);

    // Get User Profile (Protected)
    register_rest_route($namespace, '/profile', [
        'methods' => 'GET',
        'callback' => 'mobile_app_get_profile',
        'permission_callback' => 'mobile_app_verify_token',
    ]);

    // Update User Profile (Protected)
    register_rest_route($namespace, '/profile', [
        'methods' => 'POST',
        'callback' => 'mobile_app_update_profile',
        'permission_callback' => 'mobile_app_verify_token',
    ]);
});

// -----------------------------------------------------------
// 5. Send OTP via SMS
function send_otp_via_sms($mobile, $otp) {
    // Add country code prefix (91 for India)
    $mobile_with_code = '91' . $mobile;
    
    // Prepare message
    $message = "Welcome to Youlite ! Your Registration OTP is " . $otp . ". Do not share this code with anyone. YOULITE ENERGY";
    
    // Build SMS API URL
    $sms_url = SMS_API_URL . 
        '?authkey=' . SMS_AUTH_KEY . 
        '&mobiles=' . $mobile_with_code . 
        '&message=' . urlencode($message) . 
        '&sender=' . SMS_SENDER_ID . 
        '&route=' . SMS_ROUTE . 
        '&country=0' . 
        '&DLT_TE_ID=' . SMS_DLT_TEMPLATE_ID . 
        '&sender-id=' . SMS_SENDER_ID;
    
    // Log for debugging
    error_log("Sending OTP to: {$mobile}, OTP: {$otp}");
    error_log("SMS URL: " . $sms_url);
    
    // Send SMS using cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $sms_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $sms_response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    // Log response
    error_log("SMS Response: " . $sms_response);
    error_log("HTTP Code: " . $http_code);
    
    if ($curl_error) {
        error_log("cURL Error: " . $curl_error);
        return false;
    }
    
    return $http_code == 200;
}

// -----------------------------------------------------------
// 6. API Handler: Send OTP

function mobile_app_send_otp(WP_REST_Request $request) {
    global $wpdb;
    $table = $wpdb->prefix . 'user_otp';

    $mobile = sanitize_text_field($request->get_param('mobile'));
    
    // Clean mobile number
    $mobile = preg_replace('/[^0-9]/', '', $mobile);
    
    // Validate mobile number (10 digits for India)
    if (strlen($mobile) != 10) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Invalid mobile number. Must be 10 digits'
        ], 400);
    }
    
    // Rate limiting: Check if OTP was sent recently (within 30 seconds)
    $recent_otp = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$table} WHERE mobile=%s AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND) ORDER BY created_at DESC LIMIT 1",
        $mobile
    ));
    
    if ($recent_otp) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Please wait 30 seconds before requesting a new OTP',
            'retry_after' => 30
        ], 429);
    }
    
    // Generate 6-digit OTP
    $otp = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    
    // Set expiry time (10 minutes)
    $created_at = current_time('mysql');
    $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));
    
    // Check if user exists with this mobile
    $user = $wpdb->get_row($wpdb->prepare(
        "SELECT ID FROM {$wpdb->users} WHERE user_login=%s",
        $mobile
    ));
    
    $user_id = $user ? $user->ID : null;
    
    // FIXED: Delete all old unverified OTPs for this mobile first
    $wpdb->delete($table, [
        'mobile' => $mobile,
        'is_verified' => 0
    ], ['%s', '%d']);
    
    // Always insert fresh OTP record
    $inserted = $wpdb->insert($table, [
        'mobile' => $mobile,
        'otp' => $otp,
        'created_at' => $created_at,
        'expires_at' => $expires_at,
        'is_verified' => 0,
        'attempts' => 0,
        'user_id' => $user_id || 0
    ], ['%s', '%s', '%s', '%s', '%d', '%d', '%d']);
    
    if ($inserted === false) {
        error_log("OTP Insert Failed: " . $wpdb->last_error);
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Failed to generate OTP',
            'error' => $wpdb->last_error
        ], 500);
    }
    
    // Log OTP for debugging (REMOVE IN PRODUCTION)
    error_log("OTP Generated for {$mobile}: {$otp}");
    
    // Send OTP via SMS
    $sms_sent = send_otp_via_sms($mobile, $otp);
    
    if (!$sms_sent) {
        error_log("SMS Failed for mobile: {$mobile}");
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Failed to send SMS. Please try again.'
        ], 500);
    }
    
    return new WP_REST_Response([
        'success' => true,
        'message' => 'OTP sent successfully to ' . $mobile,
        'mobile' => $mobile,
        'expires_in' => 600, // 10 minutes in seconds
        'debug' => [
            'user_exists' => !is_null($user_id),
            'user_id' => $user_id,
            'otp_id' => $wpdb->insert_id
        ]
    ], 200);
}


// -----------------------------------------------------------
// 7. API Handler: Verify OTP and Login
function mobile_app_verify_otp(WP_REST_Request $request) {
    global $wpdb;
    $table = $wpdb->prefix . 'user_otp';

    $mobile = sanitize_text_field($request->get_param('mobile'));
    $otp = sanitize_text_field($request->get_param('otp'));
    
    // Clean mobile number
    $mobile = preg_replace('/[^0-9]/', '', $mobile);
    
    if (empty($mobile) || empty($otp)) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Mobile number and OTP are required'
        ], 400);
    }
    
    // Get the latest OTP for this mobile
    $otp_record = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$table} WHERE mobile=%s AND is_verified=0 ORDER BY created_at DESC LIMIT 1",
        $mobile
    ));
    
    if (!$otp_record) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'No OTP found. Please request a new one.'
        ], 404);
    }
    
    // Check if OTP expired
    if (strtotime($otp_record->expires_at) < time()) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'OTP has expired. Please request a new one.'
        ], 400);
    }
    
    // Check max attempts (prevent brute force)
    if ($otp_record->attempts >= 5) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Maximum attempts exceeded. Please request a new OTP.'
        ], 429);
    }
    
    // Increment attempts
    $wpdb->update($table, 
        ['attempts' => $otp_record->attempts + 1],
        ['id' => $otp_record->id],
        ['%d'], ['%d']
    );
    
    // Verify OTP
    if ($otp !== $otp_record->otp) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'Invalid OTP',
            'attempts_left' => 5 - ($otp_record->attempts + 1)
        ], 400);
    }
    
    // ===== OTP VERIFIED - Now handle user =====
    
    // Check if user exists
    $user = get_user_by('login', $mobile);
    
    if (!$user) {
        // Create new WordPress user
        $userdata = array(
            'user_login' => $mobile,
            'user_pass'  => wp_generate_password(20, false),
            'user_email' => $mobile . '@app.youlite.in',
            'display_name' => 'User ' . substr($mobile, -4),
            'role' => 'customer', // WooCommerce customer role
            'show_admin_bar_front' => false
        );
        
        $user_id = wp_insert_user($userdata);
        
        if (is_wp_error($user_id)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to create user account: ' . $user_id->get_error_message()
            ], 500);
        }
        
        // Set user meta
        update_user_meta($user_id, 'mobile_number', $mobile);
        update_user_meta($user_id, 'billing_phone', $mobile);
        update_user_meta($user_id, 'mobile_verified', 1);
        update_user_meta($user_id, 'registered_via', 'mobile_app');
        
        $user = get_user_by('id', $user_id);
        $is_new_user = true;
    } else {
        $user_id = $user->ID;
        update_user_meta($user_id, 'mobile_verified', 1);
        $is_new_user = false;
    }
    
    // Mark OTP as verified and link to user
    $wpdb->update($table, [
        'is_verified' => 1,
        'user_id' => $user_id
    ], [
        'id' => $otp_record->id
    ], ['%d', '%d'], ['%d']);
    
    // Generate JWT token
    $jwt_token = generate_jwt_token($user_id, $mobile);
    
    // Store token in user meta (optional, for tracking)
    update_user_meta($user_id, 'last_jwt_token', $jwt_token);
    update_user_meta($user_id, 'last_login', current_time('mysql'));
    
    // Get user billing info
    $billing_first_name = get_user_meta($user_id, 'billing_first_name', true);
    $billing_last_name = get_user_meta($user_id, 'billing_last_name', true);
    $billing_email = get_user_meta($user_id, 'billing_email', true);
    $billing_address = get_user_meta($user_id, 'billing_address_1', true);
    
    // Return success with user data and JWT token
    return new WP_REST_Response([
        'success' => true,
        'message' => $is_new_user ? 'Account created successfully' : 'Login successful',
        'is_new_user' => $is_new_user,
        'data' => [
            'user_id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'mobile' => $mobile,
            'display_name' => $user->display_name,
            'first_name' => $billing_first_name ?: get_user_meta($user_id, 'first_name', true),
            'last_name' => $billing_last_name ?: get_user_meta($user_id, 'last_name', true),
            'billing_email' => $billing_email ?: $user->user_email,
            'billing_phone' => $mobile,
            'billing_address' => $billing_address ?: '',
            'token' => $jwt_token,
            'token_type' => 'Bearer',
            'expires_in' => JWT_EXPIRY_HOURS * 3600 // seconds
        ]
    ], 200);
}

// -----------------------------------------------------------
// 8. JWT Token Verification (for protected routes)
function mobile_app_verify_token(WP_REST_Request $request) {
    $auth_header = $request->get_header('Authorization');
    
    if (empty($auth_header)) {
        return new WP_Error('no_token', 'Authorization token is required', ['status' => 401]);
    }
    
    // Extract token (remove "Bearer " prefix)
    $token = str_replace('Bearer ', '', $auth_header);
    
    // Verify JWT
    $payload = verify_jwt_token($token);
    
    if (!$payload) {
        return new WP_Error('invalid_token', 'Invalid or expired token', ['status' => 401]);
    }
    
    // Check if user still exists
    $user = get_user_by('id', $payload['user_id']);
    if (!$user) {
        return new WP_Error('user_not_found', 'User not found', ['status' => 404]);
    }
    
    // Store user_id in request for use in callbacks
    $request->set_param('authenticated_user_id', $payload['user_id']);
    
    return true;
}

// -----------------------------------------------------------
// 9. Protected Route: Get Profile
function mobile_app_get_profile(WP_REST_Request $request) {
    $user_id = $request->get_param('authenticated_user_id');
    $user = get_user_by('id', $user_id);
    
    if (!$user) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }
    
    // Get user meta
    $mobile = get_user_meta($user_id, 'mobile_number', true);
    $billing_first_name = get_user_meta($user_id, 'billing_first_name', true);
    $billing_last_name = get_user_meta($user_id, 'billing_last_name', true);
    $billing_email = get_user_meta($user_id, 'billing_email', true);
    $billing_phone = get_user_meta($user_id, 'billing_phone', true);
    $billing_address_1 = get_user_meta($user_id, 'billing_address_1', true);
    $billing_address_2 = get_user_meta($user_id, 'billing_address_2', true);
    $billing_city = get_user_meta($user_id, 'billing_city', true);
    $billing_state = get_user_meta($user_id, 'billing_state', true);
    $billing_postcode = get_user_meta($user_id, 'billing_postcode', true);
    $billing_country = get_user_meta($user_id, 'billing_country', true);
    
    return new WP_REST_Response([
        'success' => true,
        'data' => [
            'user_id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'mobile' => $mobile,
            'display_name' => $user->display_name,
            'first_name' => get_user_meta($user_id, 'first_name', true),
            'last_name' => get_user_meta($user_id, 'last_name', true),
            'billing' => [
                'first_name' => $billing_first_name,
                'last_name' => $billing_last_name,
                'email' => $billing_email,
                'phone' => $billing_phone,
                'address_1' => $billing_address_1,
                'address_2' => $billing_address_2,
                'city' => $billing_city,
                'state' => $billing_state,
                'postcode' => $billing_postcode,
                'country' => $billing_country
            ]
        ]
    ], 200);
}

// -----------------------------------------------------------
// 10. Protected Route: Update Profile
function mobile_app_update_profile(WP_REST_Request $request) {
    $user_id = $request->get_param('authenticated_user_id');
    $user = get_user_by('id', $user_id);
    
    if (!$user) {
        return new WP_REST_Response([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }
    
    // Get parameters
    $display_name = sanitize_text_field($request->get_param('display_name'));
    $first_name = sanitize_text_field($request->get_param('first_name'));
    $last_name = sanitize_text_field($request->get_param('last_name'));
    $email = sanitize_email($request->get_param('email'));
    
    // Billing info
    $billing_first_name = sanitize_text_field($request->get_param('billing_first_name'));
    $billing_last_name = sanitize_text_field($request->get_param('billing_last_name'));
    $billing_email = sanitize_email($request->get_param('billing_email'));
    $billing_address_1 = sanitize_text_field($request->get_param('billing_address_1'));
    $billing_address_2 = sanitize_text_field($request->get_param('billing_address_2'));
    $billing_city = sanitize_text_field($request->get_param('billing_city'));
    $billing_state = sanitize_text_field($request->get_param('billing_state'));
    $billing_postcode = sanitize_text_field($request->get_param('billing_postcode'));
    $billing_country = sanitize_text_field($request->get_param('billing_country'));
    
    // Update user data
    $userdata = ['ID' => $user_id];
    
    if ($display_name) $userdata['display_name'] = $display_name;
    if ($email) $userdata['user_email'] = $email;
    
    if (count($userdata) > 1) {
        wp_update_user($userdata);
    }
    
    // Update user meta
    if ($first_name) update_user_meta($user_id, 'first_name', $first_name);
    if ($last_name) update_user_meta($user_id, 'last_name', $last_name);
    
    // Update billing meta
    if ($billing_first_name) update_user_meta($user_id, 'billing_first_name', $billing_first_name);
    if ($billing_last_name) update_user_meta($user_id, 'billing_last_name', $billing_last_name);
    if ($billing_email) update_user_meta($user_id, 'billing_email', $billing_email);
    if ($billing_address_1) update_user_meta($user_id, 'billing_address_1', $billing_address_1);
    if ($billing_address_2) update_user_meta($user_id, 'billing_address_2', $billing_address_2);
    if ($billing_city) update_user_meta($user_id, 'billing_city', $billing_city);
    if ($billing_state) update_user_meta($user_id, 'billing_state', $billing_state);
    if ($billing_postcode) update_user_meta($user_id, 'billing_postcode', $billing_postcode);
    if ($billing_country) update_user_meta($user_id, 'billing_country', $billing_country);
    
    return new WP_REST_Response([
        'success' => true,
        'message' => 'Profile updated successfully'
    ], 200);
}

// -----------------------------------------------------------
// 11. Refresh Token
function mobile_app_refresh_token(WP_REST_Request $request) {
    $user_id = $request->get_param('authenticated_user_id');
    $mobile = get_user_meta($user_id, 'mobile_number', true);
    
    // Generate new JWT token
    $jwt_token = generate_jwt_token($user_id, $mobile);
    
    // Update last token
    update_user_meta($user_id, 'last_jwt_token', $jwt_token);
    
    return new WP_REST_Response([
        'success' => true,
        'message' => 'Token refreshed successfully',
        'data' => [
            'token' => $jwt_token,
            'token_type' => 'Bearer',
            'expires_in' => JWT_EXPIRY_HOURS * 3600
        ]
    ], 200);
}

// -----------------------------------------------------------
// 12. Cleanup expired OTPs (cron job)
function cleanup_expired_otps() {
    global $wpdb;
    $table = $wpdb->prefix . 'user_otp';
    $wpdb->query("DELETE FROM {$table} WHERE expires_at < NOW()");
}

if (!wp_next_scheduled('mobile_otp_cleanup')) {
    wp_schedule_event(time(), 'daily', 'mobile_otp_cleanup');
}
add_action('mobile_otp_cleanup', 'cleanup_expired_otps');