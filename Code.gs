var API_TOKEN = 'YOUR-BOT-TOKEN';
var TELEGRAM_URL = 'https://api.telegram.org/bot' + API_TOKEN;
var APP_URL = 'YOUR-SCRIPT-URL';
var CACHE = CacheService.getScriptCache();

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
  var data = JSON.parse(e.postData.contents);
  var text = data.message.text || data.message.caption;
  var chatId = data.message.chat.id;
  var name = data.message.from.first_name;
  var username = data.message.from.username;
  var ssid = CACHE.get(chatId);
  
  if (/^\/start_test\s/.test(text) && ssid == null) {
    var content = text.substr('/start_test'.length);
    var regexSsid = content.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    var reply = '@' + username + ' invalid google spreadsheet URL.';
    
    if (regexSsid != null && regexSsid.length == 2) {
      CACHE.put(chatId, regexSsid[1]);
      reply = '@' + username + ' tessara has started.';
    }

    sendText(chatId, reply);
  }

  if (/^\/report\s/.test(text) && ssid != null) {
    var entities = data.message.entities || data.message.caption_entities;
    var files = data.message.photo || data.message.document || data.message.video;
    var content = text.substr('/report'.length);
    var hashtags = entities.length > 1 ? getHashtags(text, entities) : '';
    var fileUrl = files ? getFileUrl(files) : '';
    
    SpreadsheetApp.openById(ssid).getSheets()[0].appendRow([new Date(), name, username, content, hashtags, fileUrl]);
    var reply = '@' + username + ' your comments have been added.';
    sendText(chatId, reply);
  }
  
  if (/^\/end_test$/.test(text) && ssid != null) {
    CACHE.remove(chatId);
    var reply = '@' + username + ' tessara has ended.';
    sendText(chatId, reply);
  }
}

function regex(command) {
  return new RegExp('^' + command + '\\s', 'i');
}

function getHashtags(text, entities) {
  var hashtags = entities.reduce(function(filtered, entity) {
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

function sendText(chatId, text) {
  var url = TELEGRAM_URL + '/sendMessage?chat_id=' + chatId + '&text=' + text;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}