// Ad-hoc code signing for the macOS build. Without any signature, macOS 15 reports a downloaded
// copy as "damaged" and refuses to open it. An ad-hoc signature (identity "-") needs no Apple
// account and turns that into the "unverified developer" prompt with an Open Anyway path.
// Self-updates never carry the quarantine flag, so this only matters for the first install.
const { execFileSync } = require("node:child_process");
const { join } = require("node:path");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = join(context.appOutDir, appName);
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", "--timestamp=none", appPath], { stdio: "inherit" });
  execFileSync("codesign", ["--verify", "--deep", "--strict", appPath], { stdio: "inherit" });
};
