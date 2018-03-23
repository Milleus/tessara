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

  var startCommand = '/start_test';
  if (regex(startCommand, '(\\s|$)').test(text)) {
    if (ssid == null) {
      var content = text.substr(startCommand.length);
      var givenSsid = content.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      var replyMsg = 'Invalid spreadsheet URL provided, please try again.';
      
      if (givenSsid != null) {
        CACHE.put(chatId, givenSsid[1], 21600);
        replyMsg = 'Tessara session has started.';
      }
      sendText(chatId, replyMsg);
    } else {
      sendText(chatId, 'Tessara session is in progress, use /end_test to end current session.');
    }
  }

  var reportCommand = '/report';
  if (regex(reportCommand, '(\\s|$)').test(text)) {
    if (ssid != null) {
      var entities = data.message.entities || data.message.caption_entities;
      var files = data.message.photo || data.message.document || data.message.video;
      var content = text.substr(reportCommand.length);
      
      if (files || content) {
        var hashtags = entities.length > 1 ? getHashtags(text, entities) : '';
        var fileUrl = files ? getFileUrl(files) : '';
        
        SpreadsheetApp.openById(ssid).getSheets()[0].appendRow([new Date(), name, username, content, hashtags, fileUrl]);
        sendText(chatId, '@' + username + ' comments have been added.');
      } else {
        sendText(chatId, '@' + username + ' please include content.');
      }
    } else {
      sendText(chatId, 'There is no tessara session in progress, use /start_test followed by spreadsheet URL to start new session.');
    }
  }
  
  var endCommand ='/end_test'  
  if (regex(endCommand, '$').test(text)) {
    if (ssid != null) {
      addStatistics(ssid);
      CACHE.remove(chatId);
      sendText(chatId, 'Tessara session has ended.');
    } else {
      sendText(chatId, 'There is no tessara session in progress, use /start_test followed by spreadsheet URL to start new session.');
    }
  }
}

function regex(command, endParams) {
  return new RegExp('^' + command + '(' + endParams + '|@tessara_bot' + endParams + ')' , 'i');
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

function addStatistics(ssid) {
  var sheetName = 'Satistics - ' + new Date();
  SpreadsheetApp.openById(ssid).insertSheet(sheetName).appendRow(['No. of participants', '=COUNTUNIQUE(Sheet1!B:B)']);
  
  var getSheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
  getSheet.appendRow(['No. of reports','=COUNTIF(Sheet1!A:A,"<>")']);
  getSheet.appendRow([' ']);
  getSheet.appendRow(['Participant', 'No. of reports']);
  getSheet.appendRow(['=UNIQUE(Sheet1!B:B)']);
  
  var numOfParticipants = getSheet.getRange('B1').getValue() + 4;
  var range = 'B5:B' + numOfParticipants;
  getSheet.getRange(range).setValue('=COUNTIF(Sheet1!B:B,A5)');
}