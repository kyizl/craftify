import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import { format } from 'prettier';

const specPath = new URL('../docs/public/pika-network-openapi.json', import.meta.url);
const endpointPath = new URL('../docs/pika-network-api/endpoints.md', import.meta.url);
const schemaPath = new URL('../docs/pika-network-api/schemas.md', import.meta.url);
const spec = JSON.parse(await readFile(specPath, 'utf8'));

if (!spec.openapi?.startsWith('3.0.') || !spec.paths || !spec.components?.schemas) {
  throw new Error('The checked-in file is not a supported OpenAPI 3.0 specification.');
}

const operations = ['get', 'post', 'put', 'patch', 'delete'];
const pointerValue = (ref) => {
  const parts = ref
    .replace(/^#\//, '')
    .split('/')
    .map((part) => part.replaceAll('~1', '/').replaceAll('~0', '~'));
  return parts.reduce((value, part) => value?.[part], spec);
};
const schemaName = (ref) => ref?.match(/^#\/components\/schemas\/(.+)$/)?.[1];
const anchor = (value) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-|-$/g, '');
const refLink = (ref) => {
  const name = schemaName(ref);
  return name ? `[\`${name}\`](./schemas#${anchor(name)})` : `\`${ref}\``;
};

function resolveParameter(parameter) {
  return parameter.$ref ? pointerValue(parameter.$ref) : parameter;
}

function resolveSchema(schema) {
  return schema?.$ref ? pointerValue(schema.$ref) : schema;
}

function typeOf(input, depth = 0) {
  if (!input || depth > 8) return 'any';
  const schema = input;
  let result;
  if (schema.$ref) result = refLink(schema.$ref);
  else if (schema.allOf)
    result = schema.allOf.map((part) => typeOf(part, depth + 1)).join(' & ');
  else if (schema.oneOf || schema.anyOf) {
    const variants = schema.oneOf ?? schema.anyOf;
    result = variants.map((part) => typeOf(part, depth + 1)).join(' or ');
  } else if (schema.const !== undefined) result = `\`${JSON.stringify(schema.const)}\``;
  else if (schema.enum)
    result = schema.enum.map((value) => `\`${JSON.stringify(value)}\``).join(' | ');
  else if (schema.type === 'array') result = `${typeOf(schema.items, depth + 1)}[]`;
  else if (schema.type === 'object' && schema.additionalProperties) {
    result = `Record<string, ${typeOf(schema.additionalProperties === true ? {} : schema.additionalProperties, depth + 1)}>`;
  } else if (schema.type === 'object') result = 'object';
  else result = schema.type ?? 'any';

  return schema.nullable && !schema.enum?.includes(null) ? `${result} or null` : result;
}

function inline(value = '') {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('\r', ' ');
}

function schemaConstraints(schema = {}, includeExample = true) {
  const constraints = [
    schema.format ? `format: \`${schema.format}\`` : '',
    schema.minimum !== undefined ? `minimum: \`${schema.minimum}\`` : '',
    schema.maximum !== undefined ? `maximum: \`${schema.maximum}\`` : '',
    schema.exclusiveMinimum !== undefined
      ? `exclusive minimum: \`${schema.exclusiveMinimum}\``
      : '',
    schema.exclusiveMaximum !== undefined
      ? `exclusive maximum: \`${schema.exclusiveMaximum}\``
      : '',
    schema.minLength !== undefined ? `min length: \`${schema.minLength}\`` : '',
    schema.maxLength !== undefined ? `max length: \`${schema.maxLength}\`` : '',
    schema.pattern ? `pattern: \`${schema.pattern}\`` : '',
    schema.minItems !== undefined ? `min items: \`${schema.minItems}\`` : '',
    schema.maxItems !== undefined ? `max items: \`${schema.maxItems}\`` : '',
    schema.uniqueItems ? 'unique items' : '',
    schema.multipleOf !== undefined ? `multiple of: \`${schema.multipleOf}\`` : '',
    schema.minProperties !== undefined
      ? `minimum properties: \`${schema.minProperties}\``
      : '',
    schema.maxProperties !== undefined
      ? `maximum properties: \`${schema.maxProperties}\``
      : '',
    schema.minContains !== undefined ? `minimum contains: \`${schema.minContains}\`` : '',
    schema.maxContains !== undefined ? `maximum contains: \`${schema.maxContains}\`` : '',
    schema.propertyNames ? `property names: ${typeOf(schema.propertyNames)}` : '',
    schema.contentEncoding ? `content encoding: \`${schema.contentEncoding}\`` : '',
    schema.contentMediaType ? `content media type: \`${schema.contentMediaType}\`` : '',
    schema.contains ? `contains: ${typeOf(schema.contains)}` : '',
    schema.patternProperties
      ? `pattern properties: ${Object.entries(schema.patternProperties)
          .map(([pattern, value]) => `\`${pattern}\`: ${typeOf(value)}`)
          .join(', ')}`
      : '',
    schema.additionalProperties === false ? 'additional properties: forbidden' : '',
    schema.not ? `not: ${typeOf(schema.not)}` : '',
    schema.default !== undefined ? `default: \`${JSON.stringify(schema.default)}\`` : '',
    includeExample && schema.example !== undefined
      ? `example: \`${JSON.stringify(schema.example)}\``
      : '',
    schema.deprecated ? '**deprecated**' : '',
    schema.readOnly ? '**read-only**' : '',
    schema.writeOnly ? '**write-only**' : '',
    schema.discriminator?.propertyName
      ? `discriminator: \`${schema.discriminator.propertyName}\``
      : '',
    schema.externalDocs?.url ? `external docs: ${schema.externalDocs.url}` : '',
  ].filter(Boolean);
  return constraints.join('; ');
}

