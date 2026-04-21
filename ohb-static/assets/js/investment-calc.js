/* ===================================
   OHB INVESTMENT CALCULATOR
   ROI projection, monthly breakdown
   =================================== */

/**
 * Render investment calculator
 * @param {string} containerId - Container element ID
 */
function renderInvestmentCalc(containerId = 'calculator-container') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const html = `
    <div class="calculator-container">
      <h2 style="text-align: center; margin-bottom: 2rem;">📈 Calculadora de Inversión Inmobiliaria</h2>
      
      <form id="investment-form" class="calculator-form">
        <div class="form-row">
          <div class="form-group">
            <label for="property-price">Precio de Propiedad (MXN)</label>
            <input type="number" id="property-price" min="100000" value="1500000" required>
          </div>
          <div class="form-group">
            <label for="monthly-rent">Renta Mensual (MXN)</label>
            <input type="number" id="monthly-rent" min="0" value="12000" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="monthly-expenses">Gastos Mensuales (MXN)</label>
            <input type="number" id="monthly-expenses" min="0" value="2000">
          </div>
          <div class="form-group">
            <label for="investment-years">Período de Inversión (años)</label>
            <input type="number" id="investment-years" min="1" max="30" value="5" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="appreciation-rate">Apreciación Anual (%)</label>
            <input type="number" id="appreciation-rate" min="0" max="20" step="0.5" value="5">
          </div>
          <div class="form-group">
            <label for="vacancy-rate">Tasa de Desocupación (%)</label>
            <input type="number" id="vacancy-rate" min="0" max="100" value="5">
          </div>
        </div>
        
        <button type="button" id="calc-investment-btn" class="btn btn-primary" style="width: 100%;">Calcular ROI</button>
      </form>
      
      <div id="investment-results" style="display: none; margin-top: 2rem;">
        <div class="calculator-result">
          <div class="result-value" id="total-roi">0%</div>
          <div class="result-label">ROI Total</div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1.5rem;">
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">ROI Anual Promedio</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary-light);" id="annual-roi">0%</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Ingreso Total Neto</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);" id="total-income">$0</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Valor Futuro de Propiedad</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-secondary-light);" id="future-value">$0</div>
          </div>
          
          <div style="background: var(--color-surface); padding: 1.5rem; border-radius: var(--radius-lg);">
            <div style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">Ganancia Total</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);" id="total-gain">$0</div>
          </div>
        </div>
        
        <div style="margin-top: 2rem;">
          <h3 style="margin-bottom: 1rem;">Proyección Anual</h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; font-size: 0.875rem;">
              <thead>
                <tr style="background: var(--color-surface-light);">
                  <th style="padding: 0.75rem; text-align: left;">Año</th>
                  <th style="padding: 0.75rem; text-align: right;">Ingreso Neto</th>
                  <th style="padding: 0.75rem; text-align: right;">Acumulado</th>
                  <th style="padding: 0.75rem; text-align: right;">Valor Propiedad</th>
                  <th style="padding: 0.75rem; text-align: right;">ROI %</th>
                </tr>
              </thead>
              <tbody id="investment-table">
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
  document.getElementById('calc-investment-btn').addEventListener('click', calculateInvestment);
}

/**
 * Calculate investment ROI
 */
function calculateInvestment() {
  const propertyPrice = parseFloat(document.getElementById('property-price').value);
  const monthlyRent = parseFloat(document.getElementById('monthly-rent').value);
  const monthlyExpenses = parseFloat(document.getElementById('monthly-expenses').value) || 0;
  const investmentYears = parseFloat(document.getElementById('investment-years').value);
  const appreciationRate = parseFloat(document.getElementById('appreciation-rate').value) / 100;
  const vacancyRate = parseFloat(document.getElementById('vacancy-rate').value) / 100;
  
  if (!propertyPrice || propertyPrice <= 0) {
    alert('Por favor ingresa un precio válido');
    return;
  }
  
  // Calculate effective monthly rent (accounting for vacancy)
  const effectiveMonthlyRent = monthlyRent * (1 - vacancyRate);
  const monthlyNetIncome = effectiveMonthlyRent - monthlyExpenses;
  const annualNetIncome = monthlyNetIncome * 12;
  
  let totalAccumulatedIncome = 0;
  let projectionData = [];
  
  // Generate annual projection
  for (let year = 1; year <= investmentYears; year++) {
    const propertyValue = propertyPrice * Math.pow(1 + appreciationRate, year);
    const yearlyIncome = annualNetIncome * year; // Simple projection
    const totalIncome = yearlyIncome;
    const appreciation = propertyValue - propertyPrice;
    const totalGain = totalIncome + appreciation;
    const roi = (totalGain / propertyPrice) * 100;
    
    totalAccumulatedIncome = totalIncome;
    
    projectionData.push({
      year,
      annualIncome: annualNetIncome,
      accumulated: totalIncome,
      propertyValue,
      roi,
    });
  }
  
  // Calculate totals
  const futurePropertyValue = propertyPrice * Math.pow(1 + appreciationRate, investmentYears);
  const appreciation = futurePropertyValue - propertyPrice;
  const totalIncome = totalAccumulatedIncome;
  const totalGain = totalIncome + appreciation;
  const totalROI = (totalGain / propertyPrice) * 100;
  const annualROI = totalROI / investmentYears;
  
  // Update display
  document.getElementById('total-roi').textContent = totalROI.toFixed(1) + '%';
  document.getElementById('annual-roi').textContent = annualROI.toFixed(1) + '%';
  document.getElementById('total-income').textContent = OHB_UTILS.formatPrice(totalIncome);
  document.getElementById('future-value').textContent = OHB_UTILS.formatPrice(futurePropertyValue);
  document.getElementById('total-gain').textContent = OHB_UTILS.formatPrice(totalGain);
  
  // Populate table
  const tableBody = document.getElementById('investment-table');
  tableBody.innerHTML = '';
  
  projectionData.forEach((row) => {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--color-surface-light)';
    tr.innerHTML = `
      <td style="padding: 0.75rem;">Año ${row.year}</td>
      <td style="padding: 0.75rem; text-align: right; color: var(--color-success);">${OHB_UTILS.formatPrice(row.annualIncome)}</td>
      <td style="padding: 0.75rem; text-align: right; font-weight: 600;">${OHB_UTILS.formatPrice(row.accumulated)}</td>
      <td style="padding: 0.75rem; text-align: right;">${OHB_UTILS.formatPrice(row.propertyValue)}</td>
      <td style="padding: 0.75rem; text-align: right; color: var(--color-secondary-light);">${row.roi.toFixed(1)}%</td>
    `;
    tableBody.appendChild(tr);
  });
  
  // Show results
  document.getElementById('investment-results').style.display = 'block';
}

/**
 * Get investment summary
 * @returns {object} Investment summary
 */
function getInvestmentSummary() {
  const totalROI = document.getElementById('total-roi')?.textContent || '0%';
  const annualROI = document.getElementById('annual-roi')?.textContent || '0%';
  const totalIncome = document.getElementById('total-income')?.textContent || '$0';
  
  return {
    totalROI,
    annualROI,
    totalIncome,
  };
}

// Export functions
window.OHB_INVESTMENT = {
  renderInvestmentCalc,
  calculateInvestment,
  getInvestmentSummary,
};
