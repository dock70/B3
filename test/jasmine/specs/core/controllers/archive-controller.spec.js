/* global define */

define([
  'app',
  'controllers/archive-controller',
  'controllers/bus/command-bus',
  'controllers/bus/event-bus',
  'controllers/bus/request-bus',
  'controllers/navigation/navigator',
  'models/post-model',
  'models/settings-model',
  'models/user-model',
  'models/taxonomy-model',
  'collections/post-collection',
  'views/archive-view',
  'views/not-found-view',
  'sinon'
], function (App, ArchiveController, CommandBus, EventBus, RequestBus, Navigator, Post, Settings, User, Taxonomy, Posts, ArchiveView, NotFoundView) {
  'use strict';

  describe("ArchiveController", function() {
    beforeEach(function() {
      this.user = new User({ID: 1, email: 'email', name: 'name'});
      App.start();
    });

    afterEach(function() {
      App.main.$el.html('');
      App.header.$el.html('');
      App.footer.$el.html('');
      window.scrollTo(0, 0);
    });

    describe(".initialize", function() {
      beforeEach(function() {
        this.bus        = spyOn(EventBus, 'bind');
        this.controller = new ArchiveController({
          posts: new Posts(),
          app:   App,
          user:  this.user
        });
      });

      it("should bind to archive:display:category event", function() {
        expect(this.bus).toHaveBeenCalledWith('archive:display:category', this.controller.showPostByCategory);
      });

      it("should bind to archive:display:tag event", function() {
        expect(this.bus).toHaveBeenCalledWith('archive:display:tag', this.controller.showPostByTag);
      });

      it("should bind to archive:display:author event", function() {
        expect(this.bus).toHaveBeenCalledWith('archive:display:author', this.controller.showPostByAuthor);
      });

      it("should bind to archive:display:next:page event", function() {
        expect(this.bus).toHaveBeenCalledWith('archive:display:next:page', this.controller.showNextPage);
      });

      it("should bind to archive:display:previous:page event", function() {
        expect(this.bus).toHaveBeenCalledWith('archive:display:previous:page', this.controller.showPreviousPage);
      });

      it("should bind to search:start event", function() {
        expect(this.bus).toHaveBeenCalledWith('search:start', this.controller.saveCurrentState);
      });

      it("should bind to search:stop event", function() {
        expect(this.bus).toHaveBeenCalledWith('search:stop', this.controller.loadPreviousState);
      });

      it("should bind to search:results:found event", function() {
        expect(this.bus).toHaveBeenCalledWith('search:results:found', this.controller.displayResults);
      });

      it("should bind to search:results:not_found event", function() {
        expect(this.bus).toHaveBeenCalledWith('search:results:not_found', this.controller.displayResults);
      });
    });

    describe(".showArchive", function() {
      beforeEach(function() {
        var response = [
          new Post({ID: 1, title: 'post-1'}).toJSON(),
          new Post({ID: 2, title: 'post-2'}).toJSON()
        ];

        this.server = stubServer({
          response: response,
          url:      Settings.get('apiUrl') + '/posts',
          code:     200
        });

        this.bus        = spyOn(CommandBus, 'execute');
        this.posts      = spyOn(Posts.prototype, 'fetch').andCallThrough();
        this.controller = new ArchiveController({
          posts: new Posts(),
          app:   App,
          user:  this.user
        });

        this.controller.showArchive({paged: 2});
        this.server.respond();
      });

      it("should fetch the collection of posts of a given page", function() {
        expect(this.posts).toHaveBeenCalledWith({reset: true, data: $.param({ page: 2 })});
      });

      it("should trigger a loading:show command", function() {
        expect(this.bus).toHaveBeenCalledWith('loading:show', {region: jasmine.any(Backbone.Marionette.Region)});
      });

      describe("When fetching is successful", function() {
        beforeEach(function() {
          this.spy = spyOn(App.main, 'show');
          var response = [
            new Post({ID: 1, title: 'post-1'}).toJSON(),
            new Post({ID: 2, title: 'post-2'}).toJSON()
          ];
          this.server = stubServer({
            url:      Settings.get('apiUrl') + '/posts?page=2',
            code:     200,
            response: response
          });

          this.controller = new ArchiveController({
            posts: new Posts(),
            app:   App,
            user:  this.user
          });

          this.controller.showArchive({paged: 2});
          this.server.respond();
        });

        it("should show the archive view", function() {
          expect(this.spy.mostRecentCall.args[0] instanceof ArchiveView).toBeTruthy();
        });
      });
    });

    describe(".displayPost", function() {
      beforeEach(function() {
        this.bus        = spyOn(EventBus, 'trigger');
        this.post       = new Post({ID: 1, slug: 'post'});
        this.controller = new ArchiveController({
          posts: new Posts([this.post]),
          app:   App,
          user: this.user
        });

        this.controller.displayPost({post: 1});
      });

      it("should not be displaying and save it into the state", function() {
        expect(this.controller.isDisplaying).toBeFalsy();
        expect(this.controller.state.was_displaying).toBeFalsy();
      });

      it("should trigger a post:show event", function() {
        expect(this.bus).toHaveBeenCalledWith('post:show', {post: this.post});
      });

      it("should navigate to the given post", function() {
        expect(this.bus).toHaveBeenCalledWith('router:nav', {route: 'post/post', options: { trigger: false }});
      });
    });

    describe(".saveCurrentState", function() {
      it("should save the current displaying options", function() {
        var posts = new Posts();
        this.controller = new ArchiveController({
          posts: posts,
          app:   App,
          user:  this.user
        });

        this.controller.show(this.controller._archiveView(posts, null, jasmine.any(Object)));
        this.controller.saveCurrentState();

        expect(this.controller.state).toEqual({
          was_displaying: true,
          collection:     posts,
          page:           1,
          filter:         jasmine.any(Object)
        });
      });
    });

    describe(".loadPreviousState", function() {
      beforeEach(function() {
        this.posts      = new Posts();
        this.appShow    = spyOn(App.main, 'show');
        this.controller = new ArchiveController({
          posts: this.posts,
          app:   App,
          user:  this.user
        });

        this.controller.state = {
          was_displaying: true,
          collection:     this.posts
        };

        this.controller.loadPreviousState();
      });

      it("should load the previous displaying options", function() {
        this.controller.posts = this.posts;
        this.controller.page  = 1;
      });

      it("should display the corresponding view", function() {
        var view = this.appShow.mostRecentCall.args[0];
        expect(view instanceof ArchiveView).toBeTruthy();
        expect(view.collection).toEqual(this.posts);
      });
    });

    describe(".displayResults", function() {
      it("should display the given results", function() {
        this.posts      = new Posts();
        this.appShow    = spyOn(App.main, 'show');
        this.controller = new ArchiveController({
          posts: this.posts,
          app:   App,
          user:  this.user
        });

        this.controller.displayResults({results: this.posts, filter: null});

        var view = this.appShow.mostRecentCall.args[0];
        expect(view instanceof ArchiveView).toBeTruthy();
        expect(view.collection).toEqual(this.posts);
      });
    });

    describe(".displayNotFound", function() {
      it("should display a not found view", function() {
        this.posts      = new Posts();
        this.appShow    = spyOn(App.main, 'show');
        this.controller = new ArchiveController({
          posts: this.posts,
          app:   App,
          user:  this.user
        });

        this.controller.displayResults();

        var view = this.appShow.mostRecentCall.args[0];
        expect(view instanceof NotFoundView).toBeTruthy();
      });
    });

    sharedBehaviourForPaging('.showNextPage', {
      before: 1,
      after:  2,
      methodToTest: function (controller) {
        controller.showNextPage();
      }
    });

    sharedBehaviourForPaging('.showPreviousPage', {
      before: 2,
      after:  1,
      methodToTest: function (controller) {
        controller.showPreviousPage();
      }
    });

    sharedBehaviourForArchiveOfType('category', {
      method:        ".showPostByCategory",
      calledWith:    "category",
      runTestMethod: function  (controller) {
        controller.showPostByCategory({category: 'category'});
      },
      request: Settings.get('apiUrl') + '/posts?filter[category_name]=category&page=1',
      route:   'post/category/category/page/1',
      taxonomy: true
    });

    sharedBehaviourForArchiveOfType('post_tag', {
      method:        ".showPostByTag",
      calledWith:    "tag",
      runTestMethod: function (controller) {
        controller.showPostByTag({post_tag: 'tag'});
      },
      request: Settings.get('apiUrl') + '/posts?filter[tag]=tag&page=1',
      route:   'post/tag/tag/page/1',
      taxonomy: true
    });

    sharedBehaviourForArchiveOfType('author', {
      method:        ".showPostByAuthor",
      calledWith:    "author",
      runTestMethod: function  (controller) {
        controller.showPostByAuthor({author: 'author'});
      },
      request: Settings.get('apiUrl') + '/posts?filter[author_name]=author&page=1',
      route:   'post/author/author/page/1',
      taxonomy: false
    });
  });

  function stubServer (options) {
    var server = sinon.fakeServer.create();
    server.respondWith(
      'GET',
      options.url,
      [options.code, {'Content-Type': 'application/json'}, JSON.stringify(options.response)]
    );

    return server;
  }

  function sharedBehaviourForArchiveOfType (type, options) {
    describe(options.method, function() {
      beforeEach(function() {
        this.request = spyOn(RequestBus, 'request').andCallFake(function () {
          return new Taxonomy();
        });
      });

      if (options.taxonomy) {
        it("should request the given terms if not already loaded", function() {
          var controller = new ArchiveController({
            posts: new Posts(),
            app:   App,
            user:  this.user
          });

          options.runTestMethod(controller);

          expect(this.request).toHaveBeenCalledWith('taxonomy:get', {taxonomy: type, term: options.calledWith});
        });
      }

      it("should fetch the corresponding posts of a given " + type, function() {
        this.fetch      = spyOn(Posts.prototype, 'fetch').andCallThrough();
        this.controller = new ArchiveController({
          posts: new Posts(),
          app:   App,
          user:  this.user
        });

        options.runTestMethod(this.controller);

        expect(this.fetch).toHaveBeenCalled();
      });

      describe("When fetching posts is successful", function() {
        it("should show the archive view", function() {
          var response = new Post({ID: 1});

          this.spy = spyOn(App.main, 'show');
          this.server = stubServer({
            url: options.request,
            code: 200,
            response: [response.toJSON()]
          });

          this.controller = new ArchiveController({
            posts: new Posts(),
            app:   App,
            user:  this.user,
          });

          options.runTestMethod(this.controller);
          this.server.respond();

          var view = this.spy.mostRecentCall.args[0];
          expect(view instanceof ArchiveView).toBeTruthy();
        });
      });

      describe("When fetching posts fails", function() {
        it("should show a not found view", function() {
          this.spy = spyOn(App.main, 'show');
          this.server = stubServer({
            url: options.request,
            code: 404,
            response: ''
          });

          this.controller = new ArchiveController({
            posts: new Posts(),
            app:   App,
            user:  this.user
          });

          options.runTestMethod(this.controller);
          this.server.respond();

          var view = this.spy.mostRecentCall.args[0];
          expect(view instanceof NotFoundView).toBeTruthy();
        });
      });

      it("should navigate to the corresponding url", function() {
        this.bus = spyOn(EventBus, 'trigger');
        this.controller = new ArchiveController({
          posts: new Posts(),
          app:   App,
          user:  this.user
        });
        this.controller.taxTypes[type] = this.taxType;
        options.runTestMethod(this.controller);

        expect(this.bus).toHaveBeenCalledWith('router:nav', {route: options.route, options: {trigger: false}});
      });
    });
  }

  function sharedBehaviourForPaging (method, options) {
    describe(method, function() {
      beforeEach(function() {
        this.fetch = spyOn(Posts.prototype, 'fetch').andCallThrough();
        this.bus   = spyOn(EventBus, 'trigger');
        spyOn(Navigator, 'getRoute').andCallFake(function () {
          return 'url/page/' + options.before;
        });
        this.posts = [
          new Post({ID: 1, title: 'post-1'}).toJSON(),
          new Post({ID: 2, title: 'post-2'}).toJSON()
        ];
        this.controller = new ArchiveController({
          posts: new Posts(this.posts),
          app:   App,
          user:  this.user,
          page:  options.before
        });
        options.methodToTest(this.controller);
      });

      it("should request the next page", function() {
        expect(this.fetch).toHaveBeenCalledWith({reset: true, data: 'page=' + options.after});
      });

      it("should navigate to page/<page_number> URL", function() {
        expect(this.bus).toHaveBeenCalledWith('router:nav', {route: 'url/page/' + options.after, options: {trigger: false}});
      });
    });
  }
});