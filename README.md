Datum: 24.02.2025

# Mapintelligence Chat App

Dieses Projekt ist eine Gruppenarbeit von: Kevin Leutwyler, Mojtaba Hasanzadeh und Narmatha Nanthakumar.

## Arbeitsaufteilung:

- Mojtaba Hasanzadeh: Frontend, Benutzerinterface
- Narmatha Nanthakumar: Frontend, Benutzerinterface
- Kevin Leutwyler: Frontend/Backend, LLM Server, Langchain Schnittstelle

# Setup

## Die React.js Umgebung aufstellen:

1. CodeEditor finden. (Vorschlag: [VSCode](https://code.visualstudio.com/download))
2. [Node.js](https://nodejs.org/en/download) (Npm package manager integriert) installieren.
3. Repository herunterladen, Zipfile auspacken und in Umgebung öffnen.
4. Terminal: `cd DeinenDateiPfadZuDiesemProjekt/Mapintelligence`
5. Terminal: `npm i` installiert alle notwendigen Packages aus dem `package.json` file.

## LLM mit Docker installieren:

1. Docker Desktop installieren
    - Dokumentation zum Aufsetzen von Ollama mit Docker: [Docker Hub](https://hub.docker.com/r/ollama/ollama)
    - [Docker Desktop Setup](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Terminal: `docker pull ollama/ollama`
3. Im Folgenden wird bestimmt, ob docker, d.h. das LLM CPU oder GPU nutzt. CPU ist einfacher zum instalieren, da nicht noch wsl2 gebraucht wird, jedoch auch langsamer. GPU wäre schneller beim Antwort geben.
    - Nur mit der CPU (Einfacher):
        ```bash
        docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
        ```
    - Nvidia GPU (Fortgeschritten):
        - Für Windows-User wird hier WSL2 (Linuxsystem) benötigt.
        - Installiere das NVIDIA Container Toolkit:
        ```bash
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg
        curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
        sudo apt-get update
        sudo apt-get install -y nvidia-container-toolkit
        ```

Ein Modell starten (herunterladen):
```bash
docker exec -it ollama ollama run llama3
```
Verschiedene Modelle: [Ollama Library](https://ollama.com/library)

Wenn `llama3` installiert wurde, kann man im Terminal mit dem Modell chatten. Um den Chat zu verlassen, gibt man `/bye` in das Terminal ein.

Des Weiteren braucht man `nomic-embed-text`, um Embeddings zu erstellen, was später für das Vektorisieren von Textdateien gebraucht wird.
```bash
docker exec -it ollama ollama run nomic-embed-text
```
Das wird auch wieder auf den Docker gepullt.

## Applikation starten

Damit die App fehlerfrei läuft, muss der Docker mit dem LLM Modell und Embedder gestartet werden.
```bash
docker start ollama
```
Die Mapintelligence React App wird wie folgt gestartet.
```bash
npm run dev
```

# Nutzen der MapIntelligence App

Beim Öffnen der App kommt man gleich auf die Hauptbenutzeroberfläche. Links ist das Inputfeld mit dem Chatverlauf und rechts in der Mitte wird der aktuelle Graph dargestellt. Ganz rechts kann zwischen verschiedenen Konversationen gewechselt werden. Das Ganze kommt also im Vergleich zum ChatGPT Benutzerinterface ziemlich vertraut vor.
