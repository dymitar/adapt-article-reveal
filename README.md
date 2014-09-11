adapt-article-reveal
====================  

Article reveal hides the article inner and prepends an element containing a button to the top of the article element. Pressing the button reveals the hidden article inner.

To set up article reveal with the standard configuration use the JSON provided in the example.json file

Configuration options are explained below the example JSON.

```

"_articleReveal":{
    "_classes": "",
    "_height":200,
    "_mobileHeight":150,
    "_icon-text": "REVEAL",
    "_closeButtonText": "CLOSE",
    "_triggerPosition": {
        "_top":30,
        "_left":50
    },
    "_mobileTriggerPosition": {
        "_top":30,
        "_left":20
    },
    "_ariaLabels": {
        "openArticle": "",
        "closeArticle": ""
    },
    "_ariaRegions": {
        "articleReveal": ""
    },
    "_backgroundImage":"image.png",
    "_mobileBackgroundImage":"mobile-image.png"
}

```

###Config Options

####Classes

```
"_classes": "",

```

Adds classes to the article reveal element. Use for bespoke styling.


####Height

```
"_height":200,
"_mobileHeight":100,

```
Set the height of the element containing the button. Different heights can be set for large and small viewports.

####Trigger(button) position

```
"_triggerPosition": {
    "_top":30,
    "_left":50
},
"_mobileTriggerPosition": {
    "_top":30,
    "_left":20
},

```
Set position of the reveal button, the position is set using percentages. Different positions can be set for large and small viewports.

####Accessibility

```
"_ariaLabels": {
    "openArticle": "",
    "closeArticle": ""
},
"_ariaRegions": {
    "articleReveal": ""
},

```
Aria configuration options.

####Background images

```
"_backgroundImage":"image.png",
"_mobileBackgroundImage":"mobile-image.png"

```

Background images can be set on the element that conatins the button. Different images can be set for large and small viewports.


