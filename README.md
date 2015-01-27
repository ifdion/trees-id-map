basic-grunt-php
===============

This is a basic template for php developers who wants to implement Grunt automation on their workflow. You can merge the content of this repository into your php application, be it WordPress theme or plugin, YII framework theme or other kind of php project. Currently this template uses :

  - "grunt-contrib-concat": merge JavaScript files to reduce requests on page load,
  - "grunt-contrib-jshint": notify errors on JavaScript files,
  - "grunt-contrib-less": pre process CSS using LESS,
  - "grunt-contrib-sass": or use SCSS if you prefer,
  - "grunt-contrib-uglify": minify the merged JavaScript file to reduce file size,
  - "grunt-contrib-cssmin": minify the processed CSS to reduce file size,
  - "grunt-contrib-watch": and watch changes happen automatically on file saves without refreshing the browser,

Requirement
-----------
Grunt and it's plugins requires a running node server on your machine. You can download and install Node from http://nodejs.org/download/ . Before setting up Grunt ensure that your npm is up-to-date by running `npm update -g npm` (this might require sudo on certain systems).

In order to get started, you'll want to install Grunt's command line interface (CLI) globally. You may need to use sudo (for OSX, *nix, BSD etc) or run your command shell as Administrator (for Windows) to do this.

    npm install -g grunt-cli
    
This will put the grunt command in your system path, allowing it to be run from any directory.

Install the LiveReload plugin to your browser to automatically refresh the browser as you edit and save any .php, .less, .scss or .js in the directory. On Chrome : https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en . On Firefox https://addons.mozilla.org/en-US/firefox/addon/livereload/

Workflow
--------
* Clone this repository.
* Merge the directory content to you php application directory.
* Open `bower.json` and `package.json`, then update the project details.
* Open the directory in terminal and run `npm install` to install node modules and then `bower install` to install front end dependencies.
* Runt `grunt watch` and start watch file changes by activating the Livereload plugin on your browser.
* Make something awesome.