function collectProperties(input, prefix = '', visited = new Set()) {
  if (!input || visited.size > 12) return [];
  if (input.$ref) {
    const name = schemaName(input.$ref);
    if (!name || visited.has(name)) return [];
    const nextVisited = new Set(visited).add(name);
    return collectProperties(pointerValue(input.$ref), prefix, nextVisited);
  }

  const rows = [];
  for (const part of input.allOf ?? []) {
    rows.push(...collectProperties(part, prefix, new Set(visited)));
  }
  const variants = input.oneOf ?? input.anyOf ?? [];
  for (const [index, part] of variants.entries()) {
    const variantName = prefix
      ? `${prefix} (variant ${index + 1})`
      : `(variant ${index + 1})`;
    rows.push(...collectProperties(part, variantName, new Set(visited)));
  }

  const requiredFields = new Set(input.required ?? []);
  for (const [name, property] of Object.entries(input.properties ?? {})) {
    const path = prefix ? `${prefix}.${name}` : name;
    const isRequired = requiredFields.has(name);
    rows.push({ path, schema: property, required: isRequired });
    rows.push(...collectProperties(property, path, new Set(visited)));
  }

  if (input.type === 'array' && input.items) {
    rows.push(...collectProperties(input.items, `${prefix}[]`, new Set(visited)));
  }

  if (input.additionalProperties && input.additionalProperties !== true) {
    const path = prefix ? `${prefix}.*` : '*';
    rows.push({ path, schema: input.additionalProperties, required: false });
    rows.push(...collectProperties(input.additionalProperties, path, new Set(visited)));
  }

  return rows;
}

function parameterList(pathItem, operation) {
  const byKey = new Map();
  for (const raw of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]) {
    const parameter = resolveParameter(raw);
    byKey.set(`${parameter.in}:${parameter.name}`, parameter);
  }
  return [...byKey.values()];
}

function parameterExample(parameter) {
  const schema = resolveSchema(parameter.schema) ?? {};
  if (parameter.example !== undefined) return parameter.example;
  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.type === 'array')
    return [parameterExample({ ...parameter, schema: schema.items })];
  if (schema.format === 'uuid') return 'YOUR_UUID';
  if (parameter.name === 'username') return 'JustThiemo';
  if (schema.type === 'integer' || schema.type === 'number') return schema.minimum ?? 1;
  if (schema.type === 'boolean') return false;
  return `YOUR_${parameter.name.replace(/[^a-z0-9]+/gi, '_').toUpperCase()}`;
}

function examplePath(path, parameters) {
  return path.replaceAll(/\{([^}]+)\}/g, (_, name) => {
    const parameter = parameters.find((item) => item.in === 'path' && item.name === name);
    if (name === 'id' && path.startsWith('/events/')) return 'YOUR_EVENT_UUID';
    if (name === 'id' && path.startsWith('/fights/'))
      return 'YOUR_EPOCH_MS.YOUR_FIGHT_UUID';
    if (name === 'entityId') return 'YOUR_TEAM_ID';
    if (name === 'gameId') return 'YOUR_GAME_ID';
    return encodeURIComponent(
      String(parameter ? parameterExample(parameter) : `YOUR_${name.toUpperCase()}`),
    );
  });
}

