
import { parse } from "acorn";
import * as walk from "acorn-walk";
import MagicString from "magic-string";

const MAX_CODE_LENGTH = 10000;
const MAX_VARIABLES = 50;

export function instrumentJavaScript(source) {
  if (typeof source !== "string" || !source.trim()) {
    throw new Error("Code cannot be empty.");
  }

  if (source.length > MAX_CODE_LENGTH) {
    throw new Error(
      "Code cannot exceed 10,000 characters."
    );
  }

  let ast;

  try {
    ast = parse(source, {
      ecmaVersion: "latest",
      sourceType: "script",
      locations: true,
    });
  } catch (error) {
    throw new Error(
      `SyntaxError: ${error.message}`
    );
  }

  const output = new MagicString(source);
  const identifiers = new Set();
  const variableNames = new Set();

  function collectPattern(pattern) {
    if (!pattern) return;

    switch (pattern.type) {
      case "Identifier":
        variableNames.add(pattern.name);
        break;

      case "ArrayPattern":
        pattern.elements.forEach(collectPattern);
        break;

      case "ObjectPattern":
        pattern.properties.forEach((property) => {
          if (property.type === "RestElement") {
            collectPattern(property.argument);
          } else {
            collectPattern(property.value);
          }
        });
        break;

      case "AssignmentPattern":
        collectPattern(pattern.left);
        break;

      case "RestElement":
        collectPattern(pattern.argument);
        break;

      default:
        break;
    }
  }

  walk.full(ast, (node) => {
    if (node.type === "Identifier") {
      identifiers.add(node.name);
    }

    if (node.type === "VariableDeclarator") {
      collectPattern(node.id);
    }

    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression"
    ) {
      node.params.forEach(collectPattern);
    }

    if (node.type === "CatchClause") {
      collectPattern(node.param);
    }
  });

  let traceName = "__cv_trace";

  while (identifiers.has(traceName)) {
    traceName += "_";
  }

  const trackedVariables = Array.from(
    variableNames
  ).slice(0, MAX_VARIABLES);

  function createSnapshot() {
    return `[${trackedVariables
      .map(
        (name) =>
          `[${JSON.stringify(name)}, () => ${name}]`
      )
      .join(",")}]`;
  }

  function createTrace(line, event = "line") {
    return (
      `${traceName}(` +
      `${line},` +
      `${JSON.stringify(event)},` +
      `${createSnapshot()}` +
      `);`
    );
  }

  function instrumentStatements(statements) {
    let inDirectivePrologue = true;

    for (const statement of statements) {
      if (
        inDirectivePrologue &&
        statement.type === "ExpressionStatement" &&
        typeof statement.directive === "string"
      ) {
        continue;
      }

      inDirectivePrologue = false;

      if (statement.type === "EmptyStatement") {
        continue;
      }

      const line = statement.loc.start.line;

      output.prependLeft(
        statement.start,
        `\n${createTrace(line)}\n`
      );
    }
  }

  walk.simple(ast, {
    Program(node) {
      instrumentStatements(node.body);
    },

    BlockStatement(node) {
      instrumentStatements(node.body);
    },

    SwitchCase(node) {
      instrumentStatements(node.consequent);
    },
  });

  function instrumentLoop(node) {
    const body = node.body;
    const line = node.loc.start.line;
    const trace = createTrace(line);

    if (body.type === "BlockStatement") {
      output.appendLeft(
        body.start + 1,
        `\n${trace}\n`
      );
    } else {
      output.prependLeft(
        body.start,
        `{\n${trace}\n`
      );

      output.appendLeft(
        body.end,
        "\n}"
      );
    }
  }

  walk.simple(ast, {
    ForStatement: instrumentLoop,
    ForInStatement: instrumentLoop,
    ForOfStatement: instrumentLoop,
    WhileStatement: instrumentLoop,
    DoWhileStatement: instrumentLoop,
  });

  const finalLine = Math.max(
    1,
    source.split(/\r\n|\r|\n/).length
  );

  output.append(
    `\n${createTrace(finalLine, "completed")}\n`
  );

  return {
    language: "javascript",
    source,
    instrumentedCode: output.toString(),
    traceName,
    trackedVariables,
    lineCount: finalLine,
  };
}
