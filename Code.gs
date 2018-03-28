var API_TOKEN = 'YOUR-BOT-TOKEN';
var APP_URL = 'YOUR-SCRIPT-URL';
var BOT_NAME = 'YOUR-BOT-NAME';
var CACHE = CacheService.getScriptCache();
var TELEGRAM_URL = 'https://api.telegram.org/bot' + API_TOKEN;


function getMe() {
  var url = TELEGRAM_URL + '/getMe';
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function setWebhook() {
  var url = TELEGRAM_URL + '/setWebhook?url=' + APP_URL;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

function doPost(e) {
  var message = JSON.parse(e.postData.contents).message;
  var chatId = message.chat.id;
  var ssid = CACHE.get(chatId);
  var text = message.text || message.caption;
  var commandArr = text.split(' ')[0].split('@');
  
  if (commandArr[1] && commandArr[1] != BOT_NAME) {
    return;
  }

  switch (findCommandIdx(commandArr[0])) {
    case 0:
      !ssid ? sendText(chatId, 'No tessara session in progress') : executeReport(message, chatId, ssid);
      break;
    case 1:
      ssid ? sendText(chatId, 'Tessara session is in progress') : executeStartTest(message, chatId);
      break;
    case 2:
      !ssid ? sendText(chatId, 'No tessara session in progress') : executeEndTest(chatId, ssid);
    default:
      break;
  }
}

function findCommandIdx(command) {
  var commandList = ['/report', '/start_test', '/end_test'];  
  return commandList.indexOf(command);
}

function executeReport(message, chatId, ssid) {
  var text = message.text || message.caption;
  var content = text.split(' ').slice(1).join(' ');
  var entities = message.entities || message.caption_entities;
  var files = message.photo || message.document || message.video;
  var username = message.from.username;

  if (!files && !content) {
    return sendText(chatId, '@' + username + ' content is missing');
  }

  var name = message.from.first_name;
  var hashtags = entities.length > 1 ? getHashtags(text, entities) : '';
  var fileUrl = files ? getFileUrl(files) : '';
  SpreadsheetApp.openById(ssid).getSheets()[0].appendRow([new Date(), name, username, content, hashtags, fileUrl]);
  sendText(chatId, '@' + username + ' comments have been added');
}

function executeStartTest(message, chatId) {
  var content = message.text.split(' ').slice(1).join(' ');
  var googleId = content.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  if (!googleId) {
    return sendText(chatId, 'Invalid spreadsheet URL provided');
  }

  CACHE.put(chatId, googleId[1], 21600);
  sendText(chatId, 'Tessara session has started');
}

function executeEndTest(chatId, ssid) {
  var tmpSsid = ssid;
  CACHE.remove(chatId);
  addStatsSheet(tmpSsid);
  return sendText(chatId, 'Tessara session has ended');
}

function getHashtags(text, entities) {
  var hashtags = entities.reduce(function (filtered, entity) {
    if (entity.type == 'hashtag') {
      filtered.push(text.substr(entity.offset, entity.length));
    }
    return filtered;
  }, []);
  return hashtags.join(' ');
}

function getFileUrl(files) {
  var fileId = files instanceof Array ? files[0].file_id : files.file_id;
  var url = TELEGRAM_URL + '/getFile?file_id=' + fileId;
  var response = UrlFetchApp.fetch(url);
  var filePath = JSON.parse(response.getContentText()).result.file_path;
  return fileUrl = 'https://api.telegram.org/file/bot' + API_TOKEN + '/' + filePath;
}

function addStatsSheet(ssid) {
  var sheetName = 'Satistics - ' + new Date();
  SpreadsheetApp.openById(ssid).insertSheet(sheetName).appendRow(['No. of participants', '=COUNTUNIQUE(Sheet1!B:B)']);

  var getSheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
  getSheet.appendRow(['No. of reports', '=COUNTIF(Sheet1!A:A,"<>")']);
  getSheet.appendRow([' ']);
  getSheet.appendRow(['Participant', 'No. of reports']);
  getSheet.appendRow(['=UNIQUE(Sheet1!B:B)']);

  var numOfParticipants = getSheet.getRange('B1').getValue() + 4;
  var range = 'B5:B' + numOfParticipants;
  getSheet.getRange(range).setValue('=COUNTIF(Sheet1!B:B,A5)');
}

function sendText(chatId, text) {
  var url = TELEGRAM_URL + '/sendMessage?chat_id=' + chatId + '&text=' + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}