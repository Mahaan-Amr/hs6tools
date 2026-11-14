import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import nodemailer from "nodemailer";

test("email transport delivers a message through a local SMTP server", async () => {
  let received = "";
  const server = createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 localhost ESMTP\r\n");
    let input = "";
    let data = false;
    socket.on("data", (chunk) => {
      input += chunk;
      let end;
      while ((end = input.indexOf("\r\n")) >= 0) {
        const line = input.slice(0, end);
        input = input.slice(end + 2);
        if (data) {
          if (line === ".") { data = false; socket.write("250 queued\r\n"); }
          else received += line + "\n";
        } else if (/^EHLO /i.test(line)) socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
        else if (/^AUTH PLAIN /i.test(line)) socket.write("235 authenticated\r\n");
        else if (/^(MAIL FROM|RCPT TO)/i.test(line)) socket.write("250 OK\r\n");
        else if (line === "DATA") { data = true; socket.write("354 send message\r\n"); }
        else if (line === "QUIT") socket.end("221 goodbye\r\n");
        else socket.write("250 OK\r\n");
      }
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const transport = nodemailer.createTransport({ host: "127.0.0.1", port: server.address().port, secure: false, auth: { user: "test", pass: "test" }, ignoreTLS: true });
    const info = await transport.sendMail({ from: "sender@example.test", to: "recipient@example.test", subject: "Shipping test", text: "Local test message" });
    assert.deepEqual(info.accepted, ["recipient@example.test"]);
    assert.match(received, /Local test message/);
    transport.close();
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
