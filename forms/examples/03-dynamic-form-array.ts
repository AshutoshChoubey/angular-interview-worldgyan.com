/**
 * 03-dynamic-form-array.ts
 * ============================================================================
 * Production Pattern: Dynamic FormArray for Line Items & Invoices
 *
 * Real-World Scenario:
 * - Enterprise Purchase Order / Invoice generation with runtime add/remove.
 * - Dynamic FormArray containing nested FormGroups.
 * - Live computed subtotal, tax, and grand total calculations.
 * ============================================================================
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators
} from '@angular/forms';

export interface LineItemModel {
  description: FormControl<string>;
  quantity: FormControl<number>;
  unitPrice: FormControl<number>;
}

export interface InvoiceFormModel {
  customerName: FormControl<string>;
  invoiceNumber: FormControl<string>;
  items: FormArray<FormGroup<LineItemModel>>;
}

@Component({
  selector: 'app-dynamic-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="invoice-container">
      <h2>Purchase Order / Line Items Generator</h2>

      <form [formGroup]="invoiceForm" (ngSubmit)="saveInvoice()">
        
        <!-- Customer & Order Info -->
        <div class="header-grid">
          <div>
            <label>Customer Name</label>
            <input type="text" formControlName="customerName" class="form-input" />
          </div>
          <div>
            <label>Invoice Number</label>
            <input type="text" formControlName="invoiceNumber" class="form-input" />
          </div>
        </div>

        <div class="line-items-header">
          <h3>Line Items ({{ itemsArray.length }})</h3>
          <button type="button" class="btn-add" (click)="addLineItem()">+ Add Item</button>
        </div>

        <!-- Dynamic Items Table -->
        <div formArrayName="items" class="items-table">
          @for (itemGroup of itemsArray.controls; track $index) {
            <div [formGroupName]="$index" class="item-row">
              <span class="row-index">#{{ $index + 1 }}</span>
              
              <!-- Description -->
              <div class="col-desc">
                <input
                  type="text"
                  formControlName="description"
                  placeholder="Service or Product description"
                  class="form-input"
                  [class.error]="itemGroup.controls.description.invalid && itemGroup.controls.description.touched"
                />
              </div>

              <!-- Quantity -->
              <div class="col-qty">
                <input
                  type="number"
                  formControlName="quantity"
                  min="1"
                  class="form-input"
                  placeholder="Qty"
                />
              </div>

              <!-- Unit Price -->
              <div class="col-price">
                <input
                  type="number"
                  formControlName="unitPrice"
                  min="0.01"
                  step="0.01"
                  class="form-input"
                  placeholder="Unit Price ($)"
                />
              </div>

              <!-- Line Total Computed -->
              <div class="col-total">
                \${{ (itemGroup.controls.quantity.value * itemGroup.controls.unitPrice.value) | number:'1.2-2' }}
              </div>

              <!-- Remove Action -->
              <div class="col-action">
                <button
                  type="button"
                  class="btn-remove"
                  (click)="removeLineItem($index)"
                  [disabled]="itemsArray.length <= 1"
                  title="Remove Item"
                >
                  ✕
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Financial Summary Bar -->
        <footer class="invoice-summary">
          <div class="summary-line">
            <span>Subtotal:</span>
            <strong>\${{ calculateSubtotal() | number:'1.2-2' }}</strong>
          </div>
          <div class="summary-line">
            <span>Tax (8.25%):</span>
            <strong>\${{ (calculateSubtotal() * 0.0825) | number:'1.2-2' }}</strong>
          </div>
          <div class="summary-line grand-total">
            <span>Total Payable:</span>
            <strong>\${{ (calculateSubtotal() * 1.0825) | number:'1.2-2' }}</strong>
          </div>

          <button
            type="submit"
            class="btn-save"
            [disabled]="invoiceForm.invalid"
          >
            Generate Final Invoice
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: [`
    .invoice-container { max-width: 780px; margin: 2rem auto; font-family: system-ui, sans-serif; background: #fff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; }
    .header-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
    .line-items-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    .items-table { display: flex; flex-direction: column; gap: 0.75rem; }
    .item-row { display: grid; grid-template-columns: 32px 3fr 1fr 1.5fr 1.2fr 40px; gap: 0.75rem; align-items: center; background: #f8fafc; padding: 0.6rem; border-radius: 6px; }
    .form-input { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; }
    .form-input.error { border-color: #ef4444; }
    .btn-add { background: #0284c7; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; }
    .btn-remove { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; border-radius: 4px; cursor: pointer; width: 32px; height: 32px; font-weight: bold; }
    .btn-remove:disabled { opacity: 0.3; cursor: not-allowed; }
    .invoice-summary { margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; display: flex; flex-direction: column; align-items: flex-end; gap: 0.4rem; }
    .summary-line { font-size: 0.95rem; display: flex; gap: 1.5rem; }
    .grand-total { font-size: 1.2rem; color: #1e293b; margin-top: 0.4rem; }
    .btn-save { margin-top: 1rem; background: #16a34a; color: white; border: none; padding: 0.75rem 2rem; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class DynamicInvoiceFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly invoiceForm: FormGroup<InvoiceFormModel> = this.fb.group({
    customerName: ['Acme Global Enterprises', [Validators.required]],
    invoiceNumber: ['INV-2026-9041', [Validators.required]],
    items: this.fb.array<FormGroup<LineItemModel>>([
      this.createLineItemGroup('Cloud Infrastructure Consulting (Hours)', 40, 175)
    ])
  });

  get itemsArray(): FormArray<FormGroup<LineItemModel>> {
    return this.invoiceForm.controls.items;
  }

  createLineItemGroup(desc = '', qty = 1, price = 0): FormGroup<LineItemModel> {
    return this.fb.group({
      description: [desc, [Validators.required, Validators.minLength(2)]],
      quantity: [qty, [Validators.required, Validators.min(1)]],
      unitPrice: [price, [Validators.required, Validators.min(0.01)]]
    });
  }

  addLineItem(): void {
    this.itemsArray.push(this.createLineItemGroup());
  }

  removeLineItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  calculateSubtotal(): number {
    return this.itemsArray.controls.reduce((acc, group) => {
      const q = group.controls.quantity.value || 0;
      const p = group.controls.unitPrice.value || 0;
      return acc + (q * p);
    }, 0);
  }

  saveInvoice(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      return;
    }
    const finalPayload = this.invoiceForm.getRawValue();
    console.log('Final Enterprise Invoice Payload:', finalPayload);
    alert(`Invoice ${finalPayload.invoiceNumber} with ${finalPayload.items.length} line items saved!`);
  }
}
