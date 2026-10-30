# Hacky solution for transforming [Timav](http://szymonkaliski.com/projects/timav/) time-tracking events and updating them in google calendar.

## Usage

0. clone and run `npm install`
1. ensure `timav-cli` is configured and authenticated
2. run `node ./get-events.js` to get all google calendar events into `./events.json` (might take a while)
3. run `node ./map-events.js ./events.json` to map over them, transformed events will be saved as `./events-transformed.json`
4. run `node ./save-events.js ./events-transformed.json` to update events in google calendar (might take a while)

