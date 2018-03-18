# Tessara
Tessara consolidate feedback from telegram and store in google spreadsheet. This utilizes Google App Script for web app hosting and Google CacheService for session management.

# Why Tessara was created?
Tessara was created to solve the problem of manual consolidation of feedback from user testing sessions. The main medium used for feedback submission was through Telegram, now Tessara automates that process.

# How to use Tessara?
1. Add @tessara_bot to group.
2. Use provided commands:
- /start_test - start a new session. E.g. "/start_test (google spreadsheet link)". This is to inform Tessara of where data should flow to. Note that you may need to allow Tessara access to Google spreadsheet first.
- /report - report an issue. E.g. "/report can't click button #ios". Can be used with images, documents and video as caption.
- /end_test - end current session.

![alt text](/docs/telegram-chat "Telegram Chat")
![alt text](/docs/google-spreadsheet "Google Spreadsheet")

# Additional information
- Telegram bot to Google App Script web app is using webhook instead of long polling.
- Test sessions are cached for a maximum of 6 hours using [Google CacheService](https://developers.google.com/apps-script/reference/cache/cache-service).
- File links stored in Google spreadsheet are valid for at least 1 hour, see `File` in [Telegram Bot API](https://core.telegram.org/bots/api).

# Tessara Setup (for own reference)
1. Create a Telegram bot through @BotFather.
2. Create a Google App Script project and copy `Code.gs` and `index.html`.
3. Deploy web app on Google App Script interface, `Publish` > `Deploy as web app...`. Note that you will need to set access to `Anyone, even anonymous` otherwise your bot will not be able to talk to your web app, and also allow the script access to your Google Spreadsheet.
4. Copy the web app URL (from Google App Script) and update `APP_URL` in Code.gs.
5. Copy API token (from Telegram @BotFather) and update `API_TOKEN` in Code.gs.
6. Check that API token is correct through Google App Script interface, `Run` > `Run Function` > `getMe`, and then view logs through `View` > `Logs`. You should see a JSON response with your bot details.
7. Set up webhook to your bot through Google App Script interface, `Run` > `Run Function` > `setWebhook`, and then view logs through `View` > `Logs`. You should see a JSON response that webhook has been set.
8. Re-deploy web app on Google App Script interface, `Publish` > `Deploy as web app...` > `Project version` > `New`. Note that you have to select a new version to deploy otherwise web app will not update.