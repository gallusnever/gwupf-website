// API Configuration
const API_CONFIG = {
    // FRED API (Federal Reserve Economic Data)
    // Get your free key at: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED_API_KEY: '640e92b1ec961c1b7b364009de7a8e79', // Your FRED API key
    
    // Series IDs for different data
    FRED_SERIES: {
        MORTGAGE_30_YEAR: 'MORTGAGE30US',
        MORTGAGE_15_YEAR: 'MORTGAGE15US',
        INFLATION_CPI: 'CPIAUCSL',
        FEDERAL_FUNDS_RATE: 'DFF'
    },
    
    // Default values if API fails
    DEFAULTS: {
        mortgage30: 6.8,
        mortgage15: 6.2,
        inflationRate: 3.2,
        sp500Return: 10.5,
        homeAppreciation: 4.0
    },
    
    // Calculation assumptions
    ASSUMPTIONS: {
        sellingCostPercent: 0.06,  // 6% to sell
        buyingCostPercent: 0.03,   // 3% to buy
        defaultDownPayment: 20,    // 20% down
        loanTermYears: 30          // 30-year mortgage
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}