/**
 * 05-resolution-modifiers-self-host.ts
 *
 * Demonstrates:
 * 1. Modern inject() resolution modifiers: { optional, self, skipSelf, host }.
 * 2. Recursive parent-child tree node traversal with { skipSelf: true }.
 * 3. Enforcing directive host boundaries with { self: true } and { host: true }.
 * 4. Graceful fallback handling with { optional: true }.
 */

import { Component, Directive, Injectable, Input, inject } from '@angular/core';

@Injectable()
export class ValidationController {
  validate(): boolean {
    return true;
  }
}

/**
 * Directive requiring a ValidationController provided strictly on its own host element:
 */
@Directive({
  selector: '[appValidateOnSelf]',
  standalone: true
})
export class ValidateOnSelfDirective {
  // 🔍 { self: true } looks ONLY inside this directive's immediate ElementInjector.
  // It will NOT ascend to parent components!
  private controller = inject(ValidationController, { self: true });

  check() {
    return this.controller.validate();
  }
}

/**
 * Hierarchical Tree Node Component demonstrating { skipSelf: true }:
 * When rendering nested tree structures (e.g. file trees, menu trees, category lists),
 * each node needs to calculate its depth by querying its parent node.
 */
@Component({
  selector: 'app-tree-node',
  standalone: true,
  template: `
    <div class="tree-node" [style.padding-left.px]="depth * 18">
      <span class="label">📂 {{ label }} (Depth: {{ depth }})</span>
      <div class="nested-children">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class TreeNodeComponent {
  @Input() label = 'Root';

  /**
   * 🔍 { skipSelf: true }:
   * - Bypasses the current component's ElementInjector.
   * - Starts searching at the PARENT ElementInjector.
   * - Prevents the node from injecting itself into itself (which would cause a circular reference / depth = 0).
   *
   * 🔍 { optional: true }:
   * - Returns null for the top-level root node instead of throwing NG0201.
   */
  private parent = inject(TreeNodeComponent, { optional: true, skipSelf: true });

  readonly depth: number = this.parent ? this.parent.depth + 1 : 0;
}
