# Hacky solution for transforming [Timav](http://szymonkaliski.com/projects/timav/) time-tracking events and updating them in google calendar.

## Usage

0. clone and run `yarn`
1. generate `client_secret.json` and save in project directory: (https://developers.google.com/google-apps/calendar/quickstart/nodejs)[https://developers.google.com/google-apps/calendar/quickstart/nodejs] (step 1)
2. run `node ./get-events.js` to get all google calendar events into `./events.json` (might take a while)
3. run `node ./map-events.js ./events.json` to map over them (change `transformSummary` function), transformed events will be saved as `./events-transformed.json`
4. run `node ./save-events.js ./events-transformed.json` to update events in google calendar (might take a while)

