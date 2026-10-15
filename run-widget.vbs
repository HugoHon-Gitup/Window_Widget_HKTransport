Set WshShell = CreateObject("WScript.Shell")
Dim fso, scriptDir
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.CurrentDirectory = scriptDir
On Error Resume Next
WshShell.Environment("PROCESS").Remove("ELECTRON_RUN_AS_NODE")
On Error GoTo 0

' Launch silently with 0 (no black console window)
WshShell.Run "node launcher.cjs", 0, False
