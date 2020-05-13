#!/bin/bash

gulp clean;
gulp copy;
gulp bundle;
gulp rename; 
gulp replace;
./tester/Firmware/minifier.py Firmware.ino -> ./public/tester/Firmware.min.ino