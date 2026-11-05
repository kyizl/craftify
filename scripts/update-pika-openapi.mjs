import { writeFile } from 'node:fs/promises';
import { get } from 'node:https';
import { fileURLToPath, URL } from 'node:url';

const url = 'https://stats.pika-network.net/openapi.json';
const destination = fileURLToPath(
  new URL('../docs/public/pika-network-openapi.json', import.meta.url),
);

const body = await new Promise((resolve, reject) => {
  const request = get(url, { headers: { accept: 'application/json' } }, (response) => {
    let data = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Could not download the official OpenAPI document: HTTP ${response.statusCode}`,
          ),
        );
        return;
      }
      resolve(data);
    });
  });

  request.setTimeout(20_000, () => {
    request.destroy(new Error('Timed out downloading the official OpenAPI document.'));
  });
  request.on('error', reject);
});

const spec = JSON.parse(body);
if (spec.openapi !== '3.0.3' || !spec.paths || !spec.components?.schemas) {
  throw new Error('The upstream response is not the expected OpenAPI document.');
}

await writeFile(destination, `${JSON.stringify(spec, null, 2)}\n`);
console.log(
  `Updated ${destination} from ${url} (${Object.keys(spec.paths).length} paths).`,
);
