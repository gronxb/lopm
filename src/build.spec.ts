import { exec } from "child_process";
import { join } from "path";
import { version } from "../package.json";

jest.setTimeout(60000);

test("should print package.json version to stdout", (done) => {
  const command = ["node", join("bin", "index.cjs"), "-v"].join(" ");

  exec(command, (err, stdout, stderr) => {
    expect(stdout.trim()).toBe(version);
    done();
  });
});
