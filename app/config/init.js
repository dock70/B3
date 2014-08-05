/* global WP_API_SETTINGS, require */

(function() {
  'use strict';

  var root = WP_API_SETTINGS.root;

  var templateDeps = [
    "header-template",
    "main-template",
    "footer-template",
    "content/type-post-template",
    "content/type-page-template",
    "content/comments/comment-template",
    "archive/posts-template",
    "error/not-found-template",
    "forms/searchform-template",
    "forms/replyform-template",
    "forms/navigation-search-template",
    "navigation/menus/menu-item-template",
    "widget-areas/sidebar-template"
  ];

  var config = {
    //urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl: root + "/dist",
    paths: {
      "jquery":               root + "/lib/jquery",
      "jqueryui":             root + "/lib/jquery-ui",
      "underscore":           root + "/lib/lodash.compat",
      "backbone":             root + "/lib/backbone",
      "backbone.wreqr":       root + "/lib/backbone.wreqr",
      "backbone.babysitter":  root + "/lib/backbone.babysitter",
      "marionette":           root + "/lib/backbone.marionette",
      "dust":                 root + "/lib/dust-full.min",
      "dust.helpers":         root + "/lib/dust-helpers.min",
      "dust.marionette":      root + "/lib/backbone.marionette.dust",
      "backbone.validateAll": root + "/lib/Backbone.validateAll.min",
      "bootstrap":            root + "/lib/bootstrap",
      "bootstrap.notify":     root + "/lib/bootstrap-notify",
      "text":                 root + "/lib/text",
    },

    shim: {
      "bootstrap": ["jquery"],
      "jqueryui": ["jquery"],
      "backbone": {
        "deps": ["underscore"],
        "exports": "Backbone"
      },
      "marionette": {
        "deps": ["underscore", "backbone", "jquery"],
        "exports": "Marionette"
      },
      "dust": {
        "exports": "dust"
      },
      "dust.marionette": {
        "deps": ["marionette", "dust"],
        "exports": "dustMarionette",
      },

      "dust.helpers": {
        "deps": ["dust"],
        "exports": "dustHelpers"
      },

      // Backbone.validateAll plugin (https://github.com/gfranko/Backbone.validateAll)
      "backbone.validateAll": ["backbone"],
      "bootstrap.notify": ["bootstrap"]
    }
  };

  templateDeps.forEach(function(dep) {
    config.paths[dep] = root + "/dist/templates/" + dep;
    config.shim[dep] = {
      "deps": ["dust"]
    };
  });

  require.config(config);

  // Includes Desktop Specific JavaScript files here (or inside of your Desktop router)
  require([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "app",
    "models/settings-model",
    "config/rewrite",
    "jqueryui",
    "bootstrap",
    "backbone.validateAll",
  ], function ($, _, Backbone, Marionette, App, Settings, Rewrite) {
    Settings.set('require.config', config);

    Backbone.Model.prototype.toJSON = Rewrite.toJSON;
    Backbone.Model.prototype.parse  = Rewrite.parse;
    Backbone.Model.prototype.sync   = Rewrite.sync;

    Backbone.Router.prototype._extractParameters    = Rewrite.extractParameters;
    Marionette.AppRouter.prototype.processAppRoutes = Rewrite.processAppRoutes;

    if (!String.prototype.supplant) {
      String.prototype.supplant = function(o) {
        return this.replace(/\{([^{}]*)\}/g, function(a, b) {
          var r = o[b];
          return typeof r === 'string' || typeof r === 'number' ? r : a;
        });
      };
    }

    App.start();
  });
})();