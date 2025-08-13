// Home Purchase Decision Engine
// Comprehensive analysis with life factors

// Initialize range sliders
document.addEventListener('DOMContentLoaded', function() {
    // Update range values in real-time
    document.getElementById('schoolQuality').addEventListener('input', function(e) {
        document.getElementById('schoolValue').textContent = e.target.value;
    });
    document.getElementById('missingFeatures').addEventListener('input', function(e) {
        document.getElementById('featuresValue').textContent = e.target.value;
    });
    document.getElementById('neighborSituation').addEventListener('input', function(e) {
        document.getElementById('neighborValue').textContent = e.target.value;
    });
});

// Terminal loading animation
async function showTerminalLoading() {
    const terminal = document.getElementById('loadingTerminal');
    const content = document.getElementById('terminalContent');
    terminal.classList.add('active');
    content.innerHTML = '';
    
    const lines = [
        { text: '> INITIALIZING DECISION ANALYSIS ENGINE', delay: 0, color: 'var(--success)' },
        { text: '> LOADING FINANCIAL MODELS...', delay: 100, color: 'var(--text-secondary)' },
        { text: '', delay: 50 },
        { text: '> CALCULATING FINANCIAL METRICS', delay: 100, color: 'var(--warning)' },
        { text: '  ├─ Transaction Costs: CALCULATED', delay: 100, color: 'var(--success)' },
        { text: '  ├─ Rate Arbitrage: CALCULATED', delay: 100, color: 'var(--success)' },
        { text: '  ├─ Opportunity Cost: CALCULATED', delay: 100, color: 'var(--success)' },
        { text: '  └─ Cash Flow Impact: CALCULATED', delay: 100, color: 'var(--success)' },
        { text: '', delay: 50 },
        { text: '> ANALYZING LIFE FACTORS', delay: 100, color: 'var(--accent)' },
        { text: '  ├─ School Quality: WEIGHTED', delay: 100, color: 'var(--success)' },
        { text: '  ├─ Living Features: WEIGHTED', delay: 100, color: 'var(--success)' },
        { text: '  ├─ Neighborhood: WEIGHTED', delay: 100, color: 'var(--success)' },
        { text: '  └─ Commute Impact: WEIGHTED', delay: 100, color: 'var(--success)' },
        { text: '', delay: 50 },
        { text: '> GENERATING RECOMMENDATIONS...', delay: 150, color: 'var(--warning)' },
        { text: '> ANALYSIS COMPLETE', delay: 200, color: 'var(--success)' }
    ];
    
    for (const line of lines) {
        await sleep(line.delay);
        const lineElement = document.createElement('div');
        lineElement.className = 'terminal-line';
        lineElement.style.color = line.color || 'var(--success)';
        lineElement.innerHTML = line.text;
        content.appendChild(lineElement);
        content.scrollTop = content.scrollHeight;
    }
    
    await sleep(500);
    terminal.classList.remove('active');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeDecision() {
    // Get financial inputs
    const currentPurchasePrice = parseFloat(document.getElementById('currentPurchasePrice').value) || 0;
    const currentValue = parseFloat(document.getElementById('currentValue').value) || 0;
    const currentRate = parseFloat(document.getElementById('currentRate').value) || 0;
    const yearsOwned = parseFloat(document.getElementById('yearsOwned').value) || 0;
    const currentPayment = parseFloat(document.getElementById('currentPayment').value) || 0;
    
    const newPurchasePrice = parseFloat(document.getElementById('newPurchasePrice').value) || 0;
    const downPayment = parseFloat(document.getElementById('downPayment').value) || 20;
    const marketRate = parseFloat(document.getElementById('marketRate').value) || 6.8;
    const propertyTax = parseFloat(document.getElementById('propertyTax').value) || 0;
    const hoaFees = parseFloat(document.getElementById('hoaFees').value) || 0;
    
    // Get life factors
    const schoolQuality = parseInt(document.getElementById('schoolQuality').value);
    const missingFeatures = parseInt(document.getElementById('missingFeatures').value);
    const neighborSituation = parseInt(document.getElementById('neighborSituation').value);
    const commuteChange = parseFloat(document.getElementById('commuteChange').value) || 0;
    const considerRental = document.getElementById('considerRental').value;
    
    // Validate inputs
    if (!currentPurchasePrice || !currentValue || !currentRate || !newPurchasePrice) {
        alert('Please provide all required financial information');
        return;
    }
    
    // Show loading animation
    await showTerminalLoading();
    
    // Calculate financial metrics
    const equity = currentValue - (currentPurchasePrice * 0.8);
    const transactionCosts = currentValue * 0.06 + newPurchasePrice * 0.03;
    const newLoanAmount = newPurchasePrice * (1 - downPayment / 100);
    const rateDifference = marketRate - currentRate;
    
    // Monthly payment calculations
    const currentMonthlyPayment = currentPayment || calculateMonthlyPayment(currentPurchasePrice * 0.8, currentRate, 30);
    const newMonthlyPayment = calculateMonthlyPayment(newLoanAmount, marketRate, 30) + (propertyTax / 12) + hoaFees;
    const monthlyPaymentIncrease = newMonthlyPayment - currentMonthlyPayment;
    
    // Opportunity cost of equity
    const equityOpportunityCost = equity * 0.105; // 10.5% S&P average
    
    // Rate arbitrage cost (5 year)
    const rateArbitrageCost5Year = calculateRateArbitrage(
        currentPurchasePrice * 0.8,
        currentRate,
        marketRate,
        5
    );
    
    // Total cost analysis
    const totalCost5Year = transactionCosts + rateArbitrageCost5Year + (equityOpportunityCost * 5);
    
    // Calculate comprehensive score
    const score = calculateComprehensiveScore({
        financialCost: totalCost5Year,
        currentValue,
        schoolQuality,
        missingFeatures,
        neighborSituation,
        commuteChange,
        rateDifference,
        monthlyIncrease: monthlyPaymentIncrease,
        considerRental
    });
    
    // Show results
    document.getElementById('resultsSection').style.display = 'block';
    
    // Update verdict
    updateVerdict(score);
    
    // Update metrics
    updateMetrics({
        equity,
        transactionCosts,
        monthlyPaymentIncrease,
        rateDifference,
        rateArbitrageCost5Year,
        equityOpportunityCost,
        totalCost5Year,
        currentRate,
        marketRate
    });
    
    // Create charts
    createCostBreakdownChart(transactionCosts, rateArbitrageCost5Year, equityOpportunityCost);
    createEquityChart(currentValue, newPurchasePrice, equity, transactionCosts);
    createOpportunityChart(equity);
    
    // Generate recommendations
    generateRecommendations({
        considerRental,
        rateDifference,
        monthlyIncrease: monthlyPaymentIncrease,
        equity,
        totalCost5Year,
        schoolQuality,
        missingFeatures,
        neighborSituation,
        commuteChange
    });
}

function calculateMonthlyPayment(principal, rate, years) {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateRateArbitrage(remainingBalance, oldRate, newRate, years) {
    const oldMonthly = calculateMonthlyPayment(remainingBalance, oldRate, 30);
    const newMonthly = calculateMonthlyPayment(remainingBalance, newRate, 30);
    return (newMonthly - oldMonthly) * 12 * years;
}

function calculateComprehensiveScore(factors) {
    let score = 0;
    let maxScore = 100;
    
    // Financial factors (40% weight)
    const financialPenalty = Math.min((factors.financialCost / factors.currentValue) * 100, 40);
    score += financialPenalty;
    
    // Rate difference (20% weight)
    score += Math.min(factors.rateDifference * 5, 20);
    
    // Monthly payment increase (20% weight)
    const paymentIncreasePct = (factors.monthlyIncrease / 3000) * 20;
    score += Math.min(paymentIncreasePct, 20);
    
    // Life factor adjustments (20% weight)
    const lifeScore = (factors.schoolQuality + factors.missingFeatures + (10 - factors.neighborSituation)) / 3;
    const lifeAdjustment = (10 - lifeScore) * 2; // Better life factors reduce score
    score -= lifeAdjustment;
    
    // Commute adjustment
    if (factors.commuteChange < -15) score -= 5; // Significantly shorter commute
    if (factors.commuteChange > 15) score += 5; // Significantly longer commute
    
    // Rental consideration
    if (factors.considerRental === 'yes') score -= 10; // Keeping rental reduces risk
    
    return Math.max(0, Math.min(100, Math.round(score)));
}

function updateVerdict(score) {
    const scoreElement = document.getElementById('decisionScore');
    const textElement = document.getElementById('verdictText');
    
    if (score < 30) {
        scoreElement.textContent = 'PROCEED';
        scoreElement.className = 'decision-score score-excellent';
        textElement.textContent = 'Strong case for moving. Life improvements outweigh financial costs.';
    } else if (score < 60) {
        scoreElement.textContent = 'CONSIDER';
        scoreElement.className = 'decision-score score-okay';
        textElement.textContent = 'Mixed signals. Carefully weigh priorities before deciding.';
    } else {
        scoreElement.textContent = 'CAUTION';
        scoreElement.className = 'decision-score score-bad';
        textElement.textContent = 'High financial cost with limited life improvements. Consider alternatives.';
    }
}

function updateMetrics(metrics) {
    const grid = document.getElementById('metricsGrid');
    grid.innerHTML = `
        <div class="metric-card">
            <div class="metric-label">Current Rate</div>
            <div class="metric-value" style="color: var(--success)">${metrics.currentRate.toFixed(2)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Market Rate</div>
            <div class="metric-value" style="color: var(--danger)">${metrics.marketRate.toFixed(2)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Rate Penalty</div>
            <div class="metric-value" style="color: var(--warning)">${metrics.rateDifference.toFixed(2)}%</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Transaction Costs</div>
            <div class="metric-value">$${Math.round(metrics.transactionCosts).toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Monthly Increase</div>
            <div class="metric-value">$${Math.round(metrics.monthlyPaymentIncrease).toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">5-Year Rate Cost</div>
            <div class="metric-value">$${Math.round(metrics.rateArbitrageCost5Year).toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">Annual Opp. Cost</div>
            <div class="metric-value">$${Math.round(metrics.equityOpportunityCost).toLocaleString()}</div>
        </div>
        <div class="metric-card">
            <div class="metric-label">5-Year Total Cost</div>
            <div class="metric-value" style="color: var(--danger)">$${Math.round(metrics.totalCost5Year).toLocaleString()}</div>
        </div>
    `;
}

function createCostBreakdownChart(transaction, rateArbitrage, opportunity) {
    const total = transaction + rateArbitrage + (opportunity * 5);
    const transactionPct = (transaction / total * 100).toFixed(1);
    const arbitragePct = (rateArbitrage / total * 100).toFixed(1);
    const opportunityPct = ((opportunity * 5) / total * 100).toFixed(1);
    
    const maxBar = 30; // Shortened to fit screen
    const transBar = Math.round(transactionPct * maxBar / 100);
    const arbBar = Math.round(arbitragePct * maxBar / 100);
    const oppBar = Math.round(opportunityPct * maxBar / 100);
    
    const chart = `
 TRANSACTION COSTS        ${String(transactionPct).padStart(5)}%
 $${Math.round(transaction).toLocaleString().padEnd(10)} <span class="bar-red">${'▓'.repeat(transBar)}${'░'.repeat(maxBar - transBar)}</span>
 
 RATE ARBITRAGE (5YR)     ${String(arbitragePct).padStart(5)}%
 $${Math.round(rateArbitrage).toLocaleString().padEnd(10)} <span class="bar-yellow">${'▓'.repeat(arbBar)}${'░'.repeat(maxBar - arbBar)}</span>
 
 OPPORTUNITY COST (5YR)   ${String(opportunityPct).padStart(5)}%
 $${Math.round(opportunity * 5).toLocaleString().padEnd(10)} <span class="bar-blue">${'▓'.repeat(oppBar)}${'░'.repeat(maxBar - oppBar)}</span>
 
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TOTAL 5-YEAR COST: <span class="bar-red">$${Math.round(total).toLocaleString()}</span>
    `;
    
    document.getElementById('costChart').innerHTML = chart;
}

function createEquityChart(currentValue, newPrice, equity, transactionCosts) {
    const values = [
        { label: 'CURRENT EQUITY', value: equity, color: 'bar-green' },
        { label: 'AFTER SALE', value: equity - transactionCosts, color: 'bar-yellow' },
        { label: 'NEW HOME', value: newPrice * 0.2, color: 'bar-blue' }
    ];
    
    const maxValue = Math.max(...values.map(v => v.value));
    const barWidth = 25; // Adjusted for screen fit
    
    let chart = '\n';
    
    values.forEach((item, index) => {
        const barLength = Math.round((item.value / maxValue) * barWidth);
        chart += ` ${item.label.padEnd(15)} $${Math.round(item.value).toLocaleString().padEnd(10)}\n`;
        chart += ` <span class="${item.color}">${'█'.repeat(barLength)}</span>${' '.repeat(barWidth - barLength)}\n\n`;
    });
    
    const netChange = (newPrice * 0.2) - (equity - transactionCosts);
    if (netChange < 0) {
        chart += ` NET EQUITY LOSS: <span class="bar-red">-$${Math.round(Math.abs(netChange)).toLocaleString()}</span>\n`;
    } else {
        chart += ` NET EQUITY GAIN: <span class="bar-green">+$${Math.round(netChange).toLocaleString()}</span>\n`;
    }
    
    document.getElementById('equityChart').innerHTML = chart;
}

function createOpportunityChart(equity) {
    const years = [0, 1, 2, 3, 4, 5, 7, 10];
    const stockReturns = years.map(y => equity * Math.pow(1.105, y));
    const homeEquity = years.map(y => equity * Math.pow(1.04, y));
    
    let chart = `
 PROJECTED GROWTH COMPARISON
 
 Year    S&P 500 (10.5%)    Home (4%)      Difference
 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 NOW     $${Math.round(stockReturns[0]).toLocaleString().padEnd(10)} $${Math.round(homeEquity[0]).toLocaleString().padEnd(10)} $0
 1 YR    $${Math.round(stockReturns[1]).toLocaleString().padEnd(10)} $${Math.round(homeEquity[1]).toLocaleString().padEnd(10)} +$${Math.round(stockReturns[1] - homeEquity[1]).toLocaleString()}
 3 YR    $${Math.round(stockReturns[3]).toLocaleString().padEnd(10)} $${Math.round(homeEquity[3]).toLocaleString().padEnd(10)} +$${Math.round(stockReturns[3] - homeEquity[3]).toLocaleString()}
 5 YR    $${Math.round(stockReturns[5]).toLocaleString().padEnd(10)} $${Math.round(homeEquity[5]).toLocaleString().padEnd(10)} +$${Math.round(stockReturns[5] - homeEquity[5]).toLocaleString()}
 10 YR   $${Math.round(stockReturns[7]).toLocaleString().padEnd(10)} $${Math.round(homeEquity[7]).toLocaleString().padEnd(10)} <span class="bar-red">+$${Math.round(stockReturns[7] - homeEquity[7]).toLocaleString()}</span>
 
 10-YEAR OPPORTUNITY COST: <span class="bar-red">$${Math.round(stockReturns[7] - homeEquity[7]).toLocaleString()}</span>
    `;
    
    document.getElementById('opportunityChart').innerHTML = chart;
}

function generateRecommendations(factors) {
    let recommendations = [];
    
    // Financial recommendations
    if (factors.rateDifference > 3) {
        recommendations.push({
            type: 'warning',
            text: `Rate increase of ${factors.rateDifference.toFixed(1)}% will cost $${Math.round(factors.rateDifference * 10000).toLocaleString()} extra over 5 years`
        });
    }
    
    if (factors.considerRental === 'yes') {
        const potentialRent = Math.round(factors.equity * 0.006); // 0.6% of value as monthly rent estimate
        recommendations.push({
            type: 'success',
            text: `Keep current home as rental. Estimated rent: $${potentialRent.toLocaleString()}/mo could offset new mortgage`
        });
    }
    
    if (factors.monthlyIncrease > 2000) {
        recommendations.push({
            type: 'warning',
            text: `Monthly payment increases by $${Math.round(factors.monthlyIncrease).toLocaleString()}. Ensure this fits your budget.`
        });
    }
    
    // Life factor recommendations
    if (factors.schoolQuality >= 8) {
        recommendations.push({
            type: 'success',
            text: 'Significant school quality improvement justifies premium for families'
        });
    }
    
    if (factors.neighborSituation <= 3) {
        recommendations.push({
            type: 'success',
            text: 'Escaping poor neighbor situation improves quality of life substantially'
        });
    }
    
    if (factors.commuteChange < -20) {
        const timeSaved = Math.abs(factors.commuteChange) * 2 * 250; // Daily round trip * work days
        recommendations.push({
            type: 'success',
            text: `Save ${Math.round(timeSaved / 60)} hours/year on commute. Time is money.`
        });
    }
    
    // Strategic alternatives
    if (factors.totalCost5Year > 200000) {
        recommendations.push({
            type: 'info',
            text: 'Consider: Renovate current home, wait for rates to drop, or explore different neighborhoods'
        });
    }
    
    // Build recommendation HTML
    const content = document.getElementById('recommendationContent');
    content.innerHTML = recommendations.map(rec => {
        const icon = rec.type === 'warning' ? '⚠' : rec.type === 'success' ? '✓' : 'ℹ';
        const color = rec.type === 'warning' ? 'var(--warning)' : rec.type === 'success' ? 'var(--success)' : 'var(--accent)';
        return `<div class="recommendation-item" style="color: ${color}">${icon} ${rec.text}</div>`;
    }).join('');
}