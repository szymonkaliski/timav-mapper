const fs = require('fs');
const google = require('googleapis');

const getAuth = require('./get-auth');

const getEvents = ({ auth, calendarId, callback, pageToken }) => {
  const calendar = google.calendar('v3');

  const config = {
    calendarId,
    auth,
    maxResults: 100,
    singleEvents: true
  };

  if (pageToken) {
    config.pageToken = pageToken;
  }

  calendar.events.list(config, callback);
};

const getAllEvents = ({ auth, calendarId, callback, pageToken, allEvents }) => {
  allEvents = allEvents || [];

  getEvents({
    auth,
    calendarId,
    pageToken,
    callback: (err, response) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      const nextAllEvents = allEvents.concat(response.items);

      console.log('next page token', response.nextPageToken);

      if (!response.nextPageToken) {
        return callback(null, nextAllEvents);
      }

      getAllEvents({
        auth,
        calendarId,
        callback,
        pageToken: response.nextPageToken,
        allEvents: nextAllEvents
      });
    }
  });
};

getAuth(({ auth, calendar }) => {
  getAllEvents({
    calendarId: calendar.id,
    auth,
    callback: (err, events) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      fs.writeFileSync('./events.json', JSON.stringify(events, null, 2), 'utf-8');
      console.log('events saved to ./events.json');
    }
  });
});
