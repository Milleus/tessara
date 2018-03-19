# Tessara
Tessara is a Telegram bot that consolidates feedback from Telegram and store in Google Sheets. This utilizes Google Apps Script for web app hosting and Google CacheService for session management.

# Why Tessara was created?
Tessara was created to solve the problem of manual consolidation of feedback from user testing sessions. The main medium used for feedback submission was through Telegram, now Tessara automates that process.

# How to use Tessara?
1. Go to this link, [Tessara](https://drive.google.com/open?id=1DsyGflX_z7oSoMwmFbZr0Wx-zgrRcvUj_autISTPHsLrxEWTKDwVHYzc).
2. On Google Apps Script interface, select `Run` > `Run Function` > `getMe`, this should trigger authorization prompt.
3. Select `Review Permissions`, select Google account and Allow Tessara access. If it prompts that app isn't verified, click `Advanced` and `Go to Tessara (unsafe)`, and allow Tessara access.
4. Add @tessara_bot to group.
5. Use provided commands:
- **/start_test (Google Sheets link)**

  Start a new session with Google Sheets link to inform Tessara of where data should flow to.
  For example, `/start_test https://docs.google.com/spreadsheets/d/GOOGLE-SHEETS-ID/edit#gid=0`.
  Note that Tessara must have access to your Google Drive account.
  
- **/report (issue with optional hashtags)**
  
  Report an issue, can be used with hashtags for categorizing in Google Sheets.
  For example, `/report can't click button #ios #mobile`.
  Can also be used with images, documents and video if placed in caption.
  
- **/end_test**

  End current session.

![Telegram Chat](https://github.com/Milleus/tessara/blob/master/docs/telegram-chat.png "Telegram Chat")
![Google Sheets](https://github.com/Milleus/tessara/blob/master/docs/google-sheets.png "Google Sheets")

# Additional information
- Telegram bot to Google Apps Script web app is using webhook instead of long polling.
- Test sessions are cached for a maximum of 6 hours using Google CacheService.
- File links stored in Google Sheets are valid for at least 1 hour, see `File` in [Telegram Bot API](https://core.telegram.org/bots/api).

# Resources
- [Google Apps Script](https://developers.google.com/apps-script/)
- [Google CacheService](https://developers.google.com/apps-script/reference/cache/cache-service)
- [Google Sheets](https://www.google.com/sheets/about/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
