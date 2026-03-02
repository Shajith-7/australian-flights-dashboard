const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('C:\\Users\\shaji\\Downloads\\archive\\australian_flights.csv');

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let isFirst = true;
let headers = [];

const data = {
    trendsOverTime: {}, // year-month -> { flights, seats }
    airlines: {},
    inOut: { I: 0, O: 0 },
    cities: {},
    regions: {}
};

rl.on('line', (line) => {
    if (isFirst) {
        headers = line.split(',');
        isFirst = false;
        return;
    }

    // Basic CSV split, ignores quoted commas which might be an issue. Let's assume simple CSV.
    // Looking at the view_file earlier, there are no quoted commas in general, it's just raw values.
    const row = line.split(',');
    if (row.length < 16) return; // incomplete row

    const inOut = row[2];
    const city = row[3];
    const airline = row[5];
    const region = row[8]; // Port_Region
    const flights = parseInt(row[12], 10) || 0;
    const seats = parseInt(row[13], 10) || 0;
    const year = row[14];
    const monthNum = row[15].padStart(2, '0');

    const timeKey = `${year}-${monthNum}`;

    // Trends over time
    if (!data.trendsOverTime[timeKey]) {
        data.trendsOverTime[timeKey] = { flights: 0, seats: 0 };
    }
    data.trendsOverTime[timeKey].flights += flights;
    data.trendsOverTime[timeKey].seats += seats;

    // Airlines
    if (!data.airlines[airline]) data.airlines[airline] = 0;
    data.airlines[airline] += flights;

    // In_Out
    if (inOut === 'I' || inOut === 'O') {
        data.inOut[inOut] += flights;
    }

    // Cities
    if (!data.cities[city]) data.cities[city] = 0;
    data.cities[city] += flights;

    // Regions
    if (!data.regions[region]) data.regions[region] = 0;
    data.regions[region] += flights;
});

rl.on('close', () => {
    // Post-process to format nicely for Recharts
    const result = {
        trendsOverTime: Object.keys(data.trendsOverTime).sort().map(k => ({
            date: k,
            flights: data.trendsOverTime[k].flights,
            seats: data.trendsOverTime[k].seats
        })),
        airlines: Object.keys(data.airlines)
            .map(k => ({ name: k, flights: data.airlines[k] }))
            .sort((a, b) => b.flights - a.flights)
            .slice(0, 15), // top 15
        inOut: [
            { name: 'Inbound (I)', value: data.inOut.I },
            { name: 'Outbound (O)', value: data.inOut.O }
        ],
        cities: Object.keys(data.cities)
            .map(k => ({ name: k, flights: data.cities[k] }))
            .sort((a, b) => b.flights - a.flights)
            .slice(0, 10),
        regions: Object.keys(data.regions)
            .map(k => ({ name: k, flights: data.regions[k] }))
            .sort((a, b) => b.flights - a.flights)
            .slice(0, 10),
        summary: {
            totalFlights: Object.values(data.airlines).reduce((a, b) => a + b, 0),
            totalAirlines: Object.keys(data.airlines).length,
            totalYears: data.trendsOverTime ? Object.keys(data.trendsOverTime).length : 0
        }
    };

    fs.writeFileSync('C:\\Users\\shaji\\.gemini\\antigravity\\scratch\\flight-dashboard2\\src\\data.json', JSON.stringify(result, null, 2));
    console.log('Data aggregation complete!');
});
