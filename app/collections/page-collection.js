define([
  'jquery',
  'backbone',
  'models/page-model',
  'models/settings-model'
], function ($, Backbone, Page, Settings) {
  var Pages = Backbone.Collection.extend({
    model: Page,
    url: Settings.get('url') + '/pages'
  });

  return Pages;
});