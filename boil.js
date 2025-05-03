#!/usr/bin/env node

require("dotenv").config();
const axios = require("axios");
const chalk = require("chalk");
const readline = require("readline");
const { version } = require("./package.json");

const API_KEY = process.env.GEMINI_API_KEY;
const query = process.argv.slice(2).join(" ");

if (!query) {
  console.log(chalk.red("❌ Please provide a query."));
  process.exit(1);
}

if (query.includes("--help")) {
  console.log(`
    Usage: mycli [options]
    
    Options:
      --help             Show help information
      --version          Show version
      --get-api-key      Open Gemini API key page in browser
    
    Setup your Gemini API key:
    
    Run:
      mycli --get-api-key
    
    Then set the API key:
    
    Linux / macOS:
      export GEMINI_API_KEY=your_api_key_here
    
    Windows (CMD):
      set GEMINI_API_KEY=your_api_key_here
    
    Windows (PowerShell):
      $env:GEMINI_API_KEY="your_api_key_here"

    `);
  process.exit(0);
}

if (query.includes("-h")) {
  console.log(`
    Usage: mycli [options]
    
    Options:
      --help             Show help information
      --version          Show version
      --get-api-key      Open Gemini API key page in browser
    
    Setup your Gemini API key:
    
    Run:
      mycli --get-api-key
    
    Then set the API key:
    
    Linux / macOS:
      export GEMINI_API_KEY=your_api_key_here
    
    Windows (CMD):
      set GEMINI_API_KEY=your_api_key_here
    
    Windows (PowerShell):
      $env:GEMINI_API_KEY="your_api_key_here"
    `);
  process.exit(0);
}

if (query.includes("--version")) {
  console.log(version);
  process.exit(0);
}

if (query.includes("-v")) {
  console.log(version);
  process.exit(0);
}

if (query.includes("--get-api-key")) {
  const url = "https://aistudio.google.com/app/apikey";
  console.log(`🌐 Visit this link to open the Gemini API Key page: ${url}`);
  process.exit(0);
}

const codeKeywords = [
  "code",
  "program",
  "script",
  "function",
  "class",
  "algorithm",
  "boilerplate",
  "script",
  "bash",
  "sh",
  "command",
  "cmd",
];
const isCodeRequest = codeKeywords.some((keyword) =>
  query.toLowerCase().includes(keyword)
);

if (!isCodeRequest) {
  console.log(
    chalk.red("❌ I can only generate boilerplate codes or code snippets")
  );
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const headers = { "Content-Type": "application/json" };
const body = {
  contents: [
    {
      parts: [
        {
          text: `don't generate additional text or any explanation and no text formatting and no in-between comments, only reply the code of this query a-${query}`,
        },
      ],
    },
  ],
  generationConfig: {
    responseMimeType: "text/plain",
  },
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const typewriterEffect = async (text, delay = 15) => {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  process.stdout.write("\n");
};

(async () => {
  try {
    const response = await axios.post(url, body, { headers });
    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      await typewriterEffect("❌ No response received.");
      return;
    }

    await typewriterEffect(
      "\n────────────────────────────────────────────────────────────"
    );
    await typewriterEffect(query);
    await typewriterEffect(
      "────────────────────────────────────────────────────────────"
    );

    const lines = reply.split("\n");

    const indentCodeBlock = (text) => {
      return text
        .split("\n")
        .map((line) => "  " + line)
        .join("\n");
    };

    for (const line of lines) {
      if (line.trim() === "") {
        console.log("");
      } else if (/^\s*(\*{1,2}.*?\*{1,2})/.test(line)) {
        await typewriterEffect(line.replace(/\*{1,2}/g, ""));
      } else if (/^(\s*[\-\•])/.test(line)) {
        await typewriterEffect("  " + line);
      } else if (line.startsWith("```") || line.startsWith("    ")) {
        await typewriterEffect(indentCodeBlock(line));
      } else {
        await typewriterEffect(line);
      }
    }

    await typewriterEffect(
      "────────────────────────────────────────────────────────────"
    );
    process.exit(0);
  } catch (err) {
    console.error(chalk.red("\n⚠️ Error:"), err.response?.data || err.message);
    process.exit(1);
  }
})();
