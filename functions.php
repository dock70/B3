<?php
/**
 * B3 theme logic.
 */

if (!defined( 'WPINC' )) {
    die;
}

class B3Theme {

    /**
     * Theme slug.
     * @var [type]
     */
    protected $slug = 'b3';

    /**
     * [$require description]
     * @var string
     */
    protected $require_uri = '';

    /**
     * [$loader description]
     * @var string
     */
    protected $loader_uri = '';

    /**
     * [__construct description]
     */
    public function __construct () {

        $this->settings_uri = get_template_directory_uri() . '/settings.js';

        $this->require_uri = get_template_directory_uri() . '/lib/requirejs/requirejs.js';

        $this->loader_uri   = defined( 'WP_DEBUG' ) && WP_DEBUG
                            ? get_template_directory_uri() . '/app/config/init.js'
                            : get_template_directory_uri() . '/dist/config/init.js'
                            ;

        $this->setup();
    }

    /**
     * [is_wp_api_active description]
     * @return boolean [description]
     */
    protected function is_wp_api_active () {
        return function_exists( 'json_get_url_prefix' );
    }

    /**
     * [is_wp_api_active description]
     * @return boolean [description]
     */
    public function wp_api_check () {
        if (!$this->is_wp_api_active()) {
            wp_die( __( 'The WordPress API is unavailable. Please install and enable the WP API plugin to use this theme.', 'b3' ),
                __( 'Error: WP API Unavailable', 'b3' ) );
        }
    }

    /**
     * [setup description]
     */
    public function setup () {
        load_theme_textdomain( $this->slug, get_template_directory() . '/languages' );

        $this->setup_menus();

        add_theme_support( 'automatic-feed-links' );

        add_theme_support( 'html5', array(
            'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'
        ) );

        add_action( 'widgets_init'      , array( $this, 'setup_widgets' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'setup_scripts' ) );
        add_action( 'wp_head'           , array( $this, 'enqueue_require_script' ), 20, 0 );
    }

    /**
     * [register_menus description]
     */
    protected function setup_menus () {
        register_nav_menus( array(
            'primary' => __( 'Primary Menu', 'b3' ),
        ) );
    }

    /**
     * [register_widgets description]
     * @return [type] [description]
     */
    public function setup_widgets () {
        register_sidebar( array(
            'name'          => __( 'Sidebar', 'b3' ),
            'id'            => 'sidebar',
            'description'   => '',
            'before_widget' => '<aside id="%1$s" class="widget %2$s">',
            'after_widget'  => '</aside>',
            'before_title'  => '<h1 class="title">',
            'after_title'   => '</h1>',
        ) );
    }

    /**
     * Inject client application scripts.
     *
     * This action is called on `wp_enqueue_scripts` and injects required client
     * application settings from the backend, such as:
     *
     * - `root`:  Theme root URI.
     * - `url`:   RESTful WP API endpoint prefix.
     * - `name`:  Site name.
     * - `nonce`: Nonce string.
     */
    public function setup_scripts () {
        if (!$this->is_wp_api_active()) {
            return;
        }

        $settings = array(
            'root'  => get_stylesheet_directory_uri(),
            'url'   => home_url( json_get_url_prefix() ),
            'name'  => get_bloginfo( 'name' ),
            'nonce' => wp_create_nonce( 'wp_json' )
            );

        wp_register_script( $this->slug . '-settings', $this->settings_uri );
        wp_localize_script( $this->slug . '-settings', 'WP_API_SETTINGS', $settings );
        wp_enqueue_script( $this->slug . '-settings' );
    }

    public function enqueue_require_script () {
        if (!$this->is_wp_api_active()) {
            return;
        }
        echo '<script src="' . $this->require_uri . '" data-main="' . $this->loader_uri . '"></script>';
    }

}

function B3 () {
    global $GLOBALS;

    if (!isset( $GLOBALS['b3'] )) {
        $GLOBALS['b3'] = new B3Theme();
    }

    return $GLOBALS['b3'];
}

add_action( 'after_setup_theme', 'B3' );