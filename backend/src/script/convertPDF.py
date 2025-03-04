import requests
import pdfplumber
import json
import tempfile
import os


def pdf_to_json(pdf_url, json_path):
    pdf_data = {"pages": []}

    # Download PDF into a temporary file
    response = requests.get(pdf_url)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
        tmp_pdf.write(response.content)
        tmp_pdf_path = tmp_pdf.name
    print("PDF downloaded successfully.")

    # Extract text and tables from the PDF
    with pdfplumber.open(tmp_pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            tables = page.extract_tables()
            structured_tables = []

            for table in tables:
                headers = table[1]  # Extract headers from second row
                structured_table = []

                for row in table[2:]:  # Extract data rows
                    structured_table.append(
                        {headers[i]: row[i] for i in range(len(headers))})

                structured_tables.append(structured_table)

            pdf_data["pages"].append({
                "page_number": page_num,
                "text": text,
                "tables": structured_tables
            })

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(json_path), exist_ok=True)

    with open(json_path, "w", encoding="utf-8") as json_file:
        json.dump(pdf_data, json_file, indent=4, ensure_ascii=False)

    print(f"JSON saved to {json_path}")


# Example usage
pdf_url = "https://www.pa.gov/content/dam/copapwp-pagov/en/dli/documents/cwia/products/pa%20idol.pdf"
json_path = "output/pa_idol.json"

pdf_to_json(pdf_url, json_path)
