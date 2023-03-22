import fs from "node:fs";

function loadJSON(filename: string = "") {
  return JSON.parse(
    fs.existsSync(filename) ? fs.readFileSync(filename).toString() : '""'
  );
}

function saveJSON(filename: string = "", json: any = '""') {
  return fs.writeFileSync(filename, JSON.stringify(json, null, 2));
}

export type UserType = {
  id: string;
  accessToken: string;
  refreshToken: string;
  expires_in: number;
};

export default {
  loadJSON,
  saveJSON,
};
