# Audiobook Creator

A web application for creating and managing audiobooks. Upload audio files, convert text to speech, or transform PDFs into audiobooks.

## Features

- Upload audio files (MP3, WAV, OGG)
- Convert text to speech in multiple languages
- Convert PDF documents to audiobooks
- Play audiobooks directly in the browser
- Organize and manage your audiobook library
- User-friendly interface with responsive design

## Requirements

- Python 3.7+
- Flask
- gTTS (Google Text-to-Speech)
- PyDub (for audio processing)
- PyPDF2 (for PDF text extraction)


## Project Structure

```
audiobook/
├── app.py                 # Main application file
├── requirements.txt       # Python dependencies
├── static/                # Static files
│   ├── css/               # CSS files
│   │   └── style.css      # Main stylesheet
│   ├── js/                # JavaScript files
│   │   ├── main.js        # Main JavaScript file
│   │   └── library.js     # Library page JavaScript
│   └── uploads/           # Uploaded and generated audio files
└── templates/             # HTML templates
    ├── index.html         # Home page
    └── library.html       # Library page
```

## Usage

1. **Upload Audio Files**
   - Click on "Choose File" in the Upload Audio section
   - Select an MP3, WAV, or OGG file
   - Click "Upload"

2. **Convert Text to Speech**
   - Enter the text you want to convert in the Text to Speech section
   - Select the language
   - Click "Generate Speech"

3. **Convert PDF to Audiobook**
   - Click on "Choose PDF" in the PDF to Audiobook section
   - Select a PDF file
   - Enter a title for the audiobook (optional)
   - Select the language
   - Click "Create Audiobook"

4. **Play Audiobooks**
   - Use the audio player to listen to your audiobooks
   - Recent files are shown below the player for quick access

5. **Manage Library**
   - Go to the Library page to see all your audiobooks
   - Search for specific audiobooks
   - Sort your audiobooks by name, date, or size
   - Click on an audiobook to play it

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Flask](https://flask.palletsprojects.com/)
- [gTTS](https://gtts.readthedocs.io/)
- [PyDub](https://github.com/jiaaro/pydub)
- [PyPDF2](https://github.com/py-pdf/pypdf)
