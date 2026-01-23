#!/usr/bin/env python3
"""
Generate PowerPoint presentation from Cardamyst dashboard data
Uses the branded template - Clean version
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Dashboard data
COVERAGE_DATA = {
    'reportDate': 'January 2026',
    'total': {'coverage': 3.7, 'totalLives': 186_600_000, 'coveredLives': 6_816_075},
    'commercial': {'coverage': 3.7, 'totalLives': 186_600_000, 'coveredLives': 6_816_075},
    'medicare': {'coverage': 0.0, 'totalLives': 51_000_000, 'coveredLives': 0},
    'medicaid': {'coverage': 0.0, 'totalLives': 92_000_000, 'coveredLives': 0},
    'plans': 31,
}

CONTRACT_DATA = {
    'summary': {'total': 8, 'signed': 3, 'submitted': 4, 'countered': 1},
    'by_segment': {
        'Medicare Part D': [
            {'payer': 'CVS Caremark', 'period': '2027', 'base': 5.0, 'admin': 4.0, 'data': 1.5, 'total': 10.5, 'priceCap': 4.0, 'status': 'Submitted'},
            {'payer': 'Express Scripts', 'period': '2026-2027', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': 5.0, 'status': 'Signed'},
            {'payer': 'OptumRx', 'period': '2026', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': 5.0, 'status': 'Submitted'},
            {'payer': 'Humana', 'period': '2027', 'base': 15.0, 'admin': 0.0, 'data': 0.0, 'total': 15.0, 'priceCap': 5.0, 'status': 'Submitted'},
        ],
        'Government': [
            {'payer': 'Express Scripts', 'period': '2026-2027', 'base': 5.0, 'admin': 5.0, 'data': 0.0, 'total': 10.0, 'priceCap': None, 'status': 'Signed'},
        ],
        'Commercial': [
            {'payer': 'Ascent Health', 'period': '2026-2027', 'base': 4.0, 'admin': 3.0, 'data': 2.5, 'total': 9.5, 'priceCap': 4.0, 'status': 'Signed'},
            {'payer': 'Emisar', 'period': '2026-2027', 'base': 10.0, 'admin': 5.0, 'data': 0.0, 'total': 15.0, 'priceCap': 5.0, 'status': 'Counter'},
            {'payer': 'Zinc Health', 'period': '2026-2027', 'base': 4.5, 'admin': 4.0, 'data': 1.5, 'total': 10.0, 'priceCap': 5.0, 'status': 'Submitted'},
        ],
    }
}

COLORS = {
    'blue': RGBColor(0, 178, 227),
    'dark_blue': RGBColor(13, 122, 181),
    'navy': RGBColor(23, 40, 82),
    'green': RGBColor(16, 185, 129),
    'pink': RGBColor(227, 29, 147),
    'gray': RGBColor(100, 116, 139),
    'white': RGBColor(255, 255, 255),
}

def format_millions(num):
    return f"{num/1_000_000:.1f}M"

def set_cell_text(cell, text, font_size=10, bold=False, color=None, align=PP_ALIGN.LEFT):
    """Set cell text with formatting"""
    cell.text = str(text)
    p = cell.text_frame.paragraphs[0]
    p.font.size = Pt(font_size)
    p.font.bold = bold
    p.alignment = align
    if color:
        p.font.color.rgb = color

def create_simple_table(slide, left, top, data, headers, col_widths):
    """Create a clean table"""
    rows = len(data) + 1
    cols = len(headers)
    width = sum(col_widths)

    table_shape = slide.shapes.add_table(rows, cols, Inches(left), Inches(top), Inches(width), Inches(0.3 * rows))
    table = table_shape.table

    # Set column widths
    for i, w in enumerate(col_widths):
        table.columns[i].width = Inches(w)

    # Header row
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        set_cell_text(cell, header, font_size=9, bold=True, color=COLORS['white'], align=PP_ALIGN.CENTER)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLORS['dark_blue']

    # Data rows
    for row_idx, row_data in enumerate(data):
        for col_idx, value in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            set_cell_text(cell, value if value else '—', font_size=9, align=PP_ALIGN.CENTER)
            if row_idx % 2 == 1:
                cell.fill.solid()
                cell.fill.fore_color.rgb = RGBColor(240, 248, 255)

    return table_shape

def add_title_text(slide, text, left, top, width, font_size=18, bold=True, color=None):
    """Add a title/heading text"""
    textbox = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(0.5))
    tf = textbox.text_frame
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(font_size)
    p.font.bold = bold
    if color:
        p.font.color.rgb = color
    return textbox

def main():
    # Open template
    prs = Presentation('CARDAMYST Branded Powerpoint Template.pptx')

    # Clear all slides
    while len(prs.slides) > 0:
        rId = prs.slides._sldIdLst[0].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[0]

    # Use simple layouts
    title_layout = prs.slide_layouts[0]
    content_layout = prs.slide_layouts[2]
    thank_you_layout = prs.slide_layouts[10]

    # ===== SLIDE 1: Title =====
    slide = prs.slides.add_slide(title_layout)
    for shape in slide.shapes:
        if shape.has_text_frame:
            if 'Title' in shape.name and 'Subhead' not in shape.name:
                shape.text_frame.paragraphs[0].text = "Executive Status Report"
            elif 'Subhead' in shape.name:
                shape.text_frame.paragraphs[0].text = COVERAGE_DATA['reportDate']

    # ===== SLIDE 2: Coverage Summary =====
    slide = prs.slides.add_slide(content_layout)
    for shape in slide.shapes:
        if shape.has_text_frame and 'Title' in shape.name:
            shape.text_frame.paragraphs[0].text = "Coverage Summary"

    # KPI Table
    kpi_data = [
        ['Total', 'Commercial', 'Medicare', 'Medicaid', 'Plans'],
        [f"{COVERAGE_DATA['total']['coverage']:.1f}%",
         f"{COVERAGE_DATA['commercial']['coverage']:.1f}%",
         f"{COVERAGE_DATA['medicare']['coverage']:.1f}%",
         f"{COVERAGE_DATA['medicaid']['coverage']:.1f}%",
         str(COVERAGE_DATA['plans'])],
        [f"{format_millions(COVERAGE_DATA['total']['totalLives'])} lives",
         f"{format_millions(COVERAGE_DATA['commercial']['totalLives'])} lives",
         f"{format_millions(COVERAGE_DATA['medicare']['totalLives'])} lives",
         f"{format_millions(COVERAGE_DATA['medicaid']['totalLives'])} lives",
         "With coverage"]
    ]

    # Create KPI as single table
    kpi_table = slide.shapes.add_table(3, 5, Inches(0.5), Inches(1.5), Inches(9), Inches(1.2))
    table = kpi_table.table

    for i in range(5):
        table.columns[i].width = Inches(1.8)

    for col in range(5):
        # Header
        cell = table.cell(0, col)
        set_cell_text(cell, kpi_data[0][col], font_size=11, bold=True, color=COLORS['navy'], align=PP_ALIGN.CENTER)
        # Value
        cell = table.cell(1, col)
        set_cell_text(cell, kpi_data[1][col], font_size=24, bold=True, color=COLORS['dark_blue'], align=PP_ALIGN.CENTER)
        # Subtitle
        cell = table.cell(2, col)
        set_cell_text(cell, kpi_data[2][col], font_size=9, color=COLORS['gray'], align=PP_ALIGN.CENTER)

    # Segment breakdown
    add_title_text(slide, "Coverage by Segment", 0.5, 3.0, 4, font_size=14, color=COLORS['navy'])

    segment_data = [
        ['Commercial (incl. Federal)', '186,600,000', '6,816,075', '3.7%'],
        ['Medicare', '51,000,000', '0', '0.0%'],
        ['Medicaid', '92,000,000', '0', '0.0%'],
    ]
    create_simple_table(slide, 0.5, 3.4, segment_data,
                       ['Segment', 'Total Lives', 'Covered Lives', 'Coverage'],
                       [2.5, 1.5, 1.5, 1.0])

    # ===== SLIDE 3: Contract Summary =====
    slide = prs.slides.add_slide(content_layout)
    for shape in slide.shapes:
        if shape.has_text_frame and 'Title' in shape.name:
            shape.text_frame.paragraphs[0].text = "Contract Status Summary"

    # Contract KPIs
    contract_kpi = slide.shapes.add_table(2, 4, Inches(0.5), Inches(1.5), Inches(8), Inches(0.9))
    table = contract_kpi.table

    kpis = [
        ('Total Contracts', '8'),
        ('Signed', '3'),
        ('Submitted', '4'),
        ('In Negotiation', '1'),
    ]

    for i in range(4):
        table.columns[i].width = Inches(2)
        cell = table.cell(0, i)
        set_cell_text(cell, kpis[i][0], font_size=10, bold=True, color=COLORS['navy'], align=PP_ALIGN.CENTER)
        cell = table.cell(1, i)
        set_cell_text(cell, kpis[i][1], font_size=28, bold=True, color=COLORS['dark_blue'], align=PP_ALIGN.CENTER)

    # Contract details by segment
    add_title_text(slide, "Contract Details", 0.5, 2.7, 4, font_size=14, color=COLORS['navy'])

    all_contracts = []
    for segment, contracts in CONTRACT_DATA['by_segment'].items():
        for c in contracts:
            all_contracts.append([
                c['payer'], segment, c['period'],
                f"{c['base']:.1f}%", f"{c['admin']:.1f}%", f"{c['data']:.1f}%",
                f"{c['total']:.1f}%", f"{c['priceCap']:.1f}%" if c['priceCap'] else '—',
                c['status']
            ])

    create_simple_table(slide, 0.3, 3.1, all_contracts,
                       ['Payer', 'Segment', 'Period', 'Base', 'Admin', 'Data', 'Total', 'Price Cap', 'Status'],
                       [1.2, 1.1, 0.7, 0.6, 0.6, 0.5, 0.6, 0.7, 0.8])

    # ===== SLIDE 4: Thank You =====
    slide = prs.slides.add_slide(thank_you_layout)
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                if 'Thank' in para.text or 'Title' in shape.name:
                    para.text = "Thank You"

    # Save
    output_path = 'Cardamyst_Executive_Report.pptx'
    prs.save(output_path)
    print(f"Created: {output_path}")

if __name__ == '__main__':
    main()
