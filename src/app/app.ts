import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PaymentRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
  progress: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  leaseAmount: number = 450000;
  downPayment: number = 50000;
  residualValue: number = 90000;
  interestRate: number = 5.2;
  leasePeriod: number = 36;

  monthlyPayment: number = 0;
  totalPayable: number = 0;
  totalInterest: number = 0;
  financedAmount: number = 0;
  totalPrincipal: number = 0;

  errorMessage: string = '';
  hasCalculated: boolean = false;

  paymentSchedule: PaymentRow[] = [];

  calculateLease(): void {
    this.errorMessage = '';
    this.paymentSchedule = [];
    this.hasCalculated = false;

    if (!this.isInputValid()) {
      return;
    }

    this.financedAmount = this.leaseAmount - this.downPayment - this.residualValue;
    const monthlyRate = this.interestRate / 100 / 12;

    if (monthlyRate === 0) {
      this.monthlyPayment = this.financedAmount / this.leasePeriod;
    } else {
      this.monthlyPayment =
        this.financedAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, this.leasePeriod)) /
        (Math.pow(1 + monthlyRate, this.leasePeriod) - 1);
    }

    this.totalPrincipal = this.financedAmount;
    this.totalPayable = this.monthlyPayment * this.leasePeriod + this.downPayment + this.residualValue;
    this.totalInterest = this.monthlyPayment * this.leasePeriod - this.financedAmount;

    this.createPaymentSchedule();
    this.hasCalculated = true;
  }

  resetCalculator(): void {
    this.leaseAmount = 450000;
    this.downPayment = 50000;
    this.residualValue = 90000;
    this.interestRate = 5.2;
    this.leasePeriod = 36;

    this.monthlyPayment = 0;
    this.totalPayable = 0;
    this.totalInterest = 0;
    this.financedAmount = 0;
    this.totalPrincipal = 0;

    this.errorMessage = '';
    this.hasCalculated = false;
    this.paymentSchedule = [];
  }

  private isInputValid(): boolean {
    if (this.leaseAmount <= 0) {
      this.errorMessage = 'Lease amount must be greater than 0.';
      return false;
    }

    if (this.downPayment < 0 || this.residualValue < 0) {
      this.errorMessage = 'Down payment and residual value cannot be negative.';
      return false;
    }

    if (this.downPayment + this.residualValue >= this.leaseAmount) {
      this.errorMessage = 'Down payment and residual value cannot be equal to or higher than the lease amount.';
      return false;
    }

    if (this.interestRate < 0) {
      this.errorMessage = 'Interest rate cannot be negative.';
      return false;
    }

    if (this.leasePeriod <= 0) {
      this.errorMessage = 'Lease period must be greater than 0.';
      return false;
    }

    return true;
  }

  private createPaymentSchedule(): void {
    let remainingBalance = this.financedAmount;
    const monthlyRate = this.interestRate / 100 / 12;

    for (let month = 1; month <= this.leasePeriod; month++) {
      const interest = remainingBalance * monthlyRate;
      const principal = this.monthlyPayment - interest;

      remainingBalance -= principal;

      if (remainingBalance < 0) {
        remainingBalance = 0;
      }

      const progress = ((this.financedAmount - remainingBalance) / this.financedAmount) * 100;

      this.paymentSchedule.push({
        month,
        payment: this.monthlyPayment,
        interest,
        principal,
        remainingBalance,
        progress
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(value);
  }

  getRiskLevel(): string {
    if (this.interestRate <= 3) {
      return 'Low';
    }

    if (this.interestRate <= 6) {
      return 'Medium';
    }

    return 'High';
  }
}