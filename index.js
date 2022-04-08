#!/usr/bin/env node
const { Command, Option } = require("commander");
const { readFileSync, writeFileSync } = require("fs");


const program = new Command("code2html");
program.description("Renders source code files to HTML.")

program
  .addOption(new Option("-b, --backend <backend>", "rendering backend to use")
    .choices(["prism.js", "highlight.js", "pygments"])
    .default("prism.js"))
  .addOption(new Option("-i, --input <input>", "input file, \"-\" for STDIN")
    .default("-"))
  .addOption(new Option("-o, --output <output>", "output file, \"-\" for STDOUT")
    .default("-"))
  .addOption(new Option("-l, --language <language>", "programming language"))
  .addOption(new Option("--linenos", "add line numbers"))
  .addOption(new Option("--linenos-class <class>", "CSS class for line numbering").default("linenos"))
  .addOption(new Option("-c, --class <class>", "CSS class for generated HTML").default("highlight"))
  .addOption(new Option("-w,--wrap", "wrap the output in a <div> element"))
  .addOption(new Option("--wrap-class <class>", "CSS class for the wrapping <div> element (see --wrap)").default("highlight"))
  .parse();

const options = program.opts();

function readSourceCode(input) {
  if (input == "-") {
    return readFileSync(process.stdin.fd, "utf-8").toString();
  } else {
    return readFileSync(input, "utf-8").toString();
  }
}

function writeRenderedHTML(options, renderedCode) {
  if (options.wrap) {
    renderedCode = `<div class="${options.wrapClass}">${renderedCode}</div>`
  }
  if (options.output == "-") {
    writeFileSync(process.stdout.fd, renderedCode, "utf-8");
  } else {
    writeFileSync(options.output, renderedCode, "utf-8");
  }
}

function addLineNumbers(code, options) {
  var wrapped = `<table class="${options.class}">\n`;
  var iterable = code.split("\n");
  iterable.pop();
  for (const [index, line] of iterable.entries()) {
    wrapped += `<tr><td class="${options.linenosClass}"><pre>${index + 1}</pre></td><td><pre class="${options.class}">${line}</pre></td></tr>`;
  }
  wrapped += "</table>";
  return wrapped;
}

function renderCodeHighlightJS(sourceCode, options) {
  var rendered = sourceCode;
  if (options.language) {
    if(options.language == "text") {
      options.language = "plaintext";
    }
    const hljs = require("highlight.js/lib/core");
    hljs.registerLanguage(options.language, require(`highlight.js/lib/languages/${options.language}`));
    rendered = hljs.highlight(sourceCode, { language: options.language }).value;
  }

  if (options.linenos) {
    return addLineNumbers(rendered, options)
  }
  return `<pre class="${options.class}"><code>${rendered}</code></pre>`;
}

function renderCodePrismJS(sourceCode, options) {
  var rendered = sourceCode;
  if (options.language) {
    const prism = require("prismjs");
    const loadLanguages = require("prismjs/components/");
    loadLanguages([options.language]);
    rendered = prism.highlight(sourceCode, prism.languages[options.language], options.language);
  }

  if (options.linenos) {
    return addLineNumbers(rendered, options)
  }
  return `<pre class="${options.class}"><code>${rendered}</code></pre>`;
}

switch (options.backend) {
  case "highlight.js": {
    const sourceCode = readSourceCode(options.input);
    const renderedCode = renderCodeHighlightJS(sourceCode, options);
    writeRenderedHTML(options, renderedCode);
    break;
  }
  case "prism.js": {
    const sourceCode = readSourceCode(options.input);
    const renderedCode = renderCodePrismJS(sourceCode, options);
    writeRenderedHTML(options, renderedCode);
    break;
  }
  default: {
    break;
  }
}
