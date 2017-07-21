const google = require('googleapis');
const async = require('async');

const getAuth = require('./get-auth');

const dataFile = process.argv[2];

if (!dataFile) {
  console.log('provide events json as argument!');
  process.exit(0);
}

const updatedEvents = require(dataFile);

const updateEvent = ({ event, calendarId, auth, callback }) => {
  const calendar = google.calendar('v3');

  const config = {
    auth,
    calendarId,
    eventId: event.id,
    resource: event
  };

  calendar.events.update(config, callback);
};

const updateEvents = ({ auth, calendarId }) => {
  async.eachSeries(updatedEvents, (updatedEvent, callback) => {
    console.log(updatedEvent);
    console.log();

    updateEvent({ event: updatedEvent, calendarId, auth, callback });
  });
};

getAuth(({ auth, calendar }) => {
  updateEvents({ auth, calendarId: calendar.id });
});
