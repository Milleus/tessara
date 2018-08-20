# Tessara

Tessara records Telegram chat messages and store in Google Sheets. This utilizes Google Apps Script for web app hosting and Google CacheService for session management.

![Tessara Demo](./docs/tessara.gif "Tessara Demo")

## Use Case

Tessara was created to solve the problem of manual consolidation of feedback from user testing sessions. The main media used for feedback submission was through Telegram, now Tessara automates that process.

**_Currently, Tessara only works for spreadsheets accessible (edit permissions) by GovTech DCUBE Google account._**

This is because the web app requests has to be executed by the Google account that host it. Setting the web app to be executable by everyone prevents requests from Telegram, see [Google Apps Script definition of 'Anyone' and 'Anyone, even anonymous'](https://developers.google.com/apps-script/guides/web).

Unless you are willing to give GovTech DCUBE Google account access to your spreadsheets, the best option is to set up another bot yourself.

## Installation Steps

1. Create a Telegram bot through @BotFather, turn off `Group Privacy` for group chat.
2. Create a Google Apps Script project and copy `Code.gs` and `index.html` into it.
3. Deploy web app on Google Apps Script interface, `Publish` > `Deploy as web app...`. Note that you will need to set access to `Anyone, even anonymous` otherwise your bot will not be able to talk to your web app, and also allow the script access to your Google Sheets. If prompted with App not verified warning, click `Advanced` and bypass.
4. Copy the web app URL (from Google Apps Script) and update `APP_URL` in Code.gs.
5. Copy API token (from Telegram @BotFather) and update `API_TOKEN` in Code.gs.
6. Check that API token is correct through Google Apps Script interface, `Run` > `Run Function` > `getMe`, and then view logs through `View` > `Logs`. You should see a JSON response with your bot details.
7. Set up webhook to your bot through Google Apps Script interface, `Run` > `Run Function` > `setWebhook`, and then view logs through `View` > `Logs`. You should see a JSON response that webhook has been set.
8. Re-deploy web app on Google Apps Script interface, `Publish` > `Deploy as web app...` > `Project version` > `New`. Note that you have to select a new version to deploy otherwise web app will not update.

You may also need to rename some hardcoded text such as `Tessara` and `@tessara_bot`.

## Commands

- `/start_session https://docs.google.com/spreadsheets/d/GOOGLE-SHEETS-ID/edit#gid=0`

  Start a new recording session with Google Sheets link to inform your bot of where data should flow to. Once session is started, bot will record all messages including photos, videos and documents.

- `/end_session`

  End the current recording session. An additional sheet will be created with statistics such as no. of participants, no. of reports, and individual participants and reports.

## Additional Information

- Telegram bot uses webhook instead of long polling.
- Only one session per chat group can be active. Sessions are cached for a maximum of 6 hours using Google CacheService.
- File links are by Telegram API, they are valid for at least 1 hour.

## Resources

- Google Apps Script - https://developers.google.com/apps-script/
- Google CacheService - https://developers.google.com/apps-script/reference/cache/cache-service
- Google Sheets - https://www.google.com/sheets/about/
- Telegram Bot API - https://core.telegram.org/bots/api
