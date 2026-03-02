import fs from 'fs';
import readline from 'readline';

const fileStream = fs.createReadStream('C:\\Users\\shaji\\Downloads\\archive\\australian_flights.csv');

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let isFirst = true;

const monthlyData = {};
const allMonths = new Set();

rl.on('line', (line) => {
    if (isFirst) {
        isFirst = false;
        return;
    }

    const row = line.split(',');
    if (row.length < 16) return;

    const inOut = row[2];
    const city = row[3];
    const airline = row[5];
    const region = row[8];
    const flights = parseInt(row[12], 10) || 0;
    const seats = parseInt(row[13], 10) || 0;
    const year = row[14];
    const monthNum = row[15].padStart(2, '0');

    const timeKey = `${year}-${monthNum}`;
    allMonths.add(timeKey);

    if (!monthlyData[timeKey]) {
        monthlyData[timeKey] = {
            flights: 0,
            seats: 0,
            airlines: {},
            cities: {},
            regions: {},
            inOut: { I: 0, O: 0 }
        };
    }

    const md = monthlyData[timeKey];
    md.flights += flights;
    md.seats += seats;

    if (!md.airlines[airline]) md.airlines[airline] = 0;
    md.airlines[airline] += flights;

    if (!md.cities[city]) md.cities[city] = 0;
    md.cities[city] += flights;

    if (!md.regions[region]) md.regions[region] = 0;
    md.regions[region] += flights;

    if (inOut === 'I' || inOut === 'O') {
        md.inOut[inOut] += flights;
    }
});

rl.on('close', () => {
    const sortedMonths = Array.from(allMonths).sort();

    const result = {
        months: sortedMonths,
        data: monthlyData
    };

    fs.writeFileSync('C:\\Users\\shaji\\.gemini\\antigravity\\scratch\\flight-dashboard2\\src\\data.json', JSON.stringify(result, null, 2));
    console.log('Data aggregation complete! Time chunks supported for filtering.');
});
