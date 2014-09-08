define([
  'views/archive-view',
  'models/settings-model',
  'models/post-model',
  'models/user-model',
  'collections/post-collection',
  'buses/event-bus',
  'buses/command-bus',
  'sinon'
], function (ArchiveView, Settings, Post, User, Posts, EventBus, CommandBus) {
  'use strict';

  describe("ArchiveView", function() {
    beforeEach(function() {
      this.cbus  = spyOn(CommandBus, 'execute');
      this.posts = new Posts([
        new Post({ID: 1, title: 'title-1', excerpt: 'Excerpt 1'}),
        new Post({ID: 2, title: 'title-2', excerpt: 'Excerpt 2'})
      ]);

      this.view = new ArchiveView({collection: this.posts});
      this.view.render();
    });

    describe(".render", function() {
      it("should render the template", function() {
        expect(this.view.$('.b3-post').length).toEqual(2);
      });

      it("should trigger a loading:hide command", function() {
        expect(this.cbus).toHaveBeenCalledWith('loading:hide');
      });
    });

    describe("When the collection changes", function() {
      it("should re-render the view", function() {
        this.posts.reset();
        expect(this.view.$('.b3-post').length).toEqual(0);
      });
    });

    describe("When specifying a type", function() {
      it("should display the type", function() {
        this.posts = new Posts([
          new Post({ID: 1, title: 'title-1', excerpt: 'Excerpt 1'}),
          new Post({ID: 2, title: 'title-2', excerpt: 'Excerpt 2'})
        ]);

        this.view = new ArchiveView({collection: this.posts, title: 'Category'});
        this.view.render();

        expect(this.view.$('.archive-title').text()).toContain('Category');
      });
    });

    describe("When clicking in title link", function() {
      beforeEach(function() {
        this.spy = spyOn(EventBus, 'trigger');
        this.posts = new Posts([
          new Post({ID: 1, title: 'title-1', excerpt: 'Excerpt 1', slug: 'post-1'}),
          new Post({ID: 2, title: 'title-2', excerpt: 'Excerpt 2', slug: 'post-2'})
        ]);

        this.view = new ArchiveView({collection: this.posts});
        this.view.render();
      });

      it("should trigger an event of navigation", function() {
        var post = this.view.$('.b3-post-title > a').first();
        post.click();
        expect(this.spy).toHaveBeenCalledWith('archive:display:post', {post: parseInt(post.attr('id'), 10)});
      });
    });

    sharedBehaviourFor('category', {
      click:         '.b3-post-categories > span > a',
      event:         'archive:display:category',
      event_options: {id: 1, slug: 'post-1'}
    });

    sharedBehaviourFor('tag', {
      click:         '.b3-post-tags > span > a',
      event:         'archive:display:tag',
      event_options: {id: 1, slug: 'tag-1'}
    });

    sharedBehaviourFor('author', {
      click:         '.b3-post-author > span > a',
      event:         'archive:display:author',
      event_options: {id: 1, slug: 'author-1'}
    });

    sharedBehaviourFor('next button', {
      click:         '.b3-pagination-next',
      event:         'archive:display:next:page',
      event_options: {}
    });

    sharedBehaviourFor('previous button', {
      click:         '.b3-pagination-previous',
      event:         'archive:display:previous:page',
      event_options: {}
    });

    sharedBehaviourFor('page button', {
      click:         '.pagination .number:eq(1) a',
      event:         'archive:display:page',
      event_options: {paged: 2}
    });
  });

  function sharedBehaviourFor (action, options) {
    describe("When clicking in a " + action, function() {
      beforeEach(function() {
        this.posts = new Posts([
          new Post({ID: 1, title: 'Sticky', excerpt: 'Excerpt 1', author: new User({ID: 1, slug: 'author-1', name: 'author-name'}), terms: {category: {ID: 1, slug: 'post-1', link: "http://localhost:8888/wordpress/post/category/content"}, post_tag: {ID: 1, slug: 'tag-1', link: "http://localhost:8888/wordpress/post/tag/content"}}}),
          new Post({ID: 2, title: 'Oh post', excerpt: 'Excerpt 2', author: new User({ID: 1, slug: 'author-2', name: 'author-name'}), terms: {category: {ID: 1, slug: 'post-2', link: "http://localhost:8888/wordpress/post/category/content"}, post_tag: {ID: 2, slug: 'tag-2', link: "http://localhost:8888/wordpress/post/tag/content"}}})
        ]);
        this.bus  = spyOn(EventBus, 'trigger');
        this.view = new ArchiveView({collection: this.posts, limit: 2, total: 2});
        this.view.render();
        this.view.$(options.click).click();
      });

      it("should trigger an event to display the given " + action, function() {
        expect(this.bus).toHaveBeenCalledWith(options.event, options.event_options);
      });
    });
  }
});
