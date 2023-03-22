import chalk from "chalk";

export const log = (subject: string, ...messages: any[]) => {
  console.log(chalk.blue(["🔥", subject].join(" ")), chalk.green(...messages));
};
