import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path):
    # docx files are zip files. The main text is in word/document.xml
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            
        root = ET.fromstring(xml_content)
        
        # Namespaces are important in docx XML
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = []
            for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                if run.text:
                    texts.append(run.text)
            paragraphs.append(''.join(texts))
            
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {str(e)}"

if __name__ == '__main__':
    docx_file = r"C:\Users\athar\api-security-scanner\ATHX AI Copilot Architecture 30_Sprint Roadmap.docx"
    text = extract_docx_text(docx_file)
    
    output_path = r"C:\Users\athar\api-security-scanner\scratch\roadmap_text.txt"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Successfully wrote docx text to {output_path}")
