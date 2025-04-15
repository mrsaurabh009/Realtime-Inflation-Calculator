// DOM Elements
const currencyToggle = document.querySelectorAll('.toggle-switch button');
const currencySymbol = document.querySelector('.currency-symbol');
const amountInput = document.getElementById('amount');
const currentDateInput = document.getElementById('current-date');
const targetYearSelect = document.getElementById('target-year');
const calculateBtn = document.getElementById('calculate-btn');
const resultsCard = document.querySelector('.results-card');

// Inflation Data (relative to 2024)
const inflationData = {
    "USD": {
        "1900": 0.03, "1910": 0.05, "1920": 0.08, "1930": 0.06, 
        "1940": 0.06, "1950": 0.12, "1960": 0.18, "1970": 0.26,
        "1980": 0.50, "1990": 0.78, "2000": 0.95, "2010": 1.10,
        "2020": 1.25, "2024": 1.00
    },
    "INR": {
        "1900": 0.001, "1910": 0.0015, "1920": 0.002, "1930": 0.0025,
        "1940": 0.003, "1950": 0.02, "1960": 0.04, "1970": 0.08,
        "1980": 0.18, "1990": 0.35, "2000": 0.65, "2010": 0.88,
        "2020": 1.02, "2024": 1.00
    }
};

// Historical purchasing power examples
const historicalFacts = {
    "USD": {
        "1900": "a pound of coffee ($0.15) and 5 lbs of sugar ($0.25)",
        "1910": "a gallon of milk ($0.32) and 1 lb of butter ($0.32)",
        "1920": "10 gallons of gas ($1.30) and a week's groceries ($2.50)",
        "1930": "a radio ($18) and 5 movie tickets ($0.50)",
        "1940": "a man's suit ($20) and leather shoes ($4)",
        "1950": "50 gallons of gas ($13.50) and 10 movie tickets ($6)",
        "1960": "a portable TV ($100) and transistor radio ($25)",
        "1970": "a color TV ($400) and stereo system ($150)",
        "1980": "an Apple II computer ($1,300) and VCR ($500)",
        "1990": "a desktop PC ($2,000) and CD player ($200)",
        "2000": "a DVD player ($300) and gaming console ($200)",
        "2010": "an iPad ($500) and smartphone ($200)",
        "2020": "a smart TV ($500) and gaming console ($300)"
    },
    "INR": {
        "1900": "100 kg wheat (₹5) and a silk sari (₹2)",
        "1910": "a month's rent (₹3) and 100 kg rice (₹8)",
        "1920": "a bicycle (₹40) and wristwatch (₹10)",
        "1930": "a cow (₹50) and sewing machine (₹30)",
        "1940": "a radio (₹200) and month's groceries (₹15)",
        "1950": "100 kg rice (₹15) and 10 movie tickets (₹5)",
        "1960": "a sewing machine (₹300) and bicycle (₹200)",
        "1970": "a month's rent (₹100) and scooter (₹3,000)",
        "1980": "a TV (₹2,000) and refrigerator (₹1,500)",
        "1990": "a motorcycle (₹15,000) and color TV (₹8,000)",
        "2000": "a mobile phone (₹5,000) and desktop PC (₹25,000)",
        "2010": "a small car (₹200,000) and laptop (₹30,000)",
        "2020": "a smart TV (₹25,000) and smartphone (₹15,000)"
    }
};

// Chart instance reference
let inflationChart = null;

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    // Set default date
    currentDateInput.valueAsDate = new Date();
    
    // Initialize with USD first
    updateYearDropdown('USD');
    
    // Set default amount
    amountInput.value = '100';
});

// Currency toggle handler
currencyToggle.forEach(button => {
    button.addEventListener('click', function() {
        // Update active button
        currencyToggle.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Update currency symbol
        const currency = this.dataset.currency;
        currencySymbol.textContent = currency === 'USD' ? '$' : '₹';
        
        // Update year dropdown for selected currency
        updateYearDropdown(currency);
        
        // Recalculate if there's already a result
        if (!resultsCard.classList.contains('hidden')) {
            calculateInflation();
        }
    });
});

