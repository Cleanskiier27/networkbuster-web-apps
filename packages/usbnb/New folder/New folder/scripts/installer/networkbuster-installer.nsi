!include MUI2.nsh
!ifndef STAGEDIR
  !define STAGEDIR "${INSTALLER_STAGING}"
!endif

!define APP_NAME "NetworkBuster"
!define VERSION "${VERSION}"
!define COMPANY "NetworkBuster"

; Optional custom icon (place scripts/installer/icon.ico)
!ifdef ICON_FILE
  Icon "${ICON_FILE}"
!endif

; Require admin to write to Program Files
RequestExecutionLevel admin

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${STAGEDIR}\\scripts\\installer\\EULA.txt"

; Network Boost custom page (checkbox) - uses nsDialogs
Page custom NetworkBoostPageCreate NetworkBoostPageLeave

Function NetworkBoostPageCreate
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  ; Label
  ${NSD_CreateLabel} 0u 10u 100% 12u "Optional: Apply Network Boost (recommended). This will run a small script to apply safe network tuning changes."
  Pop $1
  ; Checkbox
  ${NSD_CreateCheckBox} 0u 30u 100% 12u "Apply Network Boost (recommended)"
  Pop $2
  ; Default is unchecked for safety
  ${NSD_SetState} $2 0
  StrCpy $NETWORKBOOST_HANDLE $2
  nsDialogs::Show
FunctionEnd

Function NetworkBoostPageLeave
  ${NSD_GetState} $NETWORKBOOST_HANDLE $0
  StrCmp $0 1 +2
    StrCpy $NETWORKBOOST "0"
  StrCpy $NETWORKBOOST "1"
FunctionEnd
!insertmacro MUI_PAGE_DIRECTORY
Page custom NetworkBoostPage NetworkBoostPageLeave
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

Var NETWORKBOOST_HANDLE
Var NETWORKBOOST

!insertmacro MUI_UNPAGE_CONFIRM

Var StartMenuFolder

Section "Install"
  SetOutPath "$INSTDIR"

  ; Copy staged files
  File /r "${STAGEDIR}\\*"

  ; Copy icon into install dir if present
  ; (icon should be present in staging scripts/installer/icon.ico)
  ; Create Start Menu folder
  CreateDirectory "$SMPROGRAMS\\${APP_NAME}"
  StrCpy $StartMenuFolder "$SMPROGRAMS\\${APP_NAME}"

  ; Create Start Menu shortcut (use installed icon if present)
  ${If} ${FileExists} "$INSTDIR\\scripts\\installer\\icon.ico"
    CreateShortCut "$StartMenuFolder\\${APP_NAME}.lnk" "$INSTDIR\\start-desktop.bat" "" "$INSTDIR\\scripts\\installer\\icon.ico" 0
    CreateShortCut "$DESKTOP\\${APP_NAME} Launcher.lnk" "$INSTDIR\\start-desktop.bat" "" "$INSTDIR\\scripts\\installer\\icon.ico" 0
  ${Else}
    CreateShortCut "$StartMenuFolder\\${APP_NAME}.lnk" "$INSTDIR\\start-desktop.bat" "" "" 0
    CreateShortCut "$DESKTOP\\${APP_NAME} Launcher.lnk" "$INSTDIR\\start-desktop.bat" "" "" 0
  ${EndIf}

  ; Run Network Boost script if user opted in
  StrCmp $NETWORKBOOST "1" 0 +3
    ; Run as elevated PowerShell (installer already elevated). -Apply -Confirm:$false to run non-interactive
    ExecWait '"$SYSDIR\\WindowsPowerShell\\v1.0\\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "$INSTDIR\\scripts\\network-boost.ps1" -Apply -Confirm:$false'

  ; Write version to registry
  WriteRegStr HKLM "Software\\${COMPANY}\\${APP_NAME}" "DisplayVersion" "${VERSION}"

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
SectionEnd

Section "Uninstall"
  RMDir /r "$INSTDIR"
  DeleteRegKey HKLM "Software\\${COMPANY}\\${APP_NAME}"
  Delete "$DESKTOP\\${APP_NAME} Launcher.lnk"
  Delete "$SMPROGRAMS\\${APP_NAME}\\${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\\${APP_NAME}"
SectionEnd