/* global define */

define([
  'marionette',
  'behaviors/behaviors'
], function (Marionette) {
  'use strict';

  var TransitionIn = Marionette.Behavior.extend({
    onBeforeShow: function () {
      this.$el.fadeIn('slow', function () {});
    }
  });

  /**
   * Register behavior
   * @type {TransitionIn}
   */
  window.Behaviors.TransitionIn = TransitionIn;

  return TransitionIn;
});
