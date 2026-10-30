const envPaths = require("env-paths");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const CONFIG_PATH = envPaths("timav").config;
const DATA_PATH = envPaths("timav").data;

const CREDENTIALS_PATH = path.join(CONFIG_PATH, "credentials.json");
const CONFIG_FILE_PATH = path.join(CONFIG_PATH, "config.json");

const tokenPath = (calendar) => path.join(DATA_PATH, `${calendar}-token.json`);

// strip sensitive request details (refresh_token, client_secret, auth headers) from gaxios/googleapis errors before logging
const sanitizeError = (err) => {
  if (!err || typeof err !== "object") {
    return err;
  }

  const safe = {
    message: err.message,
    code: err.code,
    errno: err.errno,
    stack: err.stack,
  };

  if (err.response) {
    safe.response = {
      status: err.response.status,
      statusText: err.response.statusText,
      data: err.response.data,
    };
  }

  return safe;
};

const storeToken = ({ calendar }, token) => {
  const fileName = tokenPath(calendar);

  fs.writeFileSync(fileName, JSON.stringify(token, null, 2));
  console.log("Token stored in: " + fileName);
};

const getNewToken = ({ calendar }, oauth2Client, callback) => {
  if (!process.stdin.isTTY) {
    return callback(
      new Error(
        `no stored token for "${calendar}" and cannot prompt non-interactively; run \`timav cache\` in a terminal to authorize`
      )
    );
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("Authorize this app by visiting this url:", authUrl);
  console.log("After authorizing, you'll be redirected to localhost (which won't load).");
  console.log("Copy the full URL (or just the 'code' parameter) from the URL bar and paste it below.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Paste the URL or code here: ", (input) => {
    rl.close();

    let code = input.trim();
    try {
      const url = new URL(code);
      code = url.searchParams.get("code") || code;
    } catch (_) {}

    oauth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Error while trying to retrieve access token", sanitizeError(err));
        return callback(err);
      }

      oauth2Client.credentials = token;

      storeToken({ calendar }, token);
      callback(null, oauth2Client);
    });
  });
};

const authorize = ({ calendar }, credentials, callback) => {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = "http://localhost";

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  fs.readFile(tokenPath(calendar), (err, token) => {
    if (err) {
      getNewToken({ calendar }, oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(null, oauth2Client);
    }
  });
};

const getCalendars = (auth, callback) => {
  const calendar = google.calendar("v3");
  calendar.calendarList.list({ auth }, callback);
};

module.exports = (callback) => {
  const config = require(CONFIG_FILE_PATH);
  const credentials = require(CREDENTIALS_PATH);

  authorize({ calendar: config.calendar }, credentials, (err, auth) => {
    if (err) {
      console.error(sanitizeError(err));
      process.exit(1);
    }

    getCalendars(auth, (err, res) => {
      if (err) {
        console.error(sanitizeError(err));
        process.exit(1);
      }

      const calendar = res.data.items.find(
        ({ summary }) => summary === config.calendar
      );

      if (!calendar) {
        console.error("Error: no matching calendar found");
        process.exit(1);
      }

      callback({ auth, calendar });
    });
  });
};

process.on("unhandledRejection", (error) => console.error(sanitizeError(error)));
