#!/usr/bin/env node
const { Command, Option } = require("commander");
const { readFileSync, writeFileSync } = require("fs");


const program = new Command("code2html");
program.description("Renders source code files to HTML.")

program
  .addOption(new Option("-b, --backend <backend>", "Rendering backend to use")
    .choices(["prism.js", "highlight.js", "pygments"])
    .default("prism.js"))
  .addOption(new Option("-i, --input <input>", "Input file, \"-\" for STDIN")
    .default("-"))
  .addOption(new Option("-o, --output <output>", "Output file, \"-\" for STDOUT")
    .default("-"))
  .addOption(new Option("-l, --language <language>", "Programming language used"))
  .addOption(new Option("--linenos", "Add line numbers"))
  .parse();

const options = program.opts();
console.log(options);

function readSourceCode(input) {
  if (input == "-") {
    return readFileSync(process.stdin.fd, "utf-8").toString();
  } else {
    return readFileSync(input, "utf-8").toString();
  }
}

function writeRenderedHTML(output, renderedCode) {
  if (output == "-") {
    writeFileSync(process.stdout.fd, renderedCode, "utf-8");
  } else {
    writeFileSync(output, renderedCode, "utf-8");
  }
}

function addLineNumbers(code) {
  const total = code.split("\n").length;
  var linenos = "";
  for (let i = 1; i < total; ++i) {
    linenos += `${i}\n`;
  }
  return `<table><tr><td><pre>${linenos}</pre></td><td><pre><code>${code}</code></pre></td></tr></table>`
}

function renderCodeHighlightJS(sourceCode, language, linenos) {
  var rendered = sourceCode;
  if (language) {
    const hljs = require("highlight.js/lib/core");
    hljs.registerLanguage(language, require(`highlight.js/lib/languages/${language}`));
    rendered = hljs.highlight(sourceCode, { language: language }).value;
  }

  if (linenos) {
    return addLineNumbers(rendered)
  }
  return `<pre><code>${rendered}</pre></code>`
}

function renderCodePrismJS(sourceCode, language, linenos) {
  var rendered = sourceCode;
  if (language) {
    const prism = require("prismjs");
    const loadLanguages = require("prismjs/components/");
    loadLanguages([language]);
    rendered = prism.highlight(sourceCode, prism.languages[language], language);
  }

  if (linenos) {
    return addLineNumbers(rendered)
  }
  return `<pre><code>${rendered}</pre></code>`
}

switch (options.backend) {
  case "highlight.js": {
    const sourceCode = readSourceCode(options.input);
    const renderedCode = renderCodeHighlightJS(sourceCode, options.language, options.linenos);
    writeRenderedHTML(options.output, renderedCode);
    break;
  }
  case "prism.js": {
    const sourceCode = readSourceCode(options.input);
    const renderedCode = renderCodePrismJS(sourceCode, options.language, options.linenos);
    writeRenderedHTML(options.output, renderedCode);
    break;
  }
  default: {
    break;
  }
}
