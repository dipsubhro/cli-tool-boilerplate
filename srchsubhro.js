#!/usr/bin/env node

require("dotenv").config();
const axios = require("axios");
const chalk = require("chalk");
const readline = require("readline");

const API_KEY = process.env.GEMINI_API_KEY;
const query = process.argv.slice(2).join(" ");

if (!query) {
  console.log(chalk.red("❌ Please provide a query."));
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const headers = { "Content-Type": "application/json" };
const body = {
  contents: [{ parts: [{ text: query }] }],
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  try {
    const response = await axios.post(url, body, { headers });
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.log(chalk.red("❌ No response received."));
      return;
    }

    console.log(
      chalk.gray(
        "\n────────────────────────────────────────────────────────────\n"
      ) +
        chalk.green.bold("subhroGPT\n") +
        chalk.gray(
          "────────────────────────────────────────────────────────────\n"
        )
    );

    const lines = reply.split("\n");
    const indentCodeBlock = (text) => {
      const indented = text
        .split("\n")
        .map((line) => "  " + line)
        .join("\n");
      return chalk.greenBright(indented);
    };

    lines.forEach((line) => {
      if (/^\s*(\*{1,2}.*?\*{1,2})/.test(line)) {
        console.log(chalk.cyan.bold(line.replace(/\*{1,2}/g, "")));
      } else if (/^(\s*[\-\•])/.test(line)) {
        console.log(chalk.white("  " + line));
      } else if (line.startsWith("```") || line.startsWith("    ")) {
        console.log(indentCodeBlock(line));
      } else if (line.trim() === "") {
        console.log("");
      } else {
        console.log(chalk.white(line));
      }
    });

    console.log(
      "\n" +
        chalk.gray(
          "────────────────────────────────────────────────────────────\n"
        )
    );
  } catch (err) {
    console.error(chalk.red("\n⚠️ Error:"), err.response?.data || err.message);
  }
})();
