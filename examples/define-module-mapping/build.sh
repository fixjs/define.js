#!/bin/bash

npm install --dev
./node_modules/requirejs/bin/r.js -o build/core.js
./node_modules/requirejs/bin/r.js -o build/feature-a.js
./node_modules/requirejs/bin/r.js -o build/feature-b.js
# python -m SimpleHTTPServer 9000