function exampleQuery(parameters) {
  const values = [];
  for (const parameter of parameters) {
    if (parameter.in !== 'query') continue;
    const schema = resolveSchema(parameter.schema) ?? {};
    if (
      !parameter.required &&
      parameter.example === undefined &&
      schema.example === undefined &&
      schema.default === undefined
    )
      continue;
    const value = parameterExample(parameter);
    if (Array.isArray(value)) {
      values.push(
        `${encodeURIComponent(parameter.name)}=${encodeURIComponent(value.join(','))}`,
      );
    } else {
      values.push(
        `${encodeURIComponent(parameter.name)}=${encodeURIComponent(String(value))}`,
      );
    }
  }
  return values.length ? `?${values.join('&')}` : '';
}

function responseRows(operation) {
  return Object.entries(operation.responses ?? {}).map(([status, rawResponse]) => {
    const response = rawResponse.$ref ? pointerValue(rawResponse.$ref) : rawResponse;
    const media = Object.entries(response.content ?? {});
    const shapes =
      media
        .map(([contentType, content]) => {
          const details = [
            content.schema?.description,
            schemaConstraints(content.schema),
          ].filter(Boolean);
          return `${contentType}: ${inline(typeOf(content.schema))}${details.length ? `: ${inline(details.join('; '))}` : ''}`;
        })
        .join('<br>') || 'No response body documented';
    const headers = Object.entries(response.headers ?? {}).map(([name, header]) => {
      const resolved = header.$ref ? pointerValue(header.$ref) : header;
      const details = [
        resolved.required ? 'required' : '',
        resolved.description,
        schemaConstraints(resolved.schema),
      ].filter(Boolean);
      return `\`${name}\`: ${inline(typeOf(resolved.schema))}${details.length ? ` (${inline(details.join('; '))})` : ''}`;
    });
    return `|\`${status}\`|${inline(response.description || 'No description supplied by upstream.')}|${inline(shapes)}${headers.length ? `<br>Headers: ${inline(headers.join(', '))}` : ''}|`;
  });
}

const paths = Object.entries(spec.paths);
const groups = new Map(
  (spec.tags ?? []).map((tag) => [tag.name, { ...tag, operations: [] }]),
);
for (const [path, pathItem] of paths) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!operations.includes(method)) continue;
    const tag = operation.tags?.[0] ?? 'Other';
    if (!groups.has(tag)) groups.set(tag, { name: tag, description: '', operations: [] });
    groups
      .get(tag)
      .operations.push({ path, pathItem, method: method.toUpperCase(), operation });
  }
}

const totalOperations = [...groups.values()].reduce(
  (count, group) => count + group.operations.length,
  0,
);
const baseUrl = spec.servers?.[0]?.url ?? 'https://stats.pika-network.net/api';
const securitySchemes = spec.components.securitySchemes ?? {};
const endpointLines = [
  '---',
  'title: Endpoint Reference',
  'order: 2',
  '---',
  '',
  '# Complete endpoint reference',
  '',
  `Generated from OpenAPI **${spec.openapi}** (API version **${spec.info.version}**): **${totalOperations} operations** across ${groups.size} categories. This reference expands the upstream paths, parameters, response codes, headers and schema references. The [machine-readable snapshot](/pika-network-openapi.json) remains the source of truth.`,
  '',
  `**Base URL:** \`${baseUrl}\``,
  '',
  '## Authentication',
  '',
];

for (const [name, scheme] of Object.entries(securitySchemes)) {
  if (scheme.type === 'apiKey') {
    endpointLines.push(
      `The upstream specification defines **${name}** as an API key in the \`${scheme.in}\` header \`${scheme.name}\`. Obtain a free key in-game with \`/apikey\` after linking Discord with \`/linkaccount\`. A missing or invalid key receives \`401\`. Use \`/apikey reset\` if the key is exposed; the old key stops working.`,
    );
  } else if (scheme.type === 'http') {
    endpointLines.push(
      `The upstream specification defines HTTP ${scheme.scheme} authentication${scheme.bearerFormat ? ` (${scheme.bearerFormat})` : ''}.`,
    );
  } else {
    endpointLines.push(
      `The upstream specification defines the \`${name}\` security scheme (${scheme.type}).`,
    );
  }
}

