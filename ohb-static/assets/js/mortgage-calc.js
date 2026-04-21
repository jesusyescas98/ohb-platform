/* ===================================
   OHB MORTGAGE CALCULATOR
   PMT formula, amortization table
   =================================== */

/**
 * Calculate monthly mortgage payment
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} years - Loan term
 * @returns {number} Monthly payment
 */
function calcMonthlyPayment(principal, annualRate, years) {
  return OHB_UTILS.calculateMortgagePayment(principal, annualRate, years);
}

/**
 * Generate amortization schedule
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate
 * @param {number} years - Loan term
 * @returns {array} Amortization schedule
 */
function generateAmortization(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, years);
  
  const schedule = [];
  let balance = principal;
  
  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }
  
  return schedule;
}

/**
 * Render mortgage calculator
 * @param {string} containerId - Container element ID
 */
function renderMortgageCalc(containerId = 'calculator-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const html = `
    <div class="calculator-container">
      <h2 style="text-align: center; margin-bottom: 2rem;">💰 Calculadora de Hipoteca</h2>
      
      <form id="mortgage-form" class="calculator-form">
        <div class="form-row">
          <div class="form-group">
            <label for="purchase-price">Precio de Compra (MXN)</label>
            <input type="number" id="purchase-price" min="100000" value="1500000" required>
          </div>
          <div class="form-group">
            <label for="down-payment">Enganche (%)</label>
            <input type="number" id="down-payment" min="0" max="100" value="20" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="interest-rate">Tasa de Interés Anual (%)</label>
            <input type="number" id="interest-rate" min="0" max="20" step="0.1" value="8.5" required>
          </div>
          <div class="form-group">
            <label for="loan-term">Plazo (años)</label>
            <input type="number" id="loan-term" min="1" max="30" value="20" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="closing-costs">Costos de Cierre (MXN)</label>
          <input type="number" id="closing-costs" min="0" value="50000">
        </div>
        
        <button type="button" id="calc-btn" class="btn btn-primary" style="width: 100%;">Calcular</button>
      </form>
      
      <div id="calculator-results" style="display: none; margin-top: 2rem;">
        <div class="calculator-result">
          <div class="result-value" id="monthly-payment">$0</div>
          <div class="result-label">Pago Mensual Estimado</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Monto a Financiar</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary-light);" id="loan-amount">$0</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Total a Pagar</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary-light);" id="total-paid">$0</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Intereses Totales</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-error);" id="total-interest">$0</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Costo Total</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-warning);" id="total-cost">$0</div>
          </div>
        </div>
        
        <div style="margin-top: 2rem;">
          <h3 style="margin-bottom: 1rem;">Tabla de Amortización (12 primeros meses)</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--color-surface-light);">
                  <th style="padding: 0.75rem; text-align: left;">Mes</th>
                  <th style="padding: 0.75rem; text-align: right;">Pago</th>
                  <th style="padding: 0.75rem; text-align: right;">Principal</th>
                  <th style="padding: 0.75rem; text-align: right;">Interés</th>
                  <th style="padding: 0.75rem; text-align: right;">Saldo</th>
                </tr>
              </thead>
              <tbody id="amortization-table">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Setup event listener
  document.getElementById('calc-btn').addEventListener('click', calculateMortgage);
}

/**
 * Calculate and display mortgage
 */
function calculateMortgage() {
  const purchasePrice = parseFloat(document.getElementById('purchase-price').value);
  const downPaymentPercent = parseFloat(document.getElementById('down-payment').value);
  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const loanTerm = parseFloat(document.getElementById('loan-term').value);
  const closingCosts = parseFloat(document.getElementById('closing-costs').value) || 0;
  
  if (!purchasePrice || purchasePrice <= 0) {
    alert('Por favor ingresa un precio válido');
    return;
  }
  
  // Calculate loan amount
  const downPayment = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPayment;
  
  // Calculate monthly payment
  const monthlyPayment = calcMonthlyPayment(loanAmount, interestRate, loanTerm);
  const totalPaid = monthlyPayment * loanTerm * 12;
  const totalInterest = totalPaid - loanAmount;
  const totalCost = purchasePrice + closingCosts + totalInterest;
  
  // Update results
  document.getElementById('monthly-payment').textContent = OHB_UTILS.formatPrice(monthlyPayment);
  document.getElementById('loan-amount').textContent = OHB_UTILS.formatPrice(loanAmount);
  document.getElementById('total-paid').textContent = OHB_UTILS.formatPrice(totalPaid);
  document.getElementById('total-interest').textContent = OHB_UTILS.formatPrice(totalInterest);
  document.getElementById('total-cost').textContent = OHB_UTILS.formatPrice(totalCost);
  
  // Show results
  document.getElementById('calculator-results').style.display = 'block';
  
  // Generate amortization table
  const schedule = generateAmortization(loanAmount, interestRate, loanTerm);
  const tableBody = document.getElementById('amortization-table');
  tableBody.innerHTML = '';
  
  for (let i = 0; i < Math.min(12, schedule.length); i++) {
    const row = schedule[i];
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--color-surface-light)';
    tr.innerHTML = `
      <td style="padding: 0.75rem;">${row.month}</td>
      <td style="padding: 0.75rem; text-align: right;">${OHB_UTILS.formatPrice(row.payment)}</td>
      <td style="padding: 0.75rem; text-align: right; color: var(--color-success);">${OHB_UTILS.formatPrice(row.principal)}</td>
      <td style="padding: 0.75rem; text-align: right; color: var(--color-error);">${OHB_UTILS.formatPrice(row.interest)}</td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 600;">${OHB_UTILS.formatPrice(row.balance)}</td>
    `;
    tableBody.appendChild(tr);
  }
}

// Export functions
window.OHB_MORTGAGE = {
  calcMonthlyPayment,
  generateAmortization,
  renderMortgageCalc,
  calculateMortgage,
};
