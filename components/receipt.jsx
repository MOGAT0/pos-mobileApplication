import React, { forwardRef, useImperativeHandle } from "react";
import * as Print from "expo-print";

const Receipt = forwardRef((props, ref) => {
  const generateReceiptText = () => {
    // Helper to align columns with colon centered
    const padColumns = (label, value, totalWidth = 30) => {
      const left = `${label} :`;
      const spaces = Math.max(1, totalWidth - left.length - String(value).length);
      return left + " ".repeat(spaces) + value;
    };

    // Center the dashed line
    const centeredLine = (char = "-", length = 30) => {
      return char.repeat(length);
    };

    return `
      <div style="text-align:center; font-family:monospace; white-space:pre; font-size:12px; line-height:1.1;">
OFFICIAL RECEIPT
DHILLON & SEKHON TRADING
CORPORATION
#${props.transaction_no}
${new Date().toLocaleString()}

${padColumns("Customer Name", props.customer_name)}
${padColumns("Swap", props.swap)}
${padColumns("Container Qty", props.container_qty)}
${padColumns("Unit Price", props.unit_price)}
${padColumns("Total Amount", props.total_amount)}
${padColumns("No. of Days", props.days)}
${centeredLine()}
${padColumns("TOTAL BALANCE", props.total_balance)}
${padColumns("Payment Amount", props.payment_amount)}
${centeredLine()}
${padColumns("Trans History", props.trans_history)}
${padColumns("How much paid", props.hm_paid)}
${padColumns("Remaining Balance", props.balance)}
      </div>
    `;
  };

  useImperativeHandle(ref, () => ({
    async printReceipt() {
      try {
        await Print.printAsync({ html: generateReceiptText() });
      } catch (err) {
        console.error("Print Error:", err);
      }
    },
  }));

  return null;
});

export default Receipt;
