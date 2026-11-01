import { initFederation } from '@angular-architects/native-federation';

initFederation('assets/federation.manifest.json')
  .catch(err => console.error('[NativeFederation] Manifest Init Error:', err))
  .then(() => import('./bootstrap'))
  .catch(err => console.error('[Bootstrap Error]', err));

