import jsonSchemaToZod from "json-schema-to-zod";
import zodToJsonSchema from "zod-to-json-schema";


export default function ZodDecoupling(regex: RegExp) {
  return {
    name: "zod-decoupling",
    async transform(src: string, id: string) {
      if (regex.test(id)) {
        console.log("Decoupling " + id);
        try {
          const data = await import(id);
          const jsonSchema = zodToJsonSchema(data.default, "Schema");
          const zschema = jsonSchema?.definitions?.[0] as unknown;
          if (!zschema) throw new Error("Schema not found");
          const outputSchema = jsonSchemaToZod(zschema, {
            module: "esm",
            type: false,
          });
          return outputSchema;
        } catch (error) {
          console.log(error);
          return src;
        }
      }
    },
  };
}
