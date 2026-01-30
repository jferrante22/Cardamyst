import openpyxl
from collections import defaultdict
import json

# Load the Coverage Tracker to get coverage definitions
tracker_file = '/home/user/Cardamyst/Cardamyst_Coverage_Tracker Jan 2026.xlsx'
tracker_wb = openpyxl.load_workbook(tracker_file, data_only=True)
defs_ws = tracker_wb['Definitions']

# Extract coverage rules from Definitions sheet
coverage_rules = {}
print("="*80)
print("LOADING COVERAGE DEFINITIONS")
print("="*80)
for row in defs_ws.iter_rows(min_row=11, values_only=True):
    if row[0] and row[0] != 'Status':
        status = row[0]
        counted = str(row[1]).strip().lower() if row[1] else ''
        should_count = counted == 'yes'
        coverage_rules[status] = should_count
        print(f"{status}: {'COUNTED' if should_count else 'EXCLUDED'}")

tracker_wb.close()
print()

# Function to check if a status should be counted
def should_count_as_covered(formulary_status):
    """
    Check if a formulary status should be counted as covered.
    Returns: (should_count: bool, matched_rule: str or None)
    """
    if not formulary_status or formulary_status == '':
        return False, None

    # Check exact matches first
    if formulary_status in coverage_rules:
        return coverage_rules[formulary_status], formulary_status

    # Check partial matches (for cases where status might have extra spaces)
    status_clean = formulary_status.strip()
    for rule_status, should_count in coverage_rules.items():
        if status_clean.startswith(rule_status):
            return should_count, rule_status

    # Unknown status - return False and the status for prompting
    return False, None

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

# Track unknown statuses for user review
unknown_statuses = {}
excluded_lives = {'commercial': 0, 'medicare': 0, 'medicaid': 0}

print("="*80)
print("PROCESSING JANUARY FINGERTIP DATA")
print("="*80)
print()

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

    # Check if this should be counted based on definitions
    is_covered, matched_rule = should_count_as_covered(formulary_status)

    # Track unknown statuses
    if not is_covered and matched_rule is None and formulary_status and formulary_status != '':
        if formulary_status not in unknown_statuses:
            unknown_statuses[formulary_status] = {
                'count': 0,
                'total_lives': 0,
                'example_plan': plan_name
            }
        unknown_statuses[formulary_status]['count'] += 1
        unknown_statuses[formulary_status]['total_lives'] += pharmacy_lives

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
        else:
            # Track excluded lives
            excluded_lives[channel_key] += pharmacy_lives

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

# Report unknown statuses to user
if unknown_statuses:
    print("⚠️  UNKNOWN COVERAGE STATUSES FOUND")
    print("="*80)
    print("The following statuses were found that are not in the Definitions sheet:")
    print()
    for status, info in sorted(unknown_statuses.items(), key=lambda x: x[1]['total_lives'], reverse=True):
        print(f"Status: {status}")
        print(f"  Plans: {info['count']}")
        print(f"  Total Lives: {info['total_lives']:,.0f}")
        print(f"  Example Plan: {info['example_plan']}")
        print(f"  ACTION REQUIRED: Should this be counted as COVERED? (Add to Definitions sheet)")
        print()
    print("="*80)
    print()

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
print("JANUARY FINGERTIP DATA SUMMARY (CORRECTED)")
print("="*80)
print()
print(f"COMMERCIAL:")
print(f"  Total Lives: {data_by_channel['commercial']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['commercial']['covered_lives']:,.0f}")
print(f"  Excluded Lives (NC/N/A): {excluded_lives['commercial']:,.0f}")
print(f"  Coverage %: {data_by_channel['commercial']['coverage_percent']:.2f}%")
print(f"  Plans with Coverage: {len(data_by_channel['commercial']['plans'])}")
print()
print(f"FEDERAL PROGRAMS (subset of Commercial):")
print(f"  Total Lives: {data_by_channel['federal_programs']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['federal_programs']['covered_lives']:,.0f}")
print(f"  Coverage %: {data_by_channel['federal_programs']['coverage_percent']:.2f}%")
print(f"  Plans with Coverage: {len(data_by_channel['federal_programs']['plans'])}")
print()
print(f"MEDICARE:")
print(f"  Total Lives: {data_by_channel['medicare']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['medicare']['covered_lives']:,.0f}")
print(f"  Excluded Lives (NC/N/A): {excluded_lives['medicare']:,.0f}")
print(f"  Coverage %: {data_by_channel['medicare']['coverage_percent']:.2f}%")
print(f"  Plans with Coverage: {len(data_by_channel['medicare']['plans'])}")
print()
print(f"MEDICAID:")
print(f"  Total Lives: {data_by_channel['medicaid']['total_lives']:,.0f}")
print(f"  Covered Lives: {data_by_channel['medicaid']['covered_lives']:,.0f}")
print(f"  Excluded Lives (NC/N/A): {excluded_lives['medicaid']:,.0f}")
print(f"  Coverage %: {data_by_channel['medicaid']['coverage_percent']:.2f}%")
print(f"  Plans with Coverage: {len(data_by_channel['medicaid']['plans'])}")
print()
print(f"TOTAL:")
print(f"  Total Lives: {total_lives:,.0f}")
print(f"  Covered Lives: {total_covered:,.0f}")
print(f"  Excluded Lives (NC/N/A): {sum(excluded_lives.values()):,.0f}")
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
output_data = {
    'report_date': 'January 2026',
    'data_source': 'January Fingertip 01.30.xlsx',
    'processing_note': 'Coverage rules applied from Definitions sheet - only T3/T4 counted',
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
    } for plan in all_plans],
    'unknown_statuses': unknown_statuses
}

with open('/home/user/Cardamyst/fingertip_processed_data.json', 'w') as f:
    json.dump(output_data, f, indent=2)

print("Data saved to: fingertip_processed_data.json")
print()

if unknown_statuses:
    print("⚠️  IMPORTANT: Review unknown statuses above and update Definitions sheet")
    print("    Then re-run this script to get accurate counts.")
