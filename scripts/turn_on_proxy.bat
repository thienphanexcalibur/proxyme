@if (@X)==(@Y) @end /* JScript comment
@echo off

    cscript //E:JScript //nologo "%~f0" 

exit /b %errorlevel%
@if (@X)==(@Y) @end JScript comment */


var WshShell = new ActiveXObject("WScript.Shell");
WshShell.Run("control inetcpl.cpl ,4");
WshShell.AppActivate("Internet Properties");

WScript.Sleep(200);
WshShell.SendKeys("+{TAB}");
WScript.Sleep(200);

WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{ENTER}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys(" ");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{ENTER}");
WScript.Sleep(200);
WshShell.SendKeys("{ENTER}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys(" ");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{TAB}");
WScript.Sleep(200);
WshShell.SendKeys("{ENTER}");
WScript.Sleep(200);
WshShell.SendKeys("{ESC}");