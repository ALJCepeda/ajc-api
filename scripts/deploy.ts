import {spawn, SpawnOptionsWithoutStdio} from "child_process";

export async function passthru(command: string, args?: string[], spawnOptions?: SpawnOptionsWithoutStdio) {
  console.debug('spawning: ', command, args);
  const child = spawn(command, args, spawnOptions);

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
  process.stdin.pipe(child.stdin);

  return new Promise((resolve, reject) => {
    child.on('exit', (code) => resolve(code));
    child.on('error', (err) => reject(err))
  });
}

const [command, script, project, name] = process.argv;

const path = `dist/cloud-functions/${name}.js`;

async function run() {
  console.log('Building source files');
  await passthru('yarn', ['build']);

  console.log(`Deploying cloud function: ${name}`);
  await passthru('gcloud', [project, 'functions',
    'deploy', name,
    '--entry-point', name,
    '--source', path,
    '--runtime', 'node14',
    '--trigger-http'
  ]);
}

run()
  .then(() => console.log('done'))
  .catch(console.error);