RESThub Backbone stack changelog
================================

This changelog references the major changes (features, important bugs and security fixes) of resthub-spring-stack project.
Some changes break backwards compatibility, check out the UPGRADE section before you upgrade your application.  

2.1.2 version (07-26-2013)
--------------------------

 * Replace Backbone Relational by Backbone Associations
 * Default RESThub View render improvements : merge instead of replace behaviour
 * Backbone 1.0 critical patches
  * `urlRoot override issue <https://github.com/gsamokovarov/backbone/commit/3bfbcd4123a19f9ec31c5d64d3d4322140adc2fa>`_
  * `Don't validate twice <https://github.com/jashkenas/backbone/commit/4db26764779e942b9c02d114e9836508da800f44>`_
  * `Save should always set with validate:true by default <https://github.com/jashkenas/backbone/commit/8e7208e0d8bed32528751e176a96fabdc60b5802>`_
 * Change synchronization policy of validation api
 * Fix war packaging configuration
 * Fix Backbone localstorage adapter
 * Fix Backbone Validation infinite loop
 * Upgrade Handlebars to 1.0
 * Upgrade Twitter Bootstrap to 2.3.2
 * Fix tutorial
 * Fix todo example
 
2.1.1 version (05-17-2013)
--------------------------

Following libraries updated and may lead to some minor incompatibility, most significant ones are detailed bellow :
 * Backbone 0.9.10 to 1.0 (`Upgrade guide <http://backbonejs.org/#upgrading>`_)
  * Renamed Collection's "update" to set, for parallelism with the similar model.set(), and contrast with reset. It's now the default updating mechanism after a fetch. If you'd like to continue using "reset", pass {reset: true}.
  * Your route handlers will now receive their URL parameters pre-decoded.
 * Backbone relational 0.7.1 to 0.8.5 (`Detailed changelog <http://backbonerelational.org/#change-log>`_)
  * Supports Backbone 1.0.0
  * Implemented the add, merge and remove options on Collection.add when working with RelationalModels. This also works when using set to change the key on nested relations.
 * RequireJS 2.1.4 to 2.1.5
 * Update to latest async.js
 * Handlebars 1.0 beta6 to 1.0 rc3
 * Update to latest keymaster.js
 * Underscore.String from 2.0.0 to 2.3.0
  * Underscore.String is exported as _s, not _.str anymore

2.1.0 version (03-26-2013)
--------------------------

Following libraries updated and may lead to some minor incompatibility, most significant ones are detailed bellow :
 * Backbone 0.9.2 to 0.9.10 (`Upgrade guide <http://backbonejs.org/#upgrading>`_)
  * View.dispose() has been replaced by View.stopListening()
  * You should use listenTo() and stopListening() instead of on() and off() since they allow automatic event cleanup when the view is destroyed
  * Model validation is now only enforced by default in Model#save and no longer enforced by default upon construction or in Model#set, unless the {validate:true} option is passed.
  * PubSub has been removed and replaced by using directly Backbone, which now extends Events so it can be used as a global event bus
 * jQuery 1.8.2 to 1.9.1 (`Upgrade guide <http://jquery.com/upgrade-guide/1.9/>`_)
 * Bootstrap 2.1.1 to 2.3 (`Blog post <http://blog.getbootstrap.com/2013/02/07/bootstrap-2-3-released/>`_)
 * Underscore 1.3.3 to 1.4.4 (`Changelog <http://underscorejs.org/#changelog>`_)
 * RequireJS 2.0.6 to 2.1.4 (`Blog posts <http://jrburke.com/tags/requirejs/>`_)

New features and fixes
~~~~~~~~~~~~~~~~~~~~~~

 * Cache buster when using IE in order to avoid lot of bugs caused by IE aggressive caching strategy
 * Fix IE7 and IE8 compatibility
 * Get model validation constraints from server (see resthub/resthub-spring-stack#165) and translate these cosntraints to effective client Backbone Validation constraints.

2.0.0 version (12-03-2013)
--------------------------

Initial release
