import pc from "picocolors";

export const log = (subject: string, ...messages: string[]) => {
  console.log(pc.blue(["🔥", subject].join(" ")), pc.green(messages.join("")));
};
