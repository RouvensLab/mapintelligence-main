import os

def get_relative_paths(folder_path):
    relative_paths = []
    for root, dirs, files in os.walk(folder_path):
        for name in files:
            relative_path = "cliparts\\"+os.path.relpath(os.path.join(root, name), folder_path)
            relative_paths.append(f"![]({relative_path})")
        for name in dirs:
            relative_path = os.path.relpath(os.path.join(root, name), folder_path)
            relative_paths.append(f"![]({relative_path})")
    return relative_paths


#make a function that takes all svg from the folder and converts them to white fill svg and save them into a new folder
def convert_svg_to_white_fill(folder_path, saving_to):
    for root, dirs, files in os.walk(folder_path):
        for name in files:
            if name.endswith(".svg"):
                with open(os.path.join(root, name), "r") as f:
                    svg = f.read()
                    svg = svg.replace("fill=\"#000000\"", "fill=\"#ffffff\"")
                    svg = svg.replace("fill=\"#000\"", "fill=\"#fff\"")
                    with open(os.path.join(saving_to, name), "w") as f:
                        f.write(svg)

if __name__ == "__main__":
    folder_path = r"C:\Users\kevin\Documents\_Coding\Projects\GraphGPT_react\mapintelligence-main\cliparts"



    new_folder = r"C:\Users\kevin\Documents\_Coding\Projects\GraphGPT_react\mapintelligence-main\cliparts\new_svg"
    convert_svg_to_white_fill(folder_path, new_folder)

    relative_paths = get_relative_paths(new_folder)
    for path in relative_paths:
        print(path)