const globalSecurity = spec.security ?? [];
if (globalSecurity.length) {
  endpointLines.push(
    '',
    `**Global security requirement:** ${globalSecurity
      .map((requirement) =>
        Object.keys(requirement)
          .map((name) => `\`${name}\``)
          .join(' + '),
      )
      .join(
        ' or ',
      )}. An operation can override this requirement with its own security declaration.`,
  );
}

endpointLines.push(
  '',
  '## Shared parameter definitions',
  '',
  '|Parameter|Location|Required|Type|Constraints and description|',
  '|---|---|---|---|---|',
);
for (const [name, rawParameter] of Object.entries(spec.components.parameters ?? {})) {
  const parameter = resolveParameter(rawParameter);
  const details = [
    schemaConstraints(parameter.schema),
    parameter.example !== undefined
      ? `example: \`${JSON.stringify(parameter.example)}\``
      : '',
    parameter.description ?? '',
  ]
    .filter(Boolean)
    .join('; ');
  endpointLines.push(
    `|\`${inline(parameter.name)}\` (${inline(name)})|${inline(parameter.in)}|${parameter.required ? 'Yes' : 'No'}|${inline(typeOf(parameter.schema))}|${inline(details)}|`,
  );
}

endpointLines.push(
  '',
  '## Site-level authentication and rate-limit behavior',
  '',
  'The official website and the OpenAPI `info.description` document the following behavior globally. These details are **not declared as per-operation response objects or response headers in the OpenAPI `paths` section**, so they are intentionally kept separate from the operation response tables above.',
  '',
  '| Behavior | Official website documentation |',
  '|---|---|',
  '| Authentication | Every request needs a free `X-Api-Key` key. Missing, invalid, reset or staff-revoked keys receive `401 Unauthorized`. |',
  '| Rate limit | 120 requests per minute per API key. |',
  '| Rate-limit headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (reset is expressed in seconds). |',
  '| Throttling response | `429 Too Many Requests` includes `Retry-After`; wait for that duration and cache responses where practical. |',
  '',
  'Source: [official PikaNetwork API documentation](https://stats.pika-network.net/docs).',
);

endpointLines.push('', '## Operations', '');
for (const [tagName, group] of groups) {
  if (!group.operations.length) {
    endpointLines.push(
      `### ${tagName}`,
      '',
      `${group.description ?? ''} The OpenAPI document defines this category but currently has no operations tagged here.`,
      '',
    );
    continue;
  }
  endpointLines.push(`### ${tagName}`, '', group.description ?? '', '');
  for (const { path, pathItem, method, operation } of group.operations) {
    const parameters = parameterList(pathItem, operation);
    const operationLabel = `${method} \`${path}\``;
    endpointLines.push(`#### ${operationLabel}`, '', operation.summary ?? '');
    if (operation.operationId)
      endpointLines.push('', `Operation ID: \`${operation.operationId}\`.`);
    if (operation.description) endpointLines.push('', operation.description);

    endpointLines.push(
      '',
      `##### Parameters: ${operationLabel}`,
      '',
      '|Name|In|Type|Required|Constraints and description|',
      '|---|---|---|---|---|',
    );
    if (!parameters.length) endpointLines.push('|None|None|None|None|No parameters|');
    for (const parameter of parameters) {
      const schema = parameter.schema ?? {};
      const details = [
        schemaConstraints(schema),
        parameter.example !== undefined
          ? `example: \`${JSON.stringify(parameter.example)}\``
          : '',
        parameter.description ?? '',
      ]
        .filter(Boolean)
        .join('; ');
      endpointLines.push(
        `|\`${inline(parameter.name)}\`|${inline(parameter.in)}|${inline(typeOf(schema))}|${parameter.required ? 'Yes' : 'No'}|${inline(details)}|`,
      );
    }

    endpointLines.push(
      '',
      `##### Responses: ${operationLabel}`,
      '',
      '|Status|Meaning|Body and response headers|',
      '|---|---|---|',
      ...responseRows(operation),
    );

    if (operation.requestBody) {
      const requestBody = operation.requestBody.$ref
        ? pointerValue(operation.requestBody.$ref)
        : operation.requestBody;
      endpointLines.push(
        '',
        `##### Request body: ${operationLabel}`,
        '',
        `${requestBody.required ? '**Required.** ' : '**Optional.** '}${requestBody.description ?? ''}`,
        '',
      );
      for (const [contentType, content] of Object.entries(requestBody.content ?? {})) {
        const examples =
          content.example !== undefined
            ? [`example: \`${JSON.stringify(content.example)}\``]
            : Object.entries(content.examples ?? {}).map(([exampleName, example]) => {
                const resolved = example.$ref ? pointerValue(example.$ref) : example;
                return `${exampleName}: \`${JSON.stringify(resolved.value ?? resolved)}\``;
              });
        endpointLines.push(
          `- \`${contentType}\`: ${typeOf(content.schema)}${schemaConstraints(content.schema) ? `; ${schemaConstraints(content.schema)}` : ''}${examples.length ? `; ${examples.join('; ')}` : ''}`,
        );
      }
    }

    const url = `${baseUrl}${examplePath(path, parameters)}${exampleQuery(parameters)}`;
    const security = operation.security ?? globalSecurity;
    const apiKey = security
      .flatMap((requirement) => Object.keys(requirement))
      .map((name) => securitySchemes[name])
      .find((scheme) => scheme?.type === 'apiKey');
    const authHeader =
      apiKey?.in === 'header' ? ` -H "${apiKey.name}: $PIKA_API_KEY"` : '';
    endpointLines.push(
      '',
      `##### Example request: ${operationLabel}`,
      '',
      'Replace uppercase ID placeholders with values returned by the API.',
      '',
      '```bash',
      `curl '${url}'${authHeader}`,
      '```',
      '',
    );
  }
}

