/* global define, sinon, describe, beforeEach, expect, it, spyOn */

define([
  'jquery',
  'views/single-post-view',
  'buses/event-bus',
  'views/reply-form-view',
  'models/user-model',
  'models/post-model',
  'models/comment-model',
  'collections/comment-collection',
  'sinon'
], function ($, SinglePostView, EventBus, ReplyFormView, User, Post, Comment, Comments) {
  'use strict';

  describe("SinglePostView", function() {
    var user, view, post, options

    beforeEach(function() {
      post    = new Post({ID: 1, title: 'Title', author: new User({ID: 1, slug: 'author-1', name: 'author-name'}), terms: {category: {ID: 1, slug: 'post-1', link: "http://localhost:8888/wordpress/post/category/content"}, post_tag: {ID: 1, slug: 'tag-1', link: "http://localhost:8888/wordpress/post/tag/content"}}});
      options = { model: post, template: 'content/type-post-template.dust' };
    });

    describe(".initialize", function() {
      var bus;

      beforeEach(function() {
        bus = spyOn(EventBus, 'trigger');
        view = new SinglePostView(options);
      });

      it("should set the document title", function () {
        expect(bus).toHaveBeenCalledWith('title:change', 'Title');
      });
    });

    sharedClickBehaviourFor('category', {
      click: '.category > a',
      route: 'post/category/post-1'
    });

    sharedClickBehaviourFor('post_tag', {
      click: '.tag > a',
      route: 'post/tag/tag-1'
    });

    sharedClickBehaviourFor('author', {
      click: '.author > a',
      route: 'post/author/author-1'
    });

    sharedClickBehaviourFor('author', {
      click: '#author > a',
      route: 'post/author/author-1'
    })
  });

  function sharedClickBehaviourFor (action, options) {
    describe("When clicking in " + action, function() {
      it("should trigger a single:display:" + action, function() {
        var trigger = spyOn(EventBus, 'trigger'),
            post    = new Post({ID: 1, title: 'Title', author: new User({ID: 1, slug: 'author-1', name: 'author-name'}), terms: {category: {ID: 1, slug: 'post-1', link: "http://localhost:8888/wordpress/post/category/content"}, post_tag: {ID: 1, slug: 'tag-1', link: "http://localhost:8888/wordpress/post/tag/content"}}}),
            view    = new SinglePostView({ model: post, template: 'content/type-post-template.dust' }), button;

        view.render();
        button = view.$(options.click);
        button.click();

        expect(trigger).toHaveBeenCalledWith('single:view:display:' + action, { slug: button.attr('slug'), type: action });
      });
    });
  }
});
