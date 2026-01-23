#!/usr/bin/env python3
"""
Generate PowerPoint presentation from Cardamyst dashboard data
Uses the branded template
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor as RgbColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from copy import deepcopy
import os

# Dashboard data
COVERAGE_DATA = {
    'reportDate': 'January 20, 2026',
    'total': {'coverage': 3.7, 'totalLives': 186_600_000, 'coveredLives': 6_816_075},
    'commercial': {'coverage': 3.7, 'totalLives': 186_600_000, 'coveredLives': 6_816_075},
    'medicare': {'coverage': 0.0, 'totalLives': 51_000_000, 'coveredLives': 0},
    'medicaid': {'coverage': 0.0, 'totalLives': 92_000_000, 'coveredLives': 0},
    'plans': 31,
    'segments': [
        {'name': 'Commercial (incl. Federal)', 'totalLives': 186_600_000, 'coveredLives': 6_816_075, 'coverage': 3.65},
        {'name': 'Medicare', 'totalLives': 51_000_000, 'coveredLives': 0, 'coverage': 0.0},
        {'name': 'Medicaid', 'totalLives': 92_000_000, 'coveredLives': 0, 'coverage': 0.0},
    ],
    'topPlans': [
        {'name': 'TRICARE Uniform Formulary', 'lives': 5_749_433, 'type': 'Fed Prog'},
        {'name': 'CHI Franciscan', 'lives': 217_484, 'type': 'Employer'},
        {'name': 'MGM Resorts International', 'lives': 183_545, 'type': 'Employer'},
        {'name': 'General Electric', 'lives': 118_127, 'type': 'Employer'},
        {'name': 'Apple', 'lives': 106_071, 'type': 'Employer'},
    ]
}

CONTRACT_DATA = {
    'summary': {'total': 8, 'signed': 3, 'submitted': 4, 'countered': 1},
    'contracts': [
        {'payer': 'CVS Caremark', 'segment': 'Medicare Part D', 'period': '2027', 'base': 5.0, 'admin': 4.0, 'data': 1.5, 'total': 10.5, 'priceCap': 4.0, 'status': 'Submitted'},
        {'payer': 'Express Scripts', 'segment': 'Medicare Part D', 'period': '2026-2027', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': 5.0, 'status': 'Signed'},
        {'payer': 'OptumRx', 'segment': 'Medicare Part D', 'period': '2026', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': 5.0, 'status': 'Submitted'},
        {'payer': 'Humana', 'segment': 'Medicare Part D', 'period': '2027', 'base': 15.0, 'admin': 0.0, 'data': 0.0, 'total': 15.0, 'priceCap': 5.0, 'status': 'Submitted'},
        {'payer': 'Express Scripts', 'segment': 'Government', 'period': '2026-2027', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': None, 'status': 'Signed'},
        {'payer': 'Ascent Health', 'segment': 'Commercial', 'period': '2026-2027', 'base': 4.0, 'admin': 3.0, 'data': 2.5, 'total': 9.5, 'priceCap': 4.0, 'status': 'Signed'},
        {'payer': 'Emisar', 'segment': 'Commercial', 'period': '2026-2027', 'base': 10.0, 'admin': 5.0, 'data': 0.0, 'total': 15.0, 'priceCap': 5.0, 'status': 'Counter Submitted'},
        {'payer': 'Zinc Health', 'segment': 'Commercial', 'period': '2026-2027', 'base': 4.5, 'admin': 4.0, 'data': 1.5, 'total': 10.0, 'priceCap': 5.0, 'status': 'Submitted'},
    ]
}

# Brand colors from template
COLORS = {
    'primary': RgbColor(0, 178, 227),      # Cyan
    'secondary': RgbColor(13, 122, 181),   # Blue
    'accent': RgbColor(227, 29, 147),      # Pink
    'dark': RgbColor(23, 40, 82),          # Navy
    'gray': RgbColor(84, 87, 94),          # Dark gray
    'light': RgbColor(220, 238, 244),      # Light blue
    'white': RgbColor(255, 255, 255),
    'green': RgbColor(16, 185, 129),       # Success green
}

def format_number(num):
    """Format number with M/K suffix"""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.0f}K"
    return str(num)

def format_full_number(num):
    """Format number with commas"""
    return f"{num:,}"

def add_text_box(slide, left, top, width, height, text, font_size=12, bold=False, color=None, align=PP_ALIGN.LEFT):
    """Add a text box to a slide"""
    shape = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = shape.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.alignment = align
    if color:
        p.font.color.rgb = color
    return shape

def add_metric_box(slide, left, top, title, value, subtitle, accent_color):
    """Add a metric box like on the dashboard"""
    # Background box
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(2.0), Inches(1.2))
    box.fill.solid()
    box.fill.fore_color.rgb = COLORS['white']
    box.line.color.rgb = RgbColor(226, 232, 240)

    # Accent bar at bottom
    accent = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(left), Inches(top + 1.1), Inches(2.0), Inches(0.1))
    accent.fill.solid()
    accent.fill.fore_color.rgb = accent_color
    accent.line.fill.background()

    # Title
    add_text_box(slide, left + 0.1, top + 0.1, 1.8, 0.3, title, font_size=10, color=COLORS['gray'])

    # Value
    add_text_box(slide, left + 0.1, top + 0.35, 1.8, 0.4, str(value), font_size=24, bold=True, color=COLORS['dark'])

    # Subtitle
    add_text_box(slide, left + 0.1, top + 0.8, 1.8, 0.3, subtitle, font_size=9, color=COLORS['gray'])

def create_table(slide, left, top, width, height, data, headers, col_widths=None):
    """Create a table on a slide"""
    rows = len(data) + 1  # +1 for header
    cols = len(headers)

    table_shape = slide.shapes.add_table(rows, cols, Inches(left), Inches(top), Inches(width), Inches(height))
    table = table_shape.table

    # Set column widths if provided
    if col_widths:
        for i, w in enumerate(col_widths):
            table.columns[i].width = Inches(w)

    # Header row
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLORS['secondary']
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = COLORS['white']

    # Data rows
    for row_idx, row_data in enumerate(data):
        for col_idx, value in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = str(value) if value is not None else '—'
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(9)
            p.font.color.rgb = COLORS['dark']
            # Alternate row colors
            if row_idx % 2 == 1:
                cell.fill.solid()
                cell.fill.fore_color.rgb = COLORS['light']

    return table_shape

def main():
    # Open the template
    prs = Presentation('CARDAMYST Branded Powerpoint Template.pptx')

    # Remove all existing slides (they're just template examples)
    while len(prs.slides) > 0:
        rId = prs.slides._sldIdLst[0].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[0]

    # Get slide layouts
    title_layout = prs.slide_layouts[0]  # 7_Title - title slide
    content_layout = prs.slide_layouts[2]  # 3_Title Only
    thank_you_layout = prs.slide_layouts[10]  # Thank You

    # ============ SLIDE 1: Title ============
    slide = prs.slides.add_slide(title_layout)
    for shape in slide.shapes:
        if shape.has_text_frame:
            if 'Title' in shape.name:
                shape.text_frame.paragraphs[0].text = "Executive Status Report"
            elif 'Subhead' in shape.name:
                shape.text_frame.paragraphs[0].text = f"Coverage & Contract Tracker | {COVERAGE_DATA['reportDate']}"

    # ============ SLIDE 2: Coverage Overview ============
    slide = prs.slides.add_slide(content_layout)
    for shape in slide.shapes:
        if shape.has_text_frame and 'Title' in shape.name.lower():
            shape.text_frame.paragraphs[0].text = "Coverage Overview"

    # Add KPI metric boxes
    metrics = [
        ("Total Coverage", f"{COVERAGE_DATA['total']['coverage']:.1f}%", f"of {format_number(COVERAGE_DATA['total']['totalLives'])} lives", COLORS['primary']),
        ("Commercial", f"{COVERAGE_DATA['commercial']['coverage']:.1f}%", f"of {format_number(COVERAGE_DATA['commercial']['totalLives'])} lives", COLORS['green']),
        ("Medicare", f"{COVERAGE_DATA['medicare']['coverage']:.1f}%", f"of {format_number(COVERAGE_DATA['medicare']['totalLives'])} lives", COLORS['secondary']),
        ("Medicaid", f"{COVERAGE_DATA['medicaid']['coverage']:.1f}%", f"of {format_number(COVERAGE_DATA['medicaid']['totalLives'])} lives", COLORS['accent']),
    ]

    for i, (title, value, subtitle, color) in enumerate(metrics):
        add_metric_box(slide, 0.5 + i * 2.3, 1.8, title, value, subtitle, color)

    # Plans metric
    add_metric_box(slide, 0.5 + 4 * 2.3, 1.8, "Plans", str(COVERAGE_DATA['plans']), "With coverage", COLORS['primary'])

    # Coverage breakdown section
    add_text_box(slide, 0.5, 3.3, 4, 0.3, "Coverage by Segment", font_size=14, bold=True, color=COLORS['dark'])

    segment_data = [
        [s['name'], format_full_number(s['totalLives']), format_full_number(s['coveredLives']), f"{s['coverage']:.1f}%"]
        for s in COVERAGE_DATA['segments']
    ]
    create_table(slide, 0.5, 3.7, 5.5, 1.2, segment_data,
                 ['Segment', 'Total Lives', 'Covered Lives', 'Coverage %'],
                 [2.0, 1.2, 1.2, 1.1])

    # Top plans section
    add_text_box(slide, 6.5, 3.3, 3, 0.3, "Top Plans by Lives", font_size=14, bold=True, color=COLORS['dark'])

    plan_data = [[p['name'][:30], format_full_number(p['lives']), p['type']] for p in COVERAGE_DATA['topPlans']]
    create_table(slide, 6.5, 3.7, 3.3, 1.5, plan_data,
                 ['Plan Name', 'Lives', 'Type'],
                 [1.6, 0.9, 0.8])

    # ============ SLIDE 3: Contract Status Overview ============
    slide = prs.slides.add_slide(content_layout)
    for shape in slide.shapes:
        if shape.has_text_frame and 'Title' in shape.name.lower():
            shape.text_frame.paragraphs[0].text = "Contract Status Overview"

    # Contract summary metrics
    contract_metrics = [
        ("Total Contracts", str(CONTRACT_DATA['summary']['total']), "Active negotiations", COLORS['primary']),
        ("Signed", str(CONTRACT_DATA['summary']['signed']), "Completed deals", COLORS['green']),
        ("Submitted", str(CONTRACT_DATA['summary']['submitted']), "Awaiting response", COLORS['secondary']),
        ("In Negotiation", str(CONTRACT_DATA['summary']['countered']), "Counter submitted", COLORS['accent']),
    ]

    for i, (title, value, subtitle, color) in enumerate(contract_metrics):
        add_metric_box(slide, 0.8 + i * 2.3, 1.8, title, value, subtitle, color)

    # Contract details table
    add_text_box(slide, 0.5, 3.3, 9, 0.3, "Contract Details", font_size=14, bold=True, color=COLORS['dark'])

    contract_table_data = [
        [c['payer'], c['segment'], c['period'], f"{c['base']:.1f}%", f"{c['admin']:.1f}%",
         f"{c['data']:.1f}%", f"{c['total']:.1f}%", f"{c['priceCap']:.1f}%" if c['priceCap'] else '—', c['status']]
        for c in CONTRACT_DATA['contracts']
    ]

    create_table(slide, 0.3, 3.7, 9.4, 2.2, contract_table_data,
                 ['Payer', 'Segment', 'Period', 'Base', 'Admin', 'Data', 'Total', 'Price Cap', 'Status'],
                 [1.3, 1.1, 0.8, 0.6, 0.6, 0.6, 0.6, 0.7, 1.0])

    # ============ SLIDE 4: Thank You ============
    slide = prs.slides.add_slide(thank_you_layout)
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                if 'Thank' in para.text:
                    para.text = "Thank You"

    # Save the presentation
    output_path = 'Cardamyst_Executive_Report.pptx'
    prs.save(output_path)
    print(f"Presentation saved to: {output_path}")
    return output_path

if __name__ == '__main__':
    main()
