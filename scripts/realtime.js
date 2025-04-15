document.addEventListener('DOMContentLoaded', function () {
    const currentCostInput = document.getElementById('currentCost');
    const inflationRateInput = document.getElementById('inflationRate');
    const timePeriodInput = document.getElementById('timePeriod');
    const currentCostValue = document.getElementById('currentCostValue');
    const inflationRateValue = document.getElementById('inflationRateValue');
    const timePeriodValue = document.getElementById('timePeriodValue');
    const resultCurrentCost = document.getElementById('resultCurrentCost');
    const resultCostIncrease = document.getElementById('resultCostIncrease');
    const resultFutureCost = document.getElementById('resultFutureCost');

    let chartInstance = null;

    // Make input fields editable on click
    [currentCostValue, inflationRateValue, timePeriodValue].forEach(input => {
        input.addEventListener('click', function () {
            this.focus();
            this.select();
            // Remove readonly on focus for editing
            this.removeAttribute('readonly');
        });
        input.addEventListener('blur', function () {
            this.setAttribute('readonly', 'readonly'); // Restore readonly on blur
            updateFromInput(this);
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    });

    function updateFromInput(inputElement) {
        let value = inputElement.value.trim();
        if (inputElement === currentCostValue) {
            value = value.replace(/[^0-9]/g, '');
            const newValue = Math.max(0, Math.min(5000000, parseInt(value) || 0));
            currentCostInput.value = newValue;
            currentCostValue.value = `₹${newValue.toLocaleString('en-IN')}`;
        } else if (inputElement === inflationRateValue) {
            value = value.replace('%', '');
            const newValue = Math.max(0, Math.min(20, parseFloat(value) || 0));
            inflationRateInput.value = newValue;
            inflationRateValue.value = `${newValue}%`;
        } else if (inputElement === timePeriodValue) {
            value = value.replace('Yr', '').trim();
            const newValue = Math.max(0, Math.min(20, parseInt(value) || 0));
            timePeriodInput.value = newValue;
            timePeriodValue.value = `${newValue} Yr`;
        }
        calculateInflation();
    }

    function calculateInflation() {
        const currentCost = parseFloat(currentCostInput.value) || 0;
        const inflationRate = parseFloat(inflationRateInput.value) / 100 || 0;
        const timePeriod = parseFloat(timePeriodInput.value) || 0;

        currentCostValue.value = `₹${currentCost.toLocaleString('en-IN')}`;
        inflationRateValue.value = `${(inflationRate * 100).toFixed(1)}%`;
        timePeriodValue.value = `${timePeriod} Yr`;

        const futureCost = currentCost * Math.pow(1 + inflationRate, timePeriod);
        const costIncrease = futureCost - currentCost;

        resultCurrentCost.textContent = `₹${currentCost.toLocaleString('en-IN')}`;
        resultCostIncrease.textContent = `₹${costIncrease.toLocaleString('en-IN')}`;
        resultFutureCost.textContent = `₹${futureCost.toLocaleString('en-IN')}`;

        updateChart(currentCost, costIncrease);
    }

    function updateChart(currentCost, costIncrease) {
        const ctx = document.getElementById('inflationChart').getContext('2d');
        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [currentCost, costIncrease],
                    backgroundColor: ['#e6f3ff', '#4a90e2'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            generateLabels: function(chart) {
                                return [
                                    { text: 'Current Cost', fillStyle: '#e6f3ff' },
                                    { text: 'Total Inflation', fillStyle: '#4a90e2' }
                                ];
                            }
                        }
                    }
                }
            }
        });
    }

    [currentCostInput, inflationRateInput, timePeriodInput].forEach(input => {
        input.addEventListener('input', calculateInflation);
        input.addEventListener('touchmove', calculateInflation); // Touch support
    });

    // Initial calculation
    calculateInflation();
});