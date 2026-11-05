import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface OpenApiParameter {
  name?: string;
  $ref?: string;
}

interface OpenApiOperation {
  parameters?: OpenApiParameter[];
  responses?: Record<string, unknown>;
}

interface OpenApiPathItem {
  parameters?: OpenApiParameter[];
  [method: string]: unknown;
}

interface OpenApiSchema {
  $ref?: string;
  properties?: Record<string, unknown>;
  items?: unknown;
  allOf?: unknown[];
  oneOf?: unknown[];
  anyOf?: unknown[];
  additionalProperties?: unknown;
}

interface OpenApiSpec {
  paths: Record<string, OpenApiPathItem>;
  components: {
    parameters: Record<string, OpenApiParameter>;
    schemas: Record<string, OpenApiSchema>;
  };
  tags: { name: string }[];
}

const root = process.cwd();
const spec = JSON.parse(
  readFileSync(path.resolve(root, 'docs/public/pika-network-openapi.json'), 'utf8'),
) as OpenApiSpec;
const endpoints = readFileSync(
  path.resolve(root, 'docs/pika-network-api/endpoints.md'),
  'utf8',
);
const schemas = readFileSync(
  path.resolve(root, 'docs/pika-network-api/schemas.md'),
  'utf8',
);
const supportedMethods = new Set(['get', 'post', 'put', 'patch', 'delete']);

function collectPropertyPaths(
  input: unknown,
  prefix = '',
  visited = new Set<string>(),
): string[] {
  if (!input || typeof input !== 'object') return [];
  const schema = input as OpenApiSchema;

  if (schema.$ref) {
    const name = schema.$ref.split('/').at(-1) ?? '';
    if (!name || visited.has(name)) return [];
    const target = spec.components.schemas[name];
    return target ? collectPropertyPaths(target, prefix, new Set(visited).add(name)) : [];
  }

  const paths: string[] = [];
  const properties = Object.entries(schema.properties ?? {});
  for (const [name, property] of properties) {
    const propertyPath = prefix ? `${prefix}.${name}` : name;
    paths.push(
      propertyPath,
      ...collectPropertyPaths(property, propertyPath, new Set(visited)),
    );
  }

  if (schema.items) {
    paths.push(...collectPropertyPaths(schema.items, `${prefix}[]`, new Set(visited)));
  }
  const allOf = schema.allOf ?? [];
  for (const part of allOf) {
    paths.push(...collectPropertyPaths(part, prefix, new Set(visited)));
  }
  const variants = schema.oneOf ?? schema.anyOf ?? [];
  for (const [index, part] of variants.entries()) {
    const variantPrefix = `${prefix ? `${prefix} ` : ''}(variant ${index + 1})`;
    paths.push(...collectPropertyPaths(part, variantPrefix, new Set(visited)));
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    paths.push(
      ...collectPropertyPaths(
        schema.additionalProperties,
        prefix ? `${prefix}.*` : '*',
        new Set(visited),
      ),
    );
  }

  return paths;
}

describe('generated PikaNetwork HTTP reference', () => {
  it('documents every OpenAPI operation, parameter and response status', () => {
    let operationCount = 0;
    const pathEntries = Object.entries(spec.paths);

    for (const [path, pathItem] of pathEntries) {
      const operationEntries = Object.entries(pathItem).filter(([method]) =>
        supportedMethods.has(method),
      );

      for (const [method, rawOperation] of operationEntries) {
        const operation = rawOperation as OpenApiOperation;
        operationCount += 1;
        const heading = `#### ${method.toUpperCase()} \`${path}\``;

        expect(endpoints, heading).toContain(heading);
        const start = endpoints.indexOf(heading);
        const next = endpoints.indexOf('\n#### ', start + heading.length);
        const operationSection = endpoints.slice(start, next === -1 ? undefined : next);

        const parameters = [
          ...(pathItem.parameters ?? []),
          ...(operation.parameters ?? []),
        ];
        for (const rawParameter of parameters) {
          const name = rawParameter.$ref
            ? spec.components.parameters[rawParameter.$ref.split('/').at(-1) ?? '']?.name
            : rawParameter.name;
          if (!name) throw new Error(`${heading} has an unresolved parameter reference`);
          expect(operationSection, `${heading} parameter ${name}`).toContain(
            `\`${name}\``,
          );
        }

        const responseStatuses = Object.keys(operation.responses ?? {});
        for (const status of responseStatuses) {
          expect(operationSection, `${heading} response ${status}`).toContain(
            `\`${status}\``,
          );
        }
      }
    }

    expect(operationCount).toBe(28);
    for (const tag of spec.tags) {
      expect(endpoints, `OpenAPI tag ${tag.name}`).toContain(`### ${tag.name}`);
    }
  });

  it('documents every reusable schema and its direct properties', () => {
    const definitions = spec.components.schemas;
    expect(Object.keys(definitions)).toHaveLength(37);

    const schemaEntries = Object.entries(definitions);
    for (const [name, schema] of schemaEntries) {
      expect(schemas, `schema ${name}`).toContain(`## ${name}`);
      const properties = [...new Set(collectPropertyPaths(schema))];
      for (const property of properties) {
        expect(schemas, `${name}.${property}`).toContain(`\`${property}\``);
      }
    }
  });

  it('keeps the hand-maintained endpoint pages aligned with OpenAPI paths', () => {
    const pages = [
      {
        file: 'clans.md',
        paths: ['/clans/{name}', '/clans', '/clans/{name}/members'],
      },
      { file: 'profile.md', paths: ['/profile/{username}'] },
      {
        file: 'profile-stats.md',
        paths: ['/profile/{username}/leaderboard'],
      },
      { file: 'totals.md', paths: ['/leaderboards/total'] },
      { file: 'recaps.md', paths: ['/recaps/{gameId}'] },
    ];

    for (const page of pages) {
      const content = readFileSync(
        path.resolve(root, 'docs/pika-network-api', page.file),
        'utf8',
      );
      for (const route of page.paths) {
        expect(spec.paths, `${page.file} route ${route}`).toHaveProperty(route);
        expect(content, `${page.file} route ${route}`).toContain(`GET ${route}`);
      }
    }

    expect(spec.paths).not.toHaveProperty('/ping');
    expect(
      readFileSync(path.resolve(root, 'docs/pika-network-api/ping.md'), 'utf8'),
    ).toContain('not included in the published OpenAPI');
  });
});
