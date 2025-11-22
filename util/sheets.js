import { google } from "googleapis";
import fs from "fs";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const credentials = JSON.parse(fs.readFileSync("gapi.json"));

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Initialize Sheets API client
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Read all rows from a sheet
 * @param {string} sheetName - The name of the sheet (e.g. "Subscriptions")
 * @param {string} range - Optional range (default: all columns A:Z)
 */
export async function readSheet(sheetName, range = `${sheetName}!A:Z`) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  return res.data.values || [];
}

/**
 * Update a row by matching one column
 * @param {string} sheetName - Sheet name
 * @param {string} matchColumnName - Header name to match (e.g. "Name")
 * @param {string} matchValue - Value to find (e.g. "Hulu")
 * @param {object} updateData - Object mapping header → new value
 */
export async function updateRow(sheetName, matchColumnName, matchValue, updateData) {
  // Get all data (including headers)
  const values = await readSheet(sheetName);
  if (!values.length) throw new Error("Sheet is empty");

  const headers = values[0];
  const matchColIndex = headers.indexOf(matchColumnName);
  if (matchColIndex === -1) throw new Error(`Column "${matchColumnName}" not found`);

  // Find target row
  const rowIndex = values.findIndex((row, i) => i > 0 && row[matchColIndex] === matchValue);
  if (rowIndex === -1) {
    console.log(`⚠️ No match found for ${matchColumnName}="${matchValue}"`);
    return null;
  }

  // Merge existing row values with updates
  const targetRow = [...values[rowIndex]];
  for (const [key, val] of Object.entries(updateData)) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) targetRow[colIndex] = val;
  }

  const range = `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`; // +1 because Sheets are 1-based

  console.log(`Updating row in ${sheetName} where ${matchColumnName}="${matchValue}":`);
  console.log(updateData)
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { values: [targetRow] },
  });

  console.log(`✅ Updated row for ${matchValue}`);
  return targetRow;
}

/**
 * Append a new row
 * @param {string} sheetName
 * @param {object} data - Object mapping header → value
 */
export async function addRow(sheetName, data) {
  const values = await readSheet(sheetName);
  if (!values.length) throw new Error("Sheet is empty or missing headers");

  const headers = values[0];
  const newRow = headers.map((h) => data[h] || "");

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: sheetName,
    valueInputOption: "USER_ENTERED",
    resource: { values: [newRow] },
  });

  console.log(`➕ Added new row to ${sheetName}`);
  return newRow;
}