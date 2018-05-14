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
 * GET /sheet
 *
 * Retrieves all data in rows
 */
exports.getData = async (req, res) => {
  const user = await User.findOne({}).exec();
  const sheetTitle = (req.query && req.query.sheetTitle) || 0;

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  const response = await this.getValues(oauth2Client, sheetTitle);
  return res.json(response);
};

/**
 * POST /sheet
 *
 * Inserts a new row on the spreadsheet based on passed data
 */
exports.addData = async (req, res) => {
  const user = await User.findOne({}).exec();
  const sheetTitle = (req.query && req.query.sheetTitle) || 0;

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  const sheetData = await this.getValues(oauth2Client, sheetTitle);
  const startRowIndex = sheetData.length + 1; // adding first row
  const keys = Object.keys(sheetData[0]);
  const data = keys.map(k => req.body[k]);
  const values = [data];
  const majorDimension = "ROWS";
  const valueInputOption = "USER_ENTERED";

  const sheetId = await this.getSheetId(oauth2Client, sheetTitle);

  const request = {
    spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
    resource: {
      data: [
        {
          values: values,
          majorDimension: majorDimension,
          dataFilter: {
            gridRange: {
              startRowIndex: startRowIndex,
              sheetId: sheetId
            }
          }
        }
      ],
      valueInputOption: valueInputOption
    },
    auth: oauth2Client
  };

  sheets.spreadsheets.values.batchUpdateByDataFilter(request, function(
    err,
    result
  ) {
    if (err) {
      // Handle error.
      console.log(err);
    } else {
      console.log(result.data);
      res.json(result.data);
    }
  });
};

/**
 * PUT /sheet
 *
 * Updates a given row depending on matched column name and value
 * and passed data
 */
exports.updateData = async (req, res) => {
  const user = await User.findOne({}).exec();
  const sheetTitle = (req.query && req.query.sheetTitle) || 0;

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  const sheetData = await this.getValues(oauth2Client, sheetTitle);
  const { searchKey, searchVal } = req.params;

  // Determine the row of data to be updated
  searchIndex = null;
  for (i = 0; i < sheetData.length; i++) {
    if (sheetData[i][searchKey] === searchVal) {
      searchIndex = i;
      console.log(
        `Found: ${JSON.stringify(
          sheetData[i],
          null,
          2
        )} at index: ${searchIndex}`
      );
      break;
    }
  }

  if (searchIndex === null) {
    return res.status(200).json({
      message: `Cannot find '${searchVal}' in '${searchKey}' column.`
    });
  }

  const startRowIndex = searchIndex + 1; // adding first row
  const keys = Object.keys(sheetData[0]);
  const data = keys.map(k => req.body[k]);
  const values = [data];
  const majorDimension = "ROWS";
  const valueInputOption = "USER_ENTERED";

  const sheetId = await this.getSheetId(oauth2Client, sheetTitle);

  const request = {
    spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
    resource: {
      data: [
        {
          values: values,
          majorDimension: majorDimension,
          dataFilter: {
            gridRange: {
              startRowIndex: startRowIndex,
              sheetId: sheetId
            }
          }
        }
      ],
      valueInputOption: valueInputOption
    },
    auth: oauth2Client
  };

  sheets.spreadsheets.values.batchUpdateByDataFilter(request, function(
    err,
    result
  ) {
    if (err) {
      // Handle error.
      console.log(err);
    } else {
      console.log(result.data);
      res.json(result.data);
    }
  });
};

/**
 * DELETE /sheet
 *
 * Deletes matched row by column name and value of entire spreadsheet
 */
exports.deleteData = async (req, res) => {
  const user = await User.findOne({}).exec();
  const sheetTitle = (req.params && req.params.sheetTitle) || 0;

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

  const sheetData = await this.getValues(oauth2Client, sheetTitle);
  const { searchKey, searchVal } = req.params;

  // Determine the row of data to be updated
  searchIndex = null;
  for (i = 0; i < sheetData.length; i++) {
    if (sheetData[i][searchKey] === searchVal) {
      searchIndex = i;
      console.log(
        `Found: ${JSON.stringify(
          sheetData[i],
          null,
          2
        )} at index: ${searchIndex}`
      );
      break;
    }
  }

  if (searchIndex === null) {
    return res.status(200).json({
      message: `Cannot find '${searchVal}' in '${searchKey}' column.`
    });
  }

  const startIndex = searchIndex + 1; // adding first row
  const endIndex = searchIndex + 2; // adding first row
  const sheetId = await this.getSheetId(oauth2Client, sheetTitle);

  const request = {
    spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              dimension: "ROWS",
              sheetId: sheetId,
              startIndex: startIndex,
              endIndex: endIndex
            }
          }
        }
      ]
    },
    auth: oauth2Client
  };

  sheets.spreadsheets.batchUpdate(request, function(err, result) {
    if (err) {
      // Handle error.
      console.log(err);
    }

    console.log(result.data);
    res.json(result.data);
  });
};

/**
 * Determine sheetId based on sheet title
 */
exports.getSheetId = async (oauth2Client, sheetTitle = null) => {
  // sheetID is 0 by default, return immediately when not specified
  if (!sheetTitle) {
    return 0;
  }

  // Get spreadsheet information
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
    auth: oauth2Client
  });

  // Find sheet based on title
  const sheet =
    spreadsheet &&
    spreadsheet.data &&
    spreadsheet.data.sheets.find(s => s.properties.title === sheetTitle);

  // Override sheetId when found
  return (sheet && sheet.properties.sheetId) || null;
};

/**
 * Retrieve all data found in spreadsheet
 */
exports.getValues = async (oauth2Client, sheetTitle = null) => {
  const sheetId = await this.getSheetId(oauth2Client, sheetTitle);
  const request = {
    spreadsheetId: process.env.APP_GOOGLE_SHEET_ID,
    resource: {
      dataFilters: [
        {
          gridRange: {
            startRowIndex: 0,
            sheetId: sheetId
          }
        }
      ]
    },
    auth: oauth2Client
  };

  let result;
  try {
    result = await sheets.spreadsheets.values.batchGetByDataFilter(request);
  } catch (err) {
    console.error(err);
    return res.status(500).json(err && err.message);
  }

  const keys = result.data.valueRanges[0].valueRange.values[0];
  const values = result.data.valueRanges[0].valueRange.values;

  // assigning keys to values
  const finalData = values.map(v => {
    newData = {};

    for (i = 0; i < keys.length; i++) {
      newData[keys[i]] = v[i];
    }

    return newData;
  });

  // delete first row of data as it's used as keys
  finalData.shift();

  return finalData;
};

/**
 * Retrieve the keys of spreadsheet.
 * It's always located in the first column
 */
exports.getKeys = async (req, res) => {
  const user = await User.findOne({}).exec();

  oauth2Client.credentials = {
    access_token: user.getApiToken("accessToken"),
    refresh_token: user.getApiToken("refreshToken"),
    expiry_date: true
  };

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
