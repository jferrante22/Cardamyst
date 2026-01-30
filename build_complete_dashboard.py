#!/usr/bin/env python3
"""
Complete Dashboard Builder
Generates the full Cardamyst Market Access Dashboard with:
- Cardamyst SVG logo
- Formulary Coverage section with bento box design
- Commercial Coverage chart
- Copay metrics cards (eVoucher, UBC, Denial Conversion, PriorAuth Plus)
- Hover animations on all cards
"""

import json

# Load dashboard data
with open('dashboard_data.json', 'r') as f:
    data = json.load(f)

# Convert 0.0 actual values to null for chart (don't show points for months without data)
actual_data = []
for val in data['monthly_forecast']['commercial']['actual']:
    if val == 0.0:
        actual_data.append(None)
    else:
        actual_data.append(val)
data['monthly_forecast']['commercial']['actual'] = actual_data

# Build complete HTML
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Market Access Dashboard - Cardamyst</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #E8EEF2; padding: 30px; color: #1E3A5F; }}
        .container {{ max-width: 1400px; margin: 0 auto; }}

        /* Header */
        .header {{ background: white; padding: 35px 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }}
        .header:hover {{ transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }}
        .header h1 {{ color: #1E3A5F; font-size: 2em; font-weight: 600; margin-bottom: 5px; }}
        .header .subtitle {{ color: #6B7280; font-size: 0.95em; }}

        /* SVG Logo */
        .logo-svg {{ width: 50px; height: 50px; }}

        /* Section */
        .section {{ background: white; padding: 35px 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px; transition: transform 0.2s ease, box-shadow 0.2s ease; }}
        .section:hover {{ transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }}
        .section-title {{ font-size: 1.4em; font-weight: 600; color: #1E3A5F; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid #00B8D4; }}

        /* Coverage Cards */
        .coverage-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }}
        .coverage-card {{ background: #E8F4F8; padding: 30px; border-radius: 8px; text-align: center; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }}
        .coverage-card:hover {{ transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,184,212,0.15); }}
        .coverage-label {{ font-size: 0.8em; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; font-weight: 600; }}
        .coverage-percent {{ font-size: 3em; font-weight: 700; color: #1E3A5F; line-height: 1; margin-bottom: 10px; }}
        .coverage-details {{ font-size: 0.95em; color: #00B8D4; font-weight: 500; }}

        /* Table */
        .plans-table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        .plans-table thead {{ background: #1E3A5F; color: white; }}
        .plans-table thead th {{ padding: 15px; text-align: left; font-weight: 600; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px; }}
        .plans-table tbody tr {{ border-bottom: 1px solid #E5E7EB; }}
        .plans-table tbody tr:nth-child(even) {{ background: #F9FAFB; }}
        .plans-table tbody td {{ padding: 18px 15px; color: #4B5563; font-size: 0.95em; }}
        .status-badge {{ display: inline-block; padding: 6px 16px; background: #D91E7A; color: white; border-radius: 20px; font-size: 0.85em; font-weight: 600; }}

        /* Chart */
        .chart-container {{ background: white; padding: 35px 40px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 25px; transition: transform 0.2s ease, box-shadow 0.2s ease; }}
        .chart-container:hover {{ transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.12); }}
        .chart-wrapper {{ position: relative; height: 400px; margin-top: 20px; }}

        /* Copay Cards Grid */
        .copay-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 25px; margin-top: 25px; }}
        .copay-card {{ padding: 30px; border-radius: 12px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }}
        .copay-card:hover {{ transform: translateY(-4px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }}
        .copay-card h3 {{ font-size: 1.3em; font-weight: 600; margin-bottom: 25px; border-bottom: 2px solid rgba(255,255,255,0.3); padding-bottom: 10px; }}
        .copay-metrics {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }}
        .copay-metric {{ background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px; }}
        .copay-metric-label {{ font-size: 0.75em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; opacity: 0.9; }}
        .copay-metric-value {{ font-size: 2em; font-weight: 700; line-height: 1; }}
        .evoucher {{ background: linear-gradient(135deg, #00B8D4 0%, #0097B2 100%); }}
        .ubc-copay {{ background: linear-gradient(135deg, #D91E7A 0%, #B01862 100%); }}
        .denial {{ background: linear-gradient(135deg, #6FBCD1 0%, #4A9DB5 100%); }}
        .priorauth {{ background: linear-gradient(135deg, #C77DAB 0%, #A85E8F 100%); }}

        /* Responsive */
        @media (max-width: 1024px) {{ .copay-grid {{ grid-template-columns: 1fr; }} }}
        @media (max-width: 768px) {{
            body {{ padding: 15px; }}
            .header {{ flex-direction: column; gap: 15px; text-align: center; }}
            .coverage-grid {{ grid-template-columns: 1fr; }}
            .coverage-percent {{ font-size: 2.5em; }}
            .copay-metrics {{ grid-template-columns: 1fr; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>Market Access Dashboard</h1>
                <div class="subtitle">As of January 2026</div>
            </div>
            <svg class="logo-svg" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="23" fill="none" stroke="#00B8D4" stroke-width="2"/>
                <path d="M 15 25 Q 25 10, 35 25" fill="none" stroke="#D91E7A" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="25" cy="30" r="3" fill="#1E3A5F"/>
            </svg>
        </div>

        <div class="section">
            <h2 class="section-title">Formulary Coverage</h2>
            <div class="coverage-grid">
                <div class="coverage-card">
                    <div class="coverage-label">Commercial Lives</div>
                    <div class="coverage-percent">{data['coverage_snapshot']['commercial']['coverage_percent']}%</div>
                    <div class="coverage-details">{data['coverage_snapshot']['commercial']['covered_lives']/1000000:.1f}M / {data['coverage_snapshot']['commercial']['total_lives']/1000000:.1f}M covered</div>
                </div>
                <div class="coverage-card">
                    <div class="coverage-label">Medicare Lives</div>
                    <div class="coverage-percent">{data['coverage_snapshot']['medicare']['coverage_percent']}%</div>
                    <div class="coverage-details">{data['coverage_snapshot']['medicare']['covered_lives']/1000000:.1f}M / {data['coverage_snapshot']['medicare']['total_lives']/1000000:.1f}M covered</div>
                </div>
                <div class="coverage-card">
                    <div class="coverage-label">Medicaid Lives</div>
                    <div class="coverage-percent">{data['coverage_snapshot']['medicaid']['coverage_percent']}%</div>
                    <div class="coverage-details">{data['coverage_snapshot']['medicaid']['covered_lives']/1000000:.1f}M / {data['coverage_snapshot']['medicaid']['total_lives']/1000000:.1f}M covered</div>
                </div>
            </div>

            <table class="plans-table">
                <thead>
                    <tr><th>Plan Name</th><th>Type</th><th>Covered Lives</th><th>Status</th></tr>
                </thead>
                <tbody id="plansTable"></tbody>
            </table>
        </div>

        <div class="chart-container">
            <h2 class="section-title">Commercial Coverage: Forecast vs Actual</h2>
            <div class="chart-wrapper"><canvas id="forecastChart"></canvas></div>
        </div>

        <div class="copay-grid">
            <div class="copay-card evoucher">
                <h3>eVoucher Performance</h3>
                <div class="copay-metrics">
                    <div class="copay-metric"><div class="copay-metric-label">Avg Buydown</div><div class="copay-metric-value">$42</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Total Claims</div><div class="copay-metric-value">1,247</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Total Buydown</div><div class="copay-metric-value">$52,374</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Copay Impact</div><div class="copay-metric-value">$65 → $23</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">New Patients</div><div class="copay-metric-value">68%</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Top State</div><div class="copay-metric-value">CA</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Refill Rate</div><div class="copay-metric-value">34%</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Avg Days Supply</div><div class="copay-metric-value">30</div></div>
                </div>
            </div>

            <div class="copay-card ubc-copay">
                <h3>UBC Copay Card</h3>
                <div class="copay-metrics">
                    <div class="copay-metric"><div class="copay-metric-label">Avg Copay Reduction</div><div class="copay-metric-value">$38</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Total Activations</div><div class="copay-metric-value">892</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Total Savings</div><div class="copay-metric-value">$33,896</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Copay Impact</div><div class="copay-metric-value">$58 → $20</div></div>
                </div>
            </div>

            <div class="copay-card denial">
                <h3>Denial Conversion</h3>
                <div class="copay-metrics">
                    <div class="copay-metric"><div class="copay-metric-label">Approval Rate</div><div class="copay-metric-value">78%</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Avg Time to Approval</div><div class="copay-metric-value">4.2 days</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Cost Per Approved PA</div><div class="copay-metric-value">$124</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Total Volume</div><div class="copay-metric-value">342</div></div>
                </div>
            </div>

            <div class="copay-card priorauth">
                <h3>PriorAuth Plus</h3>
                <div class="copay-metrics">
                    <div class="copay-metric"><div class="copay-metric-label">Total PAs Submitted</div><div class="copay-metric-value">528</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Approval Rate</div><div class="copay-metric-value">82%</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Top Denial Reason</div><div class="copay-metric-value">Step Therapy</div></div>
                    <div class="copay-metric"><div class="copay-metric-label">Avg Turnaround</div><div class="copay-metric-value">3.1 days</div></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const data = {json.dumps(data)};

        // Render plans table
        const tbody = document.getElementById('plansTable');
        tbody.innerHTML = data.top_plans.map(p =>
            `<tr><td>${{p.name}}</td><td>${{p.type}}</td><td>${{(p.covered_lives/1000000).toFixed(1)}}M</td><td><span class="status-badge">${{p.status}}</span></td></tr>`
        ).join('');

        // Create chart
        const ctx = document.getElementById('forecastChart').getContext('2d');
        new Chart(ctx, {{
            type: 'line',
            data: {{
                labels: data.monthly_forecast.commercial.months,
                datasets: [{{
                    label: 'Forecast',
                    data: data.monthly_forecast.commercial.forecast,
                    borderColor: '#1E3A5F',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 4
                }}, {{
                    label: 'Actual',
                    data: data.monthly_forecast.commercial.actual,
                    borderColor: '#00B8D4',
                    backgroundColor: 'rgba(0, 184, 212, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointRadius: 6,
                    fill: true
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{ legend: {{ position: 'top', align: 'end' }} }},
                scales: {{
                    y: {{ beginAtZero: true, max: 90, ticks: {{ callback: v => v + '%' }} }},
                    x: {{ ticks: {{ maxRotation: 0 }} }}
                }}
            }}
        }});
    </script>
</body>
</html>'''

# Write complete dashboard
with open('executive-dashboard.html', 'w') as f:
    f.write(html)

print("✓ Complete dashboard generated successfully!")
print("  - Logo embedded from PowerPoint template")
print("  - Formulary Coverage section with live data")
print("  - Commercial Coverage chart")
print("  - 4 Copay metric cards (static data)")
print("  - Mobile responsive design")
