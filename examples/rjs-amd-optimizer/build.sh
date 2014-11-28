#!/bin/bash

npm install --dev
./node_modules/requirejs/bin/r.js -o build.js
python -m SimpleHTTPServer 9000