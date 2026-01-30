import openpyxl
from collections import defaultdict

# Load the January Fingertip file
fingertip_file = '/home/user/Cardamyst/January Fingertip 01.30.xlsx'
wb = openpyxl.load_workbook(fingertip_file, data_only=True)
ws = wb['Pharmacy']

# Channel mapping
channel_map = {
    'Commercial': 'commercial',
    'Medicare': 'medicare',
    'Medicaid': 'medicaid'
}

# Initialize data structure
data_by_channel = {
    'commercial': {'total_lives': 0, 'covered_lives': 0, 'plans': []},
    'medicare': {'total_lives': 0, 'covered_lives': 0, 'plans': []},
    'medicaid': {'total_lives': 0, 'covered_lives': 0, 'plans': []},
    'federal_programs': {'total_lives': 0, 'covered_lives': 0, 'plans': []}
}

# Process each row (starting from row 15, which is the first data row)
for row in ws.iter_rows(min_row=15, values_only=True):
    if not row[1]:  # Skip if no Parent Name
        continue

    plan_name = row[4] if row[4] else ''
    plan_type = row[5] if row[5] else ''
    channel = row[6] if row[6] else ''
    pharmacy_lives = row[13] if row[13] else 0
    tier_status = row[14] if row[14] else 'N/A'
    formulary_status = row[18] if row[18] else ''
    payer_name = row[2] if row[2] else ''

    # Determine if covered (not N/A)
    is_covered = tier_status != 'N/A' and tier_status != ''

    # Map to our channel structure
    if channel in channel_map:
        channel_key = channel_map[channel]
        data_by_channel[channel_key]['total_lives'] += pharmacy_lives

        if is_covered:
            data_by_channel[channel_key]['covered_lives'] += pharmacy_lives
            data_by_channel[channel_key]['plans'].append({
                'name': plan_name,
                'type': plan_type,
                'payer': payer_name,
                'lives': pharmacy_lives,
                'status': formulary_status.strip()
            })

    # Track Federal Programs separately (subset of Commercial)
    if plan_type == 'Fed Prog':
        data_by_channel['federal_programs']['total_lives'] += pharmacy_lives
        if is_covered:
            data_by_channel['federal_programs']['covered_lives'] += pharmacy_lives
            data_by_channel['federal_programs']['plans'].append({
                'name': plan_name,
                'type': plan_type,
                'payer': payer_name,
                'lives': pharmacy_lives,
                'status': formulary_status.strip()
            })

wb.close()

# Sort plans by lives (descending) for each channel
for channel in data_by_channel.values():
    channel['plans'] = sorted(channel['plans'], key=lambda x: x['lives'], reverse=True)

# Calculate percentages
for channel_key in ['commercial', 'medicare', 'medicaid']:
    channel = data_by_channel[channel_key]
    if channel['total_lives'] > 0:
        channel['coverage_percent'] = (channel['covered_lives'] / channel['total_lives']) * 100
    else:
        channel['coverage_percent'] = 0

if data_by_channel['federal_programs']['total_lives'] > 0:
    data_by_channel['federal_programs']['coverage_percent'] = (
        data_by_channel['federal_programs']['covered_lives'] /
        data_by_channel['federal_programs']['total_lives']
    ) * 100
else:
    data_by_channel['federal_programs']['coverage_percent'] = 0

# Calculate total
total_lives = sum(data_by_channel[k]['total_lives'] for k in ['commercial', 'medicare', 'medicaid'])
total_covered = sum(data_by_channel[k]['covered_lives'] for k in ['commercial', 'medicare', 'medicaid'])
total_coverage_percent = (total_covered / total_lives * 100) if total_lives > 0 else 0

# Print summary
print("="*80)
print("JANUARY FINGERTIP DATA SUMMARY")
print("="*80)
print()
print(f"COMMERCIAL:")
print(f"  Total Lives: {data_by_channel['commercial']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['commercial']['covered_lives']:,.0f}")
print(f"  Coverage %: {data_by_channel['commercial']['coverage_percent']:.2f}%")
print(f"  Number of Plans with Coverage: {len(data_by_channel['commercial']['plans'])}")
print()
print(f"FEDERAL PROGRAMS (subset of Commercial):")
print(f"  Total Lives: {data_by_channel['federal_programs']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['federal_programs']['covered_lives']:,.0f}")
print(f"  Coverage %: {data_by_channel['federal_programs']['coverage_percent']:.2f}%")
print(f"  Number of Plans with Coverage: {len(data_by_channel['federal_programs']['plans'])}")
print()
print(f"MEDICARE:")
print(f"  Total Lives: {data_by_channel['medicare']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['medicare']['covered_lives']:,.0f}")
print(f"  Coverage %: {data_by_channel['medicare']['coverage_percent']:.2f}%")
print(f"  Number of Plans with Coverage: {len(data_by_channel['medicare']['plans'])}")
print()
print(f"MEDICAID:")
print(f"  Total Lives: {data_by_channel['medicaid']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['medicaid']['covered_lives']:,.0f}")
print(f"  Coverage %: {data_by_channel['medicaid']['coverage_percent']:.2f}%")
print(f"  Number of Plans with Coverage: {len(data_by_channel['medicaid']['plans'])}")
print()
print(f"TOTAL:")
print(f"  Total Lives: {total_lives:,.0f}")
print(f"  Covered Lives: {total_covered:,.0f}")
print(f"  Coverage %: {total_coverage_percent:.2f}%")
print()
print("="*80)
print("TOP 10 PLANS BY COVERED LIVES (ALL CHANNELS)")
print("="*80)

# Combine all plans and get top 10
all_plans = (data_by_channel['commercial']['plans'] +
             data_by_channel['medicare']['plans'] +
             data_by_channel['medicaid']['plans'])
all_plans = sorted(all_plans, key=lambda x: x['lives'], reverse=True)[:10]

for i, plan in enumerate(all_plans, 1):
    print(f"{i}. {plan['name']}")
    print(f"   Type: {plan['type']}, Lives: {plan['lives']:,.0f}, Status: {plan['status']}")
    print()

# Save data for use in other scripts
import json

output_data = {
    'report_date': 'January 2026',
    'data_source': 'January Fingertip 01.30.xlsx',
    'coverage_snapshot': {
        'commercial': {
            'total_lives': int(data_by_channel['commercial']['total_lives']),
            'covered_lives': int(data_by_channel['commercial']['covered_lives']),
            'coverage_percent': round(data_by_channel['commercial']['coverage_percent'], 2),
            'notes': 'Employer, PBM, HIX, FEHBP, VA, TRICARE'
        },
        'federal_programs': {
            'total_lives': int(data_by_channel['federal_programs']['total_lives']),
            'covered_lives': int(data_by_channel['federal_programs']['covered_lives']),
            'coverage_percent': round(data_by_channel['federal_programs']['coverage_percent'], 2),
            'notes': 'TRICARE, VA (subset of Commercial)'
        },
        'medicare': {
            'total_lives': int(data_by_channel['medicare']['total_lives']),
            'covered_lives': int(data_by_channel['medicare']['covered_lives']),
            'coverage_percent': round(data_by_channel['medicare']['coverage_percent'], 2),
            'notes': 'Part D, MA, SNP, EGWP, PACE'
        },
        'medicaid': {
            'total_lives': int(data_by_channel['medicaid']['total_lives']),
            'covered_lives': int(data_by_channel['medicaid']['covered_lives']),
            'coverage_percent': round(data_by_channel['medicaid']['coverage_percent'], 2),
            'notes': 'State, Managed, CHIP'
        },
        'total': {
            'total_lives': int(total_lives),
            'covered_lives': int(total_covered),
            'coverage_percent': round(total_coverage_percent, 2)
        }
    },
    'top_plans': [{
        'name': plan['name'],
        'type': plan['type'],
        'covered_lives': int(plan['lives']),
        'status': plan['status']
    } for plan in all_plans]
}

with open('/home/user/Cardamyst/fingertip_processed_data.json', 'w') as f:
    json.dump(output_data, f, indent=2)

print("Data saved to: fingertip_processed_data.json")
