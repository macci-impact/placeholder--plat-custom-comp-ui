/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");

const git = simpleGit();
const OUTPUT_DIRECTORY = "dist";
const FILE_NAME = "build-info.json";

async function writeInfo() {
  try {
    const branchSummary = await git.branch();
    const currentBranch = branchSummary.current;
    const commitHash = await git.revparse(["HEAD"]);
    const date = new Date(Date.now()).toUTCString();

    const info = {
      branch: currentBranch,
      commit: commitHash,
      buildDate: date,
    };

    const filePath = path.join(__dirname, OUTPUT_DIRECTORY, FILE_NAME);
    fs.writeFileSync(filePath, JSON.stringify(info, null, 2));

    console.log(`Git info written to ${filePath}`);
  } catch (error) {
    console.error("Error writing git info:", error);
  }
}

writeInfo();
