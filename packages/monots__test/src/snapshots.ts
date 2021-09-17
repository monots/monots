import {
  compareSnapshot,
  getSnapshot,
  getSnapshotConfig,
  getSnapshots,
  removeSnapshot,
  saveSnapshot,
} from '@web/test-runner-commands';

await compareSnapshot({ name: 'my-snapshot', content: 'my snapshot content' });

// the config contains a boolean whether updating snapshots is enabled, this can be used by assertion
// library plugins to decide to overwrite the existing snapshot
const config = await getSnapshotConfig();
console.log(config.updateSnapshots);

// returns all the snapshots defined for this test file
const snapshots = await getSnapshots();

// returns the stored snapshot for this file with this name
const snapshot = await getSnapshot({ name: 'my-snapshot' });

// saves snapshot with this name and content
await saveSnapshot({ name: 'my-snapshot', content: 'my snapshot content' });

// removes snapshot with this name
await removeSnapshot({ name: 'my-snapshot' });
