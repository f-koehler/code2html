#!/usr/bin/env node
const { Command, Option } = require("commander");
const { readFileSync, writeFileSync } = require("fs");


const program = new Command("code2html");
program.description("Renders source code files to HTML.")

program
    .addOption(new Option("-b, --backend <backend>", "Rendering backend to use")
        .choices(["prism.js", "highlight.js", "pygments"])
        .default("highlight.js"))
    .addOption(new Option("-i, --input <input>", "Input file, \"-\" for STDIN")
        .default("-"))
    .addOption(new Option("-o, --output <output>", "Output file, \"-\" for STDOUT")
        .default("-"))
    .addOption(new Option("-l, --language <language>", "Programming language used"));

program.parse(process.argv);


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

function renderCodeHighlightJS(sourceCode, language) {
    const hljs = require("highlight.js/lib/core");
    hljs.registerLanguage(language, require(`highlight.js/lib/languages/${language}`));
    const rendered = hljs.highlight(sourceCode, { language: language }).value;
    return `<pre>\n  <code>\n${rendered}\n  </code>\n</pre>`
}

function renderCodePrismJS(sourceCode, language) {
    if (language) {
        return sourceCode;
    }

    // const prism = require("prismjs");
    // const loadLanguages = require("prismjs/components");
    // loadLanguages([language]);
    // prism.highlight(sourceCode, )
    // TODO: actual rendering
    return sourceCode;
}

const options = program.opts();

switch (options.backend) {
    case "highlight.js": {
        const sourceCode = readSourceCode(options.input);
        const renderedCode = renderCodeHighlightJS(sourceCode, options.language);
        writeRenderedHTML(options.output, renderedCode);
        break;
    }
    case "prism.js": {
        const sourceCode = readSourceCode(options.input);
        const renderedCode = renderCodePrismJS(sourceCode, options.language);
        writeRenderedHTML(options.output, renderedCode);
        break;
    }
    default: {
        break;
    }
}
