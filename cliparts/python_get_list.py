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

if __name__ == "__main__":
    folder_path = r"C:\Users\kevin\Documents\_Coding\Projects\GraphGPT_react\mapintelligence-main\cliparts"
    relative_paths = get_relative_paths(folder_path)
    for path in relative_paths:
        print(path)