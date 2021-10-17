const { Command, Option } = require("commander");


const program = new Command("code2html");
program.description("Renders source code files to HTML.")

program
    .addOption(new Option("-b, --backend", "Rendering backend to use")
        .choices(["prism.js", "highlight.js", "pygments"])
        .default("highlight.js"))
    .addOption(new Option("-i, --input", "Input file, \"-\" for STDIN")
        .default("-"))
    .addOption(new Option("-o, --output", "Output file, \"-\" for STDOUT")
        .default("-"))
    .addOption(new Option("-l, --language", "Programming language used"));

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
    return hljs.highlight(sourceCode, { language: language }).value;
}

function renderCodePrismJS() { }

const options = program.opts();
console.log(options);
