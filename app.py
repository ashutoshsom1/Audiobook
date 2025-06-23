from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import gtts
from pydub import AudioSegment
import uuid
import json
import PyPDF2

app = Flask(__name__)
app.secret_key = 'audiobook_secret_key'

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'txt', 'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 32 * 1024 * 1024  # 32MB max file size

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    file = request.files['file']
    
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        flash('File successfully uploaded')
        return jsonify({'success': True, 'filename': filename})
    else:
        flash('File type not allowed')
        return jsonify({'success': False, 'error': 'File type not allowed'})

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'success': False, 'error': 'No text provided'})
    
    text = data['text']
    language = data.get('language', 'en')
    
    try:
        # Generate unique filename
        filename = f"tts_{uuid.uuid4()}.mp3"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Generate speech
        tts = gtts.gTTS(text=text, lang=language)
        tts.save(file_path)
        
        return jsonify({'success': True, 'filename': filename})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/get-audio/<filename>')
def get_audio(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/list-audio')
def list_audio():
    files = []
    for filename in os.listdir(app.config['UPLOAD_FOLDER']):
        if allowed_file(filename):
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            files.append({
                'name': filename,
                'path': f'/get-audio/{filename}',
                'size': os.path.getsize(file_path)
            })
    return jsonify(files)

@app.route('/library')
def library():
    return render_template('library.html')

@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'error': 'No selected file'})
    
    if file and file.filename.rsplit('.', 1)[1].lower() == 'pdf':
        try:
            # Save the PDF temporarily
            temp_filename = secure_filename(file.filename)
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
            file.save(temp_path)
            
            # Extract text from PDF
            text = extract_text_from_pdf(temp_path)
            
            # Generate speech from extracted text
            language = request.form.get('language', 'en')
            audiobook_title = request.form.get('title', os.path.splitext(temp_filename)[0])
            
            # Generate unique filename for the audio
            audio_filename = f"pdf_{uuid.uuid4()}.mp3"
            audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
            
            # Convert text to speech
            tts = gtts.gTTS(text=text, lang=language)
            tts.save(audio_path)
            
            return jsonify({
                'success': True, 
                'filename': audio_filename,
                'title': audiobook_title,
                'text': text[:1000] + '...' if len(text) > 1000 else text  # Return preview of text
            })
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    else:
        return jsonify({'success': False, 'error': 'File must be a PDF'})

def extract_text_from_pdf(pdf_path):
    """Extract text content from a PDF file."""
    text = ""
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        
        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text += page.extract_text() + "\n"
    
    return text

if __name__ == '__main__':
    app.run(debug=True)
