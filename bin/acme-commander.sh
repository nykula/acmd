#!/bin/bash
cd "$(dirname "$(realpath "$0")")"/..
NODE_ENV=production gjs bin/start.js