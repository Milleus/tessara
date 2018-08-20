var API_TOKEN = "YOUR-BOT-TOKEN";
var APP_URL = "YOUR-SCRIPT-URL";
var BOT_NAME = "YOUR-BOT-NAME";
var CACHE = CacheService.getScriptCache();
var TELEGRAM_URL = "https://api.telegram.org/bot" + API_TOKEN;

function getMe() {
  var url = TELEGRAM_URL + "/getMe";
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = TELEGRAM_URL + "/setWebhook?url=" + APP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile("index");
}

function doPost(e) {
  var message = JSON.parse(e.postData.contents).message;
  var chatId = message.chat.id;
  var ssid = CACHE.get(chatId);
  var text = message.text || message.caption || "";
  var commandArr = text.split(" ")[0].split("@");

  if (commandArr[1] && commandArr[1] != BOT_NAME) {
    return;
  }

  switch (commandArr[0]) {
    case "/start_session":
      createSession(ssid, chatId, message);
      break;
    case "/end_session":
      endSession(ssid, chatId);
      break;
    default:
      storeMessage(ssid, message);
      break;
  }
}

function createSession(ssid, chatId, message) {
  if (ssid) {
    return sendText(chatId, "Tessara session is in progress");
  }

  var content = message.text.split(" ").slice(1).join(" ");
  var googleId = content.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  if (!googleId) {
    return sendText(chatId, "Invalid spreadsheet URL provided");
  }

  CACHE.put(chatId, googleId[1], 21600);

  return sendText(chatId, "Tessara session has started");
}

function endSession(ssid, chatId) {
  if (!ssid) {
    return sendText(chatId, "No tessara session in progress");
  }

  var tmpSsid = ssid;
  CACHE.remove(chatId);
  createStatsSheet(tmpSsid);

  return sendText(chatId, "Tessara session has ended");
}

function storeMessage(ssid, message) {
  if (!ssid) {
    return;
  }

  var name = message.from.first_name || "";
  var username = message.from.username || "";
  var text = message.text || message.caption || "";
  var entities = message.entities || message.caption_entities;
  var hashtags = getHashtags(text, entities);
  var files = message.photo || message.document || message.video;
  var fileUrl = getFileUrl(files);

  SpreadsheetApp.openById(ssid).getSheets()[0].appendRow([new Date(), name, username, text, hashtags, fileUrl]);
}

function sendText(chatId, text) {
  var url = TELEGRAM_URL + "/sendMessage?chat_id=" + chatId + "&text=" + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function getHashtags(text, entities) {
  if (!entities) {
    return "";
  }

  var hashtags = entities.reduce(function(filtered, entity) {
    if (entity.type == "hashtag") {
      filtered.push(text.substr(entity.offset, entity.length));
    }
    return filtered;
  }, []);

  return hashtags.join(" ");
}

function getFileUrl(files) {
  if (!files) {
    return "";
  }

  var fileId = files instanceof Array ? files[files.length - 1].file_id : files.file_id;
  var url = TELEGRAM_URL + "/getFile?file_id=" + fileId;
  var response = UrlFetchApp.fetch(url);
  var filePath = JSON.parse(response.getContentText()).result.file_path;

  return "https://api.telegram.org/file/bot" + API_TOKEN + "/" + filePath;
}

function createStatsSheet(ssid) {
  var sheetName = "Statistics - " + new Date();
  SpreadsheetApp.openById(ssid).insertSheet(sheetName).appendRow(["No. of participants", "=COUNTUNIQUE(Sheet1!B:B)"]);

  var getSheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
  getSheet.appendRow(["No. of reports", "=COUNTIF(Sheet1!A:A,'<>')"]);
  getSheet.appendRow([" "]);
  getSheet.appendRow(["Participant", "No. of reports"]);
  getSheet.appendRow(["=UNIQUE(Sheet1!B:B)"]);

  var numOfParticipants = getSheet.getRange("B1").getValue() + 4;
  var range = "B5:B" + numOfParticipants;
  getSheet.getRange(range).setValue("=COUNTIF(Sheet1!B:B,A5)");
}
