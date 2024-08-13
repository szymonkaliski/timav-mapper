const fs = require("fs");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const { default: inquirer } = require("inquirer");
const readline = require("readline");

const prop = (key) => (obj) => obj[key];

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = ".credentials.json";

const storeToken = (token) => {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log("Token stored to " + TOKEN_PATH);
};

const getNewToken = (oauth2Client, callback) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url: ", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
};

const authorize = (credentials, callback) => {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
};

const getCalendars = ({ auth, callback }) => {
  const calendar = google.calendar("v3");

  const config = { auth };

  calendar.calendarList.list(config, callback);
};

const chooseCalendar = ({ auth, callback }) => {
  getCalendars({
    auth,
    callback: (err, list) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      inquirer
        .prompt([
          {
            type: "list",
            name: "calendar",
            message: "Which calendar has Timav tracking data?",
            choices: list.data.items.map(prop("summary")),
          },
        ])
        .then(({ calendar }) =>
          callback(list.data.items.find((item) => item.summary === calendar))
        );
    },
  });
};

module.exports = (callback) => {
  fs.readFile("client_secret.json", (err, content) => {
    if (err) {
      console.log("Error loading client secret file: " + err);
      return;
    }

    authorize(JSON.parse(content), (auth) => {
      chooseCalendar({
        auth,
        callback: (calendar) => {
          callback({ auth, calendar });
        },
      });
    });
  });
};

process.on("unhandledRejection", (error) => console.error(error.stack));
