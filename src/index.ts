import jsonSchemaToZod, { type JsonSchema } from "json-schema-to-zod";
import { ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";


function isZodSchema(obj: unknown): obj is ZodType {
  return obj instanceof ZodType;
}

export default function ZodDecoupling(regex: RegExp) {
  return {
    name: "zod-decoupling",
    async transform(src: string, id: string) {
      if (regex.test(id)) {
        console.log("Decoupling " + id);
        try {
          const fileExports = await import(id);
          const output = Object.entries(fileExports).reduce((acc, [name, obj]) => {
            if (!isZodSchema(obj)) return acc;
            const jsonSchema = zodToJsonSchema(obj) as JsonSchema;
            const outputSchema = jsonSchemaToZod(jsonSchema)
            return acc + `export const ${name} = ${outputSchema};\n`;
          }, 'import {z} from "zod";\n');

          return output;
        } catch (error) {
          console.log(error);
          return src;
        }
      }
    },
  };
}