endpointLines.push(
  '## Schema definitions',
  '',
  `All ${Object.keys(spec.components.schemas).length} reusable schemas are expanded in the [schema reference](./schemas). Download the [official OpenAPI snapshot](/pika-network-openapi.json) for the complete machine-readable contract.`,
);

const schemaLines = [
  '---',
  'title: Schema Reference',
  'order: 3',
  '---',
  '',
  '# Response schema reference',
  '',
  `Generated from all **${Object.keys(spec.components.schemas).length} reusable schemas** in the official OpenAPI document. The property tables include inherited and nested properties, requiredness, nullability, constraints, examples and links to referenced schemas.`,
  '',
];

for (const [name, schema] of Object.entries(spec.components.schemas)) {
  schemaLines.push(`## ${name}`, '');
  if (schema.description) schemaLines.push(schema.description, '');
  const topLevelDetails = schemaConstraints(schema, false);
  if (topLevelDetails) schemaLines.push(`**Constraints:** ${topLevelDetails}`, '');
  if (schema.enum)
    schemaLines.push(
      `**Allowed values:** ${schema.enum.map((value) => `\`${JSON.stringify(value)}\``).join(', ')}`,
      '',
    );
  const properties = collectProperties(schema);
  if (properties.length) {
    schemaLines.push(
      '|Field path|Type|Required|Nullable|Constraints and description|',
      '|---|---|---|---|---|',
    );
    for (const { path, schema: property, required } of properties) {
      const details = [schemaConstraints(property), property.description ?? '']
        .filter(Boolean)
        .join('; ');
      schemaLines.push(
        `|\`${inline(path)}\`|${inline(typeOf(property))}|${required ? 'Yes' : 'No'}|${property.nullable ? 'Yes' : 'No'}|${inline(details)}|`,
      );
    }
    schemaLines.push('');
  } else if (schema.type) {
    schemaLines.push(`**Type:** ${typeOf(schema)}`, '');
  }
  if (schema.example !== undefined) {
    schemaLines.push(
      'Example:',
      '',
      '```json',
      JSON.stringify(schema.example, null, 2),
      '```',
      '',
    );
  }
  if (schema.additionalProperties === true)
    schemaLines.push('**Additional properties:** arbitrary JSON values are allowed.', '');
  if (schema.deprecated)
    schemaLines.push(
      '**Deprecated:** this schema is marked deprecated by the upstream specification.',
      '',
    );
}

schemaLines.push(
  '---',
  '',
  'Generated from the [official OpenAPI JSON](/pika-network-openapi.json).',
);

const [formattedEndpoints, formattedSchemas] = await Promise.all([
  format(`${endpointLines.join('\n')}\n`, { filepath: fileURLToPath(endpointPath) }),
  format(`${schemaLines.join('\n')}\n`, { filepath: fileURLToPath(schemaPath) }),
]);

await Promise.all([
  writeFile(endpointPath, formattedEndpoints),
  writeFile(schemaPath, formattedSchemas),
]);

console.log(
  `Generated ${totalOperations} operations and ${Object.keys(spec.components.schemas).length} schemas from ${paths.length} paths.`,
);
