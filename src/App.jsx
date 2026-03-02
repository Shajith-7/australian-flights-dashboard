import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './App.css';

// Import the pre-aggregated JSON data
import flightData from './data.json';

const COLORS = ['#38bdf8', '#c084fc', '#4ade80', '#fb923c', '#e879f9', '#2dd4bf', '#facc15'];

const renderTooltip = (props) => {
  const { active, payload, label } = props;
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-title">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="tooltip-item" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function App() {
  const { months, data } = flightData;

  const [startMonth, setStartMonth] = useState(months[0]);
  const [endMonth, setEndMonth] = useState(months[months.length - 1]);

  const aggregated = useMemo(() => {
    let totalFlights = 0;
    const airlinesMap = {};
    const citiesMap = {};
    const regionsMap = {};
    const inOutMap = { I: 0, O: 0 };
    const trends = [];

    // Safety check if start > end
    let actualStart = startMonth;
    let actualEnd = endMonth;
    if (months.indexOf(startMonth) > months.indexOf(endMonth)) {
      actualStart = endMonth;
      actualEnd = startMonth;
    }

    let inRange = false;
    for (const m of months) {
      if (m === actualStart) inRange = true;
      if (inRange) {
        const d = data[m];
        if (d) {
          totalFlights += d.flights;

          Object.entries(d.airlines).forEach(([k, v]) => {
            airlinesMap[k] = (airlinesMap[k] || 0) + v;
          });
          Object.entries(d.cities).forEach(([k, v]) => {
            citiesMap[k] = (citiesMap[k] || 0) + v;
          });
          Object.entries(d.regions).forEach(([k, v]) => {
            regionsMap[k] = (regionsMap[k] || 0) + v;
          });
          inOutMap.I += d.inOut.I || 0;
          inOutMap.O += d.inOut.O || 0;

          trends.push({
            monthYear: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            flights: d.flights
          });
        }
      }
      if (m === actualEnd) break;
    }

    const airlinesArr = Object.entries(airlinesMap).map(([name, flights]) => ({ name, flights })).sort((a, b) => b.flights - a.flights).slice(0, 10);
    const citiesArr = Object.entries(citiesMap).map(([name, flights]) => ({ name, flights })).sort((a, b) => b.flights - a.flights).slice(0, 10);
    const regionsArr = Object.entries(regionsMap).map(([name, flights]) => ({ name, flights })).sort((a, b) => b.flights - a.flights).slice(0, 5);

    return {
      trends,
      airlines: airlinesArr,
      cities: citiesArr,
      regions: regionsArr,
      totalFlights,
      activeCities: Object.keys(citiesMap).length,
      inOut: [
        { name: 'Inbound (I)', value: inOutMap.I },
        { name: 'Outbound (O)', value: inOutMap.O }
      ]
    };
  }, [months, data, startMonth, endMonth]);

  return (
    <div className="dashboard-container">
      <header className="header animated delay-1">
        <div className="header-title-container">
          <h1>Australian Flights Explorer</h1>
          <p>Interactive analytics dashboard with dynamic date range filtering</p>
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label>Start Month:</label>
            <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>End Month:</label>
            <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="kpi-grid animated delay-2">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue-icon">
            ✈️
          </div>
          <div className="kpi-content">
            <h3>Filtered Total Flights</h3>
            <div className="kpi-value">{aggregated.totalFlights.toLocaleString()}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper purple-icon">
            📈
          </div>
          <div className="kpi-content">
            <h3>Top Airline Flights</h3>
            <div className="kpi-value">
              {aggregated.airlines.length > 0 ? aggregated.airlines[0].flights.toLocaleString() : 0}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper green-icon">
            🗺️
          </div>
          <div className="kpi-content">
            <h3>Active Routes/Cities</h3>
            <div className="kpi-value">{aggregated.activeCities}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid animated delay-3">
        {/* Trends over Time (Line Chart) */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>📊 Flights Trend Over Filtered Period</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregated.trends} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlights" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="monthYear"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  tickMargin={10}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={renderTooltip} />
                <Area
                  type="monotone"
                  dataKey="flights"
                  name="Flights"
                  stroke="var(--accent-blue)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorFlights)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Airlines (Bar Chart) */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>🏢 Top Airlines by Volume</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregated.airlines} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
                <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="flights" name="Flights" radius={[0, 4, 4, 0]}>
                  {aggregated.airlines.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h2>🌍 Top Flight Regions</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregated.regions} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={110} tick={{ fontSize: 11 }} />
                <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="flights" name="Flights" radius={[0, 4, 4, 0]}>
                  {aggregated.regions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Cities (Bar Chart) */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h2>🌆 Busiest Australian Cities</h2>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregated.cities} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickMargin={10} />
                <YAxis stroke="#94a3b8" tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip content={renderTooltip} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="flights" name="Flights" radius={[4, 4, 0, 0]}>
                  {aggregated.cities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inbound vs Outbound (Pie Chart) */}
        <div className="chart-card full-width" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-header">
            <h2>🥧 Inbound vs Outbound Distribution</h2>
          </div>
          <div className="chart-wrapper pie-chart-wrapper" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aggregated.inOut}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {aggregated.inOut.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-blue)' : 'var(--accent-purple)'} />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
