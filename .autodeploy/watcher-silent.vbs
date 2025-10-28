' Silent launcher for Auto-Deploy Watcher
' Runs Node.js watcher without visible console window
' Created: 2025-10-28
' Part of Hybrid Automation System v3.0

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' Check if Node.js is available
On Error Resume Next
WshShell.Run "node --version", 0, True
If Err.Number <> 0 Then
    MsgBox "Error: Node.js is not installed or not in PATH" & vbCrLf & vbCrLf & _
           "Please install Node.js from https://nodejs.org", vbCritical, "Auto-Deploy Watcher"
    WScript.Quit 1
End If
On Error Goto 0

' Check if watcher.js exists
WatcherPath = ScriptDir & "\watcher.js"
If Not FSO.FileExists(WatcherPath) Then
    MsgBox "Error: watcher.js not found at:" & vbCrLf & WatcherPath, vbCritical, "Auto-Deploy Watcher"
    WScript.Quit 1
End If

' Run the watcher in hidden mode
' Window style 0 = hidden, False = don't wait for completion
WshShell.Run "cmd /c cd /d """ & ScriptDir & """ && node watcher.js", 0, False

' Clean up
Set WshShell = Nothing
Set FSO = Nothing
