echo off
set arg1=%1
set arg2=%2
shift
shift
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v AutoConfigURL /t REG_SZ /d %arg1% /f
