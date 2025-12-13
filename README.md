# vite-plugin-zod-decoupling

`vite-plugin-zod-decoupling` is a Vite plugin designed to transform Zod schemas into JSON schemas and back into Zod schemas.

Why ? It was mainly made to prevent leaking database schemas and dependencies when reusing schema generated from [drizzle-zod](https://orm.drizzle.team/docs/zod) in the front end.

> **Warning:** This plugin is a highly experimental proof of concept. Do not use in profuction, in fact do not use at all.

## Installation

To install the plugin, use your favorite package manager:

```bash
npm install vite-plugin-zod-decoupling
# or
yarn add vite-plugin-zod-decoupling
# or
bun add vite-plugin-zod-decoupling
```

## Usage

To use the plugin, import it and include it in your Vite configuration.
You have to specify a regular expression to match the files you want to transform.

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import ZodDecoupling from "vite-plugin-zod-decoupling";

export default defineConfig({
  plugins: [
    ZodDecoupling(/\.schema\.ts$/), // Apply the plugin to files ending with .schema.ts
  ],
});
```

## Example

Suppose you have a drizzle entity in `user.ts` :

```typescript
import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

const users = pgTable("users", {
  id: integer().generatedAlwaysAsIdentity().primaryKey(),
  name: text().notNull(),
  age: integer().notNull(),
});

export const userSelectSchema = createSelectSchema(users);
```

Importing `userSelectSchema` in the front end would bring many unwanted
dependencies and of course the table schema.

Instead of directly importing `userSelectSchema` in your front end code,
you can add a user.schema.ts file in your codebase :

```typescript
export { userSelectSchema } from "user";
```

This plugin will then dynamically transform the user.schema.ts file, which will be transpiled to :

```javascript
import { z } from "/node_modules/.vite/deps/zod.js";
export const userSelectSchema = z
  .object({
    id: z.number().int().gte(-2147483648).lte(2147483647),
    name: z.string(),
    age: z.number().int().gte(-2147483648).lte(2147483647),
  })
  .strict();
```

> **Warning:** `.schema.ts` files must only export Zod schemas. Ensure that these files do not contain any other exports as the transformed files will not contains those exports. Also, some data might get lost during the decoupling, more info on the [zod-to-json-schema](https://www.npmjs.com/package/zod-to-json-schema) and [json-schema-to-zod](https://www.npmjs.com/package/json-schema-to-zod) pages.

## License

This project is licensed under the MIT License.
