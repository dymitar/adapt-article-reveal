/*
* adapt-contrib-article-reveal
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Stuart Nicholls <stuart@stuartnicholls.com>, Mohammed Salamat Ali <Mohammed.SalamatAli@kineo.com>
*/
define(function(require) {

var Adapt = require('coreJS/adapt');
var Backbone = require('backbone');

var ArticleRevealView = Backbone.View.extend({

    className: "article-reveal",

    initialize: function () {
        this.render();
        this.setup();
        this.listenTo(Adapt, "remove", this.remove);
        this.listenTo(Adapt, 'device:changed', this.setDeviceSize);
        Adapt.on("page:scrollTo", _.bind(this.onProgressBarScrollTo, this));
    },

    events: {
        "click .article-reveal-open-button":"revealArticle",
        "click .article-reveal-close-button":"closeArticle"
    },

    render: function () {
        var data = this.model.toJSON();
        var template = Handlebars.templates["adapt-article-reveal"];
        $(this.el).html(template(data)).prependTo('.' + this.model.get("_id"));
        var incomplete = this.model.findDescendants("components").where({_isComplete:false});
        if (incomplete.length === 0){
            this.$(".article-reveal-open-button").addClass('visited');
            this.$(".article-reveal-open-button").addClass('show');
        }
        return this;
    },
	
	setup: function(event) {
        if (event) event.preventDefault();
        //prevent drag on buttons
        this.preventDrag();

        //hide articles
        var $articleInner = $("." + this.model.get("_id") + " > .article-inner ");

        var incomplete = this.model.findDescendants("components").where({_isComplete:false});
        if (incomplete.length > 0){
            $articleInner.css({display:"none"});

            //set components to isVisible false
            this.toggleisVisible( false );
        }
        this.setDeviceSize();
    },

    setDeviceSize: function() {
        if (Adapt.device.screenSize === 'large' || Adapt.device.screenSize === 'medium') {
            this.$el.addClass('desktop').removeClass('mobile');
            this.model.set('_isDesktop', true);
        } else {
            this.$el.addClass('mobile').removeClass('desktop');
            this.model.set('_isDesktop', false)
        }
        this.render();
    },
    
    closeArticle: function(event) {
        if (event) event.preventDefault();

        //set article not showing in css
        this.$(".article-reveal-open-button").removeClass('show');

        //animate Close..
        // this.$(".article-reveal-close-button").velocity("fadeOut", 500);

        //..and set components to isVisible false
        this.$el.siblings(".article-inner").velocity("slideUp", 600, _.bind(function() {
            this.toggleisVisible(false);
        }, this));
        this.$el.velocity("scroll", {
            duration: 600,
            offset: -$(".navigation").outerHeight()
        });
        this.$(".article-reveal-open-button").focus();
    },

    revealArticle: function(event) {
        if (event) event.preventDefault();
        if(this.$el.closest(".article").hasClass("locked")) return; // in conjunction with pageLocking

        //set article visited and article showing in css
        this.$(".article-reveal-open-button").addClass('visited');
        this.$(".article-reveal-open-button").addClass('show');

        //animate reveal 
        Adapt.trigger("article:revealing", this);
        this.$el.siblings(".article-inner").velocity("slideDown", 800, _.bind(function() {
            Adapt.trigger("article:revealed", this);
            // Call window resize to force components to rerender -
            // fixes components that depend on being visible for setting up layout
            $(window).resize();
        }, this));
        this.$el.velocity("scroll", {
            delay: 400,
            duration: 800,
            offset: this.$el.height() - $(".navigation").outerHeight()
        });
        // this.$(".article-reveal-close-button").velocity("fadeIn", {
        //     delay: 400,
        //     duration: 500
        // });

        //set components to isVisible true
        this.toggleisVisible(true);
    },

    toggleisVisible: function(view) {
  		var allComponents = this.model.findDescendants('components');
  		  allComponents.each(function(component) {
  				component.set({
                    '_isVisible':view
                },{
                    pluginName:"_articleReveal"
                });
  		  });
    },
    
    preventDrag: function() {
        $(".article-reveal-open-button").on("dragstart", function(event) { 
            event.preventDefault(); 
        });
        $(".article-reveal-close-button").on("dragstart", function(event) { 
            event.preventDefault(); 
        });
    },

    // Handles the Adapt page scrollTo event
    onProgressBarScrollTo: function(componentSelector) { 
        var allComponents = this.model.findDescendants('components');
        var componentID = componentSelector;
        if(componentID.indexOf('.') === 0) componentID = componentID.slice(1);
        allComponents.each(_.bind(function(component){
            if(component.get('_id') === componentID && !component.get('_isVisible')){
                this.revealComponent(componentSelector);
                return;
            }
        }, this));
    },

    revealComponent: function(componentSelector) {
        this.$(".article-reveal-open-button").addClass('visited');
        this.$(".article-reveal-open-button").addClass('show');
        
        this.toggleisVisible(true);
        $("." + this.model.get("_id") + " > .article-inner ").slideDown(0);
        this.$(".article-reveal-close-button").fadeIn(1);
        $(window).scrollTo($(componentSelector), {
            offset:{
                top:-$('.navigation').height()
            }
        }).resize();
    }

});

Adapt.on('articleView:postRender', function(view) {
    if (view.model.get("_articleReveal")) {
        new ArticleRevealView({
            model:view.model
        });
    }
});

});






