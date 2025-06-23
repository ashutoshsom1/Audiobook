document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadForm = document.getElementById('upload-form');
    const fileUpload = document.getElementById('file-upload');
    const fileName = document.getElementById('file-name');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadMessage = document.getElementById('upload-message');
    
    const ttsForm = document.getElementById('tts-form');
    const ttsProgress = document.getElementById('tts-progress');
    const ttsMessage = document.getElementById('tts-message');
    
    const audioElement = document.getElementById('audio-element');
    const currentTitle = document.getElementById('current-title');
    const currentTime = document.getElementById('current-time');
    const duration = document.getElementById('duration');
    const recentFilesList = document.getElementById('recent-files-list');
    
    // Local storage key for recent files
    const RECENT_FILES_KEY = 'audiobook_recent_files';
    
    // Update file name display when a file is selected
    fileUpload.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = 'No file chosen';
        }
    });
    
    // Handle file upload
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const file = fileUpload.files[0];
        
        if (!file) {
            showMessage(uploadMessage, 'Please select a file', false);
            return;
        }
        
        // Show progress bar
        uploadProgress.style.display = 'block';
        
        // Upload file using fetch
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(uploadMessage, 'File uploaded successfully!', true);
                // Add to recent files
                addToRecentFiles({
                    name: data.filename,
                    path: `/get-audio/${data.filename}`
                });
                // Load the file in the player
                loadAudio(data.filename, `/get-audio/${data.filename}`);
            } else {
                showMessage(uploadMessage, data.error || 'Upload failed', false);
            }
            // Reset progress bar
            resetProgressBar(uploadProgress);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(uploadMessage, 'An error occurred during upload', false);
            resetProgressBar(uploadProgress);
        });
        
        // Simulate progress for better UX
        simulateProgress(uploadProgress);
    });
    
    // Handle text-to-speech conversion
    ttsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const text = document.getElementById('tts-text').value;
        const language = document.getElementById('tts-language').value;
        
        if (!text.trim()) {
            showMessage(ttsMessage, 'Please enter some text', false);
            return;
        }
        
        // Show progress bar
        ttsProgress.style.display = 'block';
        
        // Convert text to speech using fetch
        fetch('/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                language: language
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(ttsMessage, 'Speech generated successfully!', true);
                // Add to recent files
                addToRecentFiles({
                    name: data.filename,
                    path: `/get-audio/${data.filename}`
                });
                // Load the file in the player
                loadAudio(data.filename, `/get-audio/${data.filename}`);
            } else {
                showMessage(ttsMessage, data.error || 'Generation failed', false);
            }
            // Reset progress bar
            resetProgressBar(ttsProgress);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(ttsMessage, 'An error occurred during generation', false);
            resetProgressBar(ttsProgress);
        });
        
        // Simulate progress for better UX
        simulateProgress(ttsProgress);
    });
    
    // Audio player time update
    audioElement.addEventListener('timeupdate', function() {
        currentTime.textContent = formatTime(this.currentTime);
    });
    
    // Audio player duration change
    audioElement.addEventListener('durationchange', function() {
        duration.textContent = formatTime(this.duration);
    });
    
    // Load recent files from local storage
    loadRecentFiles();
    
    // Helper functions
    
    // Show message with success or error styling
    function showMessage(element, message, isSuccess) {
        element.textContent = message;
        element.className = isSuccess ? 'success-message' : 'error-message';
        element.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
    
    // Reset progress bar
    function resetProgressBar(progressBar) {
        setTimeout(() => {
            progressBar.style.display = 'none';
            progressBar.querySelector('.progress').style.width = '0%';
        }, 500);
    }
    
    // Simulate progress for better UX
    function simulateProgress(progressBar) {
        const progress = progressBar.querySelector('.progress');
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            } else {
                width += Math.random() * 10;
                progress.style.width = Math.min(width, 90) + '%';
            }
        }, 300);
    }
    
    // Format time in mm:ss format
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Load audio file into player
    function loadAudio(name, path) {
        audioElement.src = path;
        currentTitle.textContent = name;
        audioElement.play();
    }
    
    // Add file to recent files list
    function addToRecentFiles(file) {
        let recentFiles = JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]');
        
        // Check if file already exists
        const existingIndex = recentFiles.findIndex(f => f.path === file.path);
        if (existingIndex !== -1) {
            // Remove existing entry
            recentFiles.splice(existingIndex, 1);
        }
        
        // Add to beginning of array
        recentFiles.unshift(file);
        
        // Limit to 10 recent files
        if (recentFiles.length > 10) {
            recentFiles = recentFiles.slice(0, 10);
        }
        
        // Save to local storage
        localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recentFiles));
        
        // Update UI
        updateRecentFilesList(recentFiles);
    }
    
    // Load recent files from local storage
    function loadRecentFiles() {
        const recentFiles = JSON.parse(localStorage.getItem(RECENT_FILES_KEY) || '[]');
        updateRecentFilesList(recentFiles);
    }
    
    // Update recent files list in the UI
    function updateRecentFilesList(files) {
        recentFilesList.innerHTML = '';
        
        if (files.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No recent files';
            recentFilesList.appendChild(li);
            return;
        }
        
        files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            li.addEventListener('click', () => {
                loadAudio(file.name, file.path);
            });
            recentFilesList.appendChild(li);
        });
    }
});
