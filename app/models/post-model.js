define([
  'jquery',
  'backbone',
  'models/user-model'
], function ($, Backbone, User) {
  var Post = Backbone.Model.extend({
    defaults: {
      ID             : null,
      title          : '',
      status         : 'draft',
      type           : 'post',
      author         : {},
      content        : '',
      link           : '',
      date           : '',
      date_gmt       : '',
      modified       : '',
      format         : 'standard',
      slug           : '',
      guid           : '',
      excerpt        : '',
      menu_order     : 0,
      comment_status : 'open',
      ping_status    : 'open',
      sticky         : false,
      date_tz        : 'Etc/UTC',
      modified_tz    : 'Etc/UTC',
      featured_image : null,
      terms          : {},
      post_meta      : {},
      meta           : {}
    },

    idAttribute: 'ID',
    urlRoot: '/posts',

    getAuthor: function () {
      return new User(this.get('author'));
    },

    fetchRevisions: function (id) {
      return this.fetchMeta(id, 'version-history');
    },

    fetchComments: function (id) {
      return this.fetchMeta(id, 'replies');
    },

    fetchMeta: function (id, link) {
      id = id || '';
      return $.isEmptyObject(this.get('meta')) ? false : $.get(this.getMetaUrl(link) + '/' + id);
    },

    getMetaUrl: function (link) {
      return this.get('meta').links[link];
    }
  });

  return Post;
});