const initialDeposit = 20000;
const dailyYield = 10;
const dailyTokenIncome = 45;
const annualPriceAppreciations = [0, 0.25, 0.50, 0.75, 1.00]; // 0%, 25%, 50%, 75%, 100%

const totalInitial = initialDeposit;
const dailyAddition = dailyYield + dailyTokenIncome;
const annualInterestRate = 365 * (dailyYield / initialDeposit);
const compoundingFrequency = 365;

function calculateCompoundInterest(principal, dailyAddition, annualRate, frequency, years) {
    const ratePerPeriod = annualRate / frequency;
    const periods = frequency * years;
    const compoundInterest = principal * Math.pow((1 + ratePerPeriod), periods);
    const additionalInterest = dailyAddition * (Math.pow((1 + ratePerPeriod), periods) - 1) * (frequency / annualRate);

    return compoundInterest + additionalInterest;
}

function calculateAppreciatedAmount(amount, annualAppreciationRate, years) {
    return amount * Math.pow(1 + annualAppreciationRate, years);
}

// Prepare results for each appreciation rate
const results = [];
annualPriceAppreciations.forEach(appreciationRate => {
    const appreciationResults = [];

    // Add current day (t = 0)
    const currentDayAmount = totalInitial;
    const currentDayAppreciatedAmount = calculateAppreciatedAmount(currentDayAmount, appreciationRate, 0);
    appreciationResults.push({
        year: 0,
        appreciatedAmount: currentDayAppreciatedAmount.toFixed(2)
    });

    // Add data for years 1 to 3
    for (let t = 1; t <= 3; t++) {
        const amount = calculateCompoundInterest(totalInitial, dailyAddition, annualInterestRate, compoundingFrequency, t);
        const appreciatedAmount = calculateAppreciatedAmount(amount, appreciationRate, t);

        appreciationResults.push({
            year: t,
            appreciatedAmount: appreciatedAmount.toFixed(2)
        });
    }
    results.push({
        appreciationRate: appreciationRate,
        data: appreciationResults
    });
});

// Data for Chart.js
const labels = ['Current Day', 'Year 1', 'Year 2', 'Year 3'];
const datasets = annualPriceAppreciations.map((rate, index) => ({
    label: `${(rate * 100).toFixed(0)}% Appreciation`,
    data: results[index].data.map(result => parseFloat(result.appreciatedAmount)),
    borderColor: `hsl(${(index * 360 / annualPriceAppreciations.length)}, 70%, 50%)`, // Different color for each line
    borderWidth: 2,
    fill: false
}));

// Create the chart
const ctx = document.getElementById('incomeChart').getContext('2d');
const incomeChart = new Chart(ctx, {
    type: 'line', // or 'bar', 'pie', etc.
    data: {
        labels: labels,
        datasets: datasets
    },
    options: {
        responsive: true,
        scales: {
            x: {
                beginAtZero: true
            },
            y: {
                beginAtZero: true
            }
        }
    }
});
