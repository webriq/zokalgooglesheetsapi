const User = require("../models/User");
const { google } = require("googleapis");
const sheets = google.sheets("v4");

// Create an oAuth2 client to authorize the API call
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ID,
  process.env.GOOGLE_SECRET,
  "/auth/google/callback"
);

/**
 * Retrieves all data in rows
 */
exports.getData = async (req, res) => {
  const user = await User.findOne({}).exec();

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  sheets.spreadsheets.values.batchGet(
    {
      auth: oauth2Client,
      spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
      ranges: ["A1:Z1", "A2:Z100"]
    },
    (err, result) => {
      if (err) {
        console.error("The API returned an error.");
        throw err;
      }

      // @todo: Improve key and value assignment code
      const keys = result.data.valueRanges[0].values[0];
      const values = result.data.valueRanges[1].values;

      finalData = values.map(v => {
        newData = {};
        for (i = 0; i < keys.length; i++) {
          newData[keys[i]] = v[i];
        }
        return newData;
      });

      res.json(finalData);
    }
  );
};

/**
 * POST /sheet
 */
exports.addData = async (req, res) => {
  const user = await User.findOne({}).exec();

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  const keys = await this.getKeys();
  let data = keys.map(k => req.body[k]);

  var values = [data];
  var body = {
    values: values
  };
  var valueInputOption = "USER_ENTERED";
  var range = "A1:Z1";
  var spreadsheetId = req.params.id;

  sheets.spreadsheets.values.append(
    {
      auth: oauth2Client,
      spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
      range: range,
      valueInputOption: valueInputOption,
      resource: body
    },
    function(err, result) {
      if (err) {
        // Handle error.
        console.log(err);
      } else {
        console.log(result.data);
        res.json(result.data);
      }
    }
  );
};

/**
 * PUT /sheet
 */
exports.updateData = async (req, res) => {
  const user = await User.findOne({}).exec();

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };
};

/**
 * Retrieve the keys of spreadsheet.
 * It's always the first column of the spreadsheet
 */
exports.getKeys = async (req, res) => {
  const user = await User.findOne({}).exec();

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  // Retrieve first the keys in spreadsheet to determine passed parameters are valid
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        auth: oauth2Client,
        spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
        range: "A1:Z1"
      },
      (err, result) => {
        if (err) {
          console.error("The API returned an error.");
          reject(err);
        }

        resolve(result.data.values[0]);
      }
    );
  });
};
