import { ChildProcess, spawn } from "child_process";
import EventEmitter from "events";
import { Readable } from "stream";

export const execCommand = async (
  command: string,
  workDir: string
): Promise<{ stdout: string; stderr: string; code: number }> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, {
      shell: true,
      cwd: workDir,
    });

    let stdout = "";
    childProcess.stdout.on("data", (data) => {
      stdout = stdout + data.toString();
    });

    let stderr = "";
    childProcess.stderr.on("data", (data) => {
      stderr = stderr + data.toString();
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(stderr.trim()));
      }
    });

    childProcess.on("error", (err) => {
      reject(err);
    });
  });
};

export const mockChildProcess = (): ChildProcess => {
  const proc = new EventEmitter() as ChildProcess;

  proc.stdout = new EventEmitter() as Readable;
  proc.stderr = new EventEmitter() as Readable;

  return proc;
};
