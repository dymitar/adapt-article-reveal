define([
    'core/js/adapt'
], function(Adapt) {

    var ArticleRevealView = Backbone.View.extend({

        className: 'article-reveal',

        events: {
            'click .article-reveal-open-button': 'onOpenClicked',
            'click .article-reveal-close-button': 'onCloseClicked',
            'dragstart .article-reveal-open-button': 'preventDrag',
            'dragstart .article-reveal-close-button': 'preventDrag'
        },

        initialize: function () {
            var cfg = this.model.get('_articleReveal');
            if (cfg && cfg._isEnabled) {
                this.render();
                this.setup();
                this.setDeviceSize();
                this.listenTo(Adapt, {
                    'remove': this.remove,
                    'device:changed': this.setDeviceSize,
                    'page:scrollTo': this.onProgressBarScrollTo
                });
            }
        },

        render: function () {
            var data = this.model.toJSON();
            var template = Handlebars.templates['adapt-article-reveal'];
            this.$el.html(template(data)).prependTo('.' + this.model.get('_id'));

            if (this.allComponentsCompleted()) {
                this.setOpenButtonState();
            }

            return this;
        },

        setup: function() {
            if (this.allComponentsCompleted()) return;
            this.$el.siblings('.article__inner').css({ display: 'none' });
            this.toggleisVisible( false );
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large' || Adapt.device.screenSize === 'medium') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false);
            }
            this.render();
        },

        onOpenClicked: function (e) {
            if (e) e.preventDefault();

            if(this.$el.closest('.article').hasClass('locked')) return; // in conjunction with pageLocking

            this.revealArticle();

            this.setOpenButtonState();
        },

        onCloseClicked: function (e) {
            if (e) e.preventDefault();

            this.hideArticle();

            this.setClosedButtonState();
        },

        setOpenButtonState: function() {
            this.$('.article-reveal-open-button').addClass('visited show').velocity('fadeOut', 500);

            if(this.model.get('_articleReveal')._showCloseButton) {
                this.$('.article-reveal-close-button').velocity('fadeIn', 500);
            }
        },

        setClosedButtonState: function() {
            this.$('.article-reveal-close-button').velocity('fadeOut', 500);

            this.$('.article-reveal-open-button').removeClass('show').velocity('fadeIn', 500, function(e) {
                $(this).focus();
            });
        },

        revealArticle: function() {

            if(this.$el.closest('.article').hasClass('locked')) return; // in conjunction with pageLocking

            Adapt.trigger('article:revealing', this);

            this.$el.siblings('.article__inner')
                .css({'display': 'block'})// stops components like media from being a really odd size during the reveal animation
                .velocity('slideDown', 800, function() {
                    Adapt.trigger('article:revealed', this);
                    // Trigger device:resize to enable components that listen to this event to respond to new
                    // article dimensions - fixes components that depend on being visible for setting up layout
                    Adapt.trigger('device:resize');
                }.bind(this));

            this.$el.velocity('scroll', {
                delay: 400,
                duration: 800,
                offset: this.$el.height() - $('.navigation').outerHeight()
            });

            this.toggleisVisible(true);
        },

        hideArticle: function() {
            this.$el.siblings('.article__inner').velocity('slideUp', 600, function() {
                this.toggleisVisible(false);
            }.bind(this));

            this.$el.velocity('scroll', {
                duration: 600,
                offset: -$('.navigation').outerHeight()
            });
        },

        /**
         * Toggles the visibility of the components inside the article
         */
        toggleisVisible: function(view) {
            _.each(this.model.findDescendantModels('components'), function (component) {
                component.setLocking('_isVisible', false);
                component.set('_isVisible', view, {
                    pluginName:'_articleReveal'
                });
            });
        },

        onProgressBarScrollTo: function(componentSelector) {
            if (typeof componentSelector == "object") componentSelector = componentSelector.selector;
            var componentID = componentSelector;
            if(componentID.indexOf('.') === 0) componentID = componentID.slice(1);

            _.each(this.model.findDescendantModels('components'), function(component) {
                if(component.get('_id') === componentID && !component.get('_isVisible')){
                    this.revealComponent(componentSelector);
                    return;
                }
            }.bind(this));
        },

        revealComponent: function(componentSelector) {
            this.setOpenButtonState();

            this.toggleisVisible(true);

            this.$el.siblings('.article__inner').slideDown(0);

            this.$('.article-reveal-close-button').fadeIn(1);

            $(window).scrollTo($(componentSelector), {
                offset:{
                    top:-$('.navigation').height()
                }
            }).resize();
        },

        allComponentsCompleted: function() {
            return this.model.findDescendantModels('components').every(function(m) {
                return m.get('_isComplete') === true;
            });
        },

        preventDrag: function(e) {
            if(e) e.preventDefault();
        }
    });

    Adapt.on('articleView:postRender', function(view) {
        if (view.model.get('_articleReveal')) {
            new ArticleRevealView({
                model:view.model
            });
        }
    });

});
