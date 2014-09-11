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
        return this;
    },
	
	setup: function(event) {
        if (event) event.preventDefault();
        //prevent drag on buttons
        this.preventDrag();

        //hide articles
        var $articleInner = $("." + this.model.get("_id") + " > .article-inner ");
        $articleInner.css({display:"none"});

        //set components to isVisible false
        this.toggleisVisible( false );
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
        this.$(".article-reveal-close-button").fadeOut(500)
        var $articleInner = $("." + this.model.get("_id") + " > .article-inner ");

        //..and set components to isVisible false
        $articleInner.slideUp( 1000, _.bind(function() {
            this.toggleisVisible( false );
        }, this));

        this.$(".article-reveal-open-button").focus();
    },

    revealArticle: function(event) {
        if (event) event.preventDefault();
        if(this.$el.closest(".article").hasClass("locked")) return; // in conjunction with pageLocking

        //set article visited and article showing in css
        this.$(".article-reveal-open-button").addClass('visited');
        this.$(".article-reveal-open-button").addClass('show');

        //animate reveal 
        var $currentTarget = $("." + this.model.get("_id") + " .article-reveal-open-button");
        var top = $currentTarget.offset().top - $(".navigation").height() - ($currentTarget.height());
        $("html, body").animate({
            scrollTop: top + "px" 
        }, 1200);
        var $articleInner = $("." + this.model.get("_id") + " > .article-inner " );
        $articleInner.slideDown(1500);
        this.$(".article-reveal-close-button").fadeIn(500);

        // Call window resize to force components to rerender - fixes components that depend on being visible for setting up layout
        $(window).resize();

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
        });
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






