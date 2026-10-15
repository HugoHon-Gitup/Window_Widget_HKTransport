@echo off
title HK Transport Widget (EasyBoard)
cd /d "%~dp0"
echo Starting Hong Kong Transport Desktop Widget...
set ELECTRON_RUN_AS_NODE=
node launcher.cjs
