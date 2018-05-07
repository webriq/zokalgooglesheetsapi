/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
	res.json({
		message: "Zokal Google Sheets API is up and running!",
		version: parseInt(process.env.APP_VERSION) || 0.1,
		spreadsheetId: process.env.APP_GOOGLE_SHEET_ID || "ERROR_NOT_SET"
	});
};
