<!DOCTYPE html>
<!--[if lt IE 7]>
<html class="no-js lt-ie9 lt-ie8 lt-ie7 ui-mobile-rendering" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>
<html class="no-js lt-ie9 lt-ie8 ui-mobile-rendering" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>
<html class="no-js lt-ie9 ui-mobile-rendering" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js ui-mobile-rendering" <?php language_attributes(); ?>> <!--<![endif]-->
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php wp_title( '|', true, 'right' ); ?></title>
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?> role="document">
    <div id="header" role="header"></div>
    <div id="content-wrapper">
        <div id="main" role="main"></div>
        <div id="sidebar"></div>
    </div>
    <div id="footer" role="footer"></div>
    <div id="notifications"></div>
    <?php wp_footer(); ?>
</body>
</html>