// Update year dropdown based on currency
function updateYearDropdown(currency) {
    // Clear existing options
    targetYearSelect.innerHTML = '';
    
    // Get available years for selected currency (only up to 2020)
    const availableYears = Object.keys(inflationData[currency])
        .map(Number)
        .filter(year => year <= 2020)
        .sort((a, b) => b - a);
    
    // Add decade years (1900, 1910, 1920...)
    for (let year = 2020; year >= 1900; year -= 10) {
        if (availableYears.includes(year)) {
            addYearOption(year);
        }
    }
    
    // Set default to 1980 or closest available
    const defaultYear = availableYears.find(y => y <= 1980) || availableYears[0];
    targetYearSelect.value = defaultYear;
}

// Helper function to add year options
function addYearOption(year) {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    targetYearSelect.appendChild(option);
}

// Handle calculation
calculateBtn.addEventListener('click', calculateInflation);

function calculateInflation() {
    const amount = parseFloat(amountInput.value);
    const targetYear = targetYearSelect.value;
    const currency = document.querySelector('.toggle-switch button.active').textContent;
    const symbol = currency === 'USD' ? '$' : '₹';
    const currentYear = new Date().getFullYear();

    // Validate input
    if (!amount || isNaN(amount)) {
        alert("Please enter a valid amount");
        return;
    }

    // Get inflation adjustment factor
    const inflationFactor = inflationData[currency][targetYear];
    if (!inflationFactor) {
        alert("No data available for selected year");
        return;
    }

    // Calculate values
    const pastValue = (amount * inflationFactor).toFixed(2);
    const percentageChange = ((amount - pastValue) / amount * 100).toFixed(2);
    const formattedAmount = formatCurrency(amount, currency);
    const formattedPastValue = formatCurrency(pastValue, currency);

    // Display results
    resultsCard.innerHTML = `
        <h3>💰 Inflation Result</h3>
        <div class="result-values">
            <p class="comparison">${symbol}${formattedAmount} in ${currentYear} ≈ ${symbol}${formattedPastValue} in ${targetYear}</p>
            <p class="percentage-change">Purchasing power <span class="change-direction">↓</span> <span class="change-amount">${percentageChange}%</span></p>
        </div>
        <div class="history-card">
            <p class="history-title">📜 What could you buy then?</p>
            <p class="history-fact">In ${targetYear}, ${symbol}${formattedAmount} could buy <strong>${historicalFacts[currency][targetYear]}</strong></p>
        </div>
        <div class="chart-container">
            <canvas id="inflationChart"></canvas>
        </div>
    `;

    resultsCard.classList.remove('hidden');
    renderInflationChart(targetYear, amount, pastValue, currency);
}

// Format currency with commas
function formatCurrency(value, currency) {
    const numValue = parseFloat(value);
    if (currency === 'INR') {
        return new Intl.NumberFormat('en-IN').format(numValue);
    }
    return new Intl.NumberFormat('en-US').format(numValue);
}

// Render the inflation chart
function renderInflationChart(targetYear, currentValue, pastValue, currency) {
    const ctx = document.getElementById('inflationChart').getContext('2d');
    const symbol = currency === 'USD' ? '$' : '₹';
    
    // Prepare chart data (only up to 2020)
    const years = Object.keys(inflationData[currency])
        .map(Number)
        .filter(year => year <= 2020)
        .sort((a, b) => a - b);
    
    // Convert values to numbers and handle any potential invalid data
    const values = years.map(year => {
        const val = inflationData[currency][year];
        return val ? parseFloat((1 / val).toFixed(2)) : 0;
    });
    
    // Highlight the selected year
    const bgColors = years.map(year => 
        year == targetYear ? '#2563eb' : '#cbd5e1'
    );
    
    // Destroy previous chart if exists
    if (inflationChart) {
        inflationChart.destroy();
    }
    
    // Create new chart
    inflationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: [{
                label: 'Relative Value',
                data: values,
                backgroundColor: bgColors,
                borderColor: bgColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Purchasing Power (Relative to Today)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    },

                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valueToday = (currentValue / inflationData[currency][context.label]).toFixed(2);
                            return `${symbol}${formatCurrency(currentValue, currency)} today = ${symbol}${formatCurrency(valueToday, currency)} in ${context.label}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}