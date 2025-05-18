var DEFAULT_IMAGE_URL = 'https://goo.gl/bMqzYS';
var HEADER = {
  header: {
    title: 'Attendance Bot',
    subtitle: 'Log your vacation time',
    imageUrl: DEFAULT_IMAGE_URL
  }
};

var REASON = {
  SICK: 'Out sick',
  OTHER: 'Out of office'
};

function createCardResponse(widgets) {
  return {
    cards: [HEADER, {
      sections: [{
        widgets: widgets
      }]
    }]
  };
}

function onMessage(event) {
  console.info(event);
  var reason = REASON.OTHER;
  var name = event.user.displayName;
  var userMessage = event.message.text;

  if (userMessage.indexOf('sick') > -1) {
    HEADER.header.imageUrl = 'https://goo.gl/mnZ37b';
    reason = REASON.SICK;
  } else if (userMessage.indexOf('vacation') > -1) {
    HEADER.header.imageUrl = 'https://goo.gl/EbgHuc';
  }

  var widgets = [{
    textParagraph: {
      text: 'Hello, ' + name + '.<br>Are you taking time off today?'
    }
  }, {
    buttons: [{
      textButton: {
        text: 'Set vacation in Gmail',
        onClick: {
          action: {
            actionMethodName: 'turnOnAutoResponder',
            parameters: [{
              key: 'reason',
              value: reason
            }]
          }
        }
      }
    }, {
      textButton: {
        text: 'Block out day in Calendar',
        onClick: {
          action: {
            actionMethodName: 'blockOutCalendar',
            parameters: [{
              key: 'reason',
              value: reason
            }]
          }
        }
      }
    }]
  }];

  return createCardResponse(widgets);
}

function onCardClick(event) {
  console.info(event);
  var message = '';
  var reason = event.action.parameters[0].value;

  if (event.action.actionMethodName === 'turnOnAutoResponder') {
    turnOnAutoResponder(reason);
    message = 'Turned on vacation settings.';
  } else if (event.action.actionMethodName === 'blockOutCalendar') {
    blockOutCalendar(reason);
    message = 'Blocked out your calendar for the day.';
  } else {
    message = "I'm not sure which button you clicked.";
  }

  return { text: message };
}

var ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;

function turnOnAutoResponder(reason) {
  var currentTime = (new Date()).getTime();

  Gmail.Users.Settings.updateVacation({
    enableAutoReply: true,
    responseSubject: reason,
    responseBodyHtml: "I'm out of the office today; will be back tomorrow.<br><br><i>Created by Attendance Bot!</i>",
    restrictToContacts: true,
    restrictToDomain: true,
    startTime: currentTime,
    endTime: currentTime + ONE_DAY_MILLIS
  }, 'me');
}

function blockOutCalendar(reason) {
  CalendarApp.createAllDayEvent(reason, new Date(), new Date(Date.now() + ONE_DAY_MILLIS));
}

