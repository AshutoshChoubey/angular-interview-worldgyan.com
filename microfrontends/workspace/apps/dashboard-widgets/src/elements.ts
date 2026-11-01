import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { FmStatusWidgetComponent } from './widgets/fm-status-widget.component';
import { TopologySummaryWidgetComponent } from './widgets/topology-summary-widget.component';

export async function bootstrapWebComponents(): Promise<void> {
  if (customElements.get('fm-status-widget') && customElements.get('topology-summary-widget')) {
    return;
  }

  const appRef = await createApplication({ providers: [] });

  if (!customElements.get('fm-status-widget')) {
    const fmElement = createCustomElement(FmStatusWidgetComponent, { injector: appRef.injector });
    customElements.define('fm-status-widget', fmElement);
  }

  if (!customElements.get('topology-summary-widget')) {
    const topoElement = createCustomElement(TopologySummaryWidgetComponent, { injector: appRef.injector });
    customElements.define('topology-summary-widget', topoElement);
  }

  console.log('[Native Federation] Web Components registered successfully.');
}

bootstrapWebComponents().catch(err => console.error(err));

