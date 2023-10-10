import fs from "fs";

// Step 1: Possible Zod types
const possibleZodTypes = ["z.string()", "z.number()", "z.boolean()"];
const possibleChainMethods = ["", ".optional()", ".nullable()", ".nullish()"];

// Step 2: Generate a random string for keys and variable names
function generateRandomString(length) {
  const charset = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  return result;
}

// Step 3: Generate a random Zod schema
function generateRandomZodSchema() {
  const numberOfKeys = Math.floor(Math.random() * 30) + 1; // 1-30 keys

  let schema = `z.object({`;
  const keys = [];
  for (let i = 0; i < numberOfKeys; i++) {
    const key = generateRandomString(8); // Key name of 8 chars
    keys.push(key);
    const randomTypeIndex = Math.floor(Math.random() * possibleZodTypes.length);
    const randomChainMethodIndex = Math.floor(
      Math.random() * possibleChainMethods.length
    );
    const randomType = possibleZodTypes[randomTypeIndex];
    const randomChance = Math.random();
    if (randomChance > 0.98) {
      const { schema: nestedSchema } = generateRandomZodSchema();
      schema += ` ${key}: ${nestedSchema},`;
      continue;
    }
    const type = randomType + possibleChainMethods[randomChainMethodIndex];

    schema += ` ${key}: ${type},`;
  }

  schema += " })";
  return {
    schema,
    keys,
  };
}

// Step 4: Write the generated schemas to a file
function writeToFile(
  filepath = "randomZodSchemas.ts",
  numberOfSchemas = 100,
  numberOfOmits = 10,
  numberOfExtends = 10
) {
  let allSchemas = 'import * as z from "zod";\n\n';
  for (let i = 0; i < numberOfSchemas; i++) {
    const variableName = generateRandomString(7);
    const { schema, keys } = generateRandomZodSchema();
    allSchemas += `export const ${variableName} = ` + schema + ";\n";

    for (let i = 0; i < numberOfOmits; i++) {
      const omitSchemaVariableName = generateRandomString(7);
      const omitKeys = keys
        .slice(0, keys.length - 1)
        .filter(() => Math.random() > 0.5);
      allSchemas += `export const ${omitSchemaVariableName} = ${variableName}.omit({
      ${omitKeys.map((key) => `"${key}": true`).join(",\n")}
    });\n\n`;
    }
    for (let i = 0; i < numberOfExtends; i++) {
      const extendSchemaVariableName = generateRandomString(7);
      const extendKeys = Array(3)
        .fill(0)
        .map(() => generateRandomString(7));
      allSchemas += `export const ${extendSchemaVariableName} = ${variableName}.extend({
      ${extendKeys.map((key) => `"${key}": z.string()`).join(",\n")}
    });\n\n`;
    }
  }

  fs.writeFile(filepath, allSchemas, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    }
  });
}

writeToFile("src/index.ts");