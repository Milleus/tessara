# Tessara
Tessara is a Telegram bot that consolidates feedback from Telegram and store in Google Sheets. This utilizes Google Apps Script for web app hosting and Google CacheService for session management.

# Why Tessara was created?
Tessara was created to solve the problem of manual consolidation of feedback from user testing sessions. The main medium used for feedback submission was through Telegram, now Tessara automates that process.

# How to use Tessara?
1. Add @tessara_bot to group.
2. Use provided commands:
- /start_test - start a new session. E.g. `/start_test (Google Sheets link)`. This is to inform Tessara of where data should flow to. Note that you may need to allow Tessara access to Google Sheets first.
- /report - report an issue. E.g. `/report can't click button #ios`. Can be used with images, documents and video as caption.
- /end_test - end current session.

![alt text](https://github.com/Milleus/tessara/blob/master/docs/telegram-chat.png "Telegram Chat")
![alt text](https://github.com/Milleus/tessara/blob/master/docs/google-sheets.png "Google Sheets")

# Additional information
- Telegram bot to Google Apps Script web app is using webhook instead of long polling.
- Test sessions are cached for a maximum of 6 hours using [Google CacheService](https://developers.google.com/apps-script/reference/cache/cache-service).
- File links stored in Google Sheets are valid for at least 1 hour, see `File` in [Telegram Bot API](https://core.telegram.org/bots/api).

# Tessara Setup (for own reference)
1. Create a Telegram bot through @BotFather.
2. Create a Google Apps Script project and copy `Code.gs` and `index.html`.
3. Deploy web app on Google Apps Script interface, `Publish` > `Deploy as web app...`. Note that you will need to set access to `Anyone, even anonymous` otherwise your bot will not be able to talk to your web app, and also allow the script access to your Google Sheets.
4. Copy the web app URL (from Google Apps Script) and update `APP_URL` in Code.gs.
5. Copy API token (from Telegram @BotFather) and update `API_TOKEN` in Code.gs.
6. Check that API token is correct through Google Apps Script interface, `Run` > `Run Function` > `getMe`, and then view logs through `View` > `Logs`. You should see a JSON response with your bot details.
7. Set up webhook to your bot through Google Apps Script interface, `Run` > `Run Function` > `setWebhook`, and then view logs through `View` > `Logs`. You should see a JSON response that webhook has been set.
8. Re-deploy web app on Google Apps Script interface, `Publish` > `Deploy as web app...` > `Project version` > `New`. Note that you have to select a new version to deploy otherwise web app will not update.
