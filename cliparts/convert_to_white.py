import os
import re
from xml.etree import ElementTree as ET

def ensure_directory_exists(directory):
    """Ensure the target directory exists."""
    if not os.path.exists(directory):
        os.makedirs(directory)

def convert_svg_to_white_fill(folder_path, saving_to):
    """Converts all SVGs in folder_path to have white fills and saves them in saving_to."""
    ensure_directory_exists(saving_to)
    
    for root_dir, _, files in os.walk(folder_path):
        for name in files:
            if name.endswith(".svg"):
                input_svg = os.path.join(root_dir, name)
                output_svg = os.path.join(saving_to, name)

                # Read the SVG
                tree = ET.parse(input_svg)
                root = tree.getroot()

                # Find all <path> elements and set their fill to white
                for path in root.findall('.//{http://www.w3.org/2000/svg}path'):
                    path.set('fill', 'white')

                # Save the changes
                tree.write(output_svg)

if __name__ == "__main__":
    new_folder = r"C:\Users\kevin\Documents\_Coding\Projects\GraphGPT_react\mapintelligence-main\cliparts"
    folder_path = os.path.join(new_folder, "black_svg")

    convert_svg_to_white_fill(folder_path, new_folder)
    print(f"Converted SVGs saved to: {new_folder}")
