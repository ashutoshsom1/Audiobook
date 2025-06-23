document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audiobookList = document.getElementById('audiobook-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const audioElement = document.getElementById('library-audio-element');
    const currentTitle = document.getElementById('library-current-title');
    const currentTime = document.getElementById('library-current-time');
    const duration = document.getElementById('library-duration');
    
    // Get all audio files
    loadAudiobooks();
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Sort functionality
    sortSelect.addEventListener('change', function() {
        loadAudiobooks(this.value);
    });
    
    // Audio player time update
    audioElement.addEventListener('timeupdate', function() {
        currentTime.textContent = formatTime(this.currentTime);
    });
    
    // Audio player duration change
    audioElement.addEventListener('durationchange', function() {
        duration.textContent = formatTime(this.duration);
    });
    
    // Helper functions
    
    // Load audiobooks from server
    function loadAudiobooks(sortBy = 'name') {
        // Show loading indicator
        audiobookList.innerHTML = '<div class="loading-indicator">Loading your library...</div>';
        
        fetch('/list-audio')
            .then(response => response.json())
            .then(files => {
                // Sort files
                switch (sortBy) {
                    case 'name':
                        files.sort((a, b) => a.name.localeCompare(b.name));
                        break;
                    case 'date':
                        // Using filenames as proxy for date since we don't have actual dates
                        files.sort((a, b) => b.name.localeCompare(a.name));
                        break;
                    case 'size':
                        files.sort((a, b) => b.size - a.size);
                        break;
                }
                
                displayAudiobooks(files);
            })
            .catch(error => {
                console.error('Error:', error);
                audiobookList.innerHTML = '<div class="loading-indicator">Error loading library. Please try again.</div>';
            });
    }
    
    // Display audiobooks in the grid
    function displayAudiobooks(files) {
        if (files.length === 0) {
            audiobookList.innerHTML = '<div class="loading-indicator">No audiobooks found.</div>';
            return;
        }
        
        audiobookList.innerHTML = '';
        
        files.forEach(file => {
            const audiobook = createAudiobookElement(file);
            audiobookList.appendChild(audiobook);
        });
    }
    
    // Create audiobook element
    function createAudiobookElement(file) {
        const audiobook = document.createElement('div');
        audiobook.className = 'audiobook-item';
        audiobook.dataset.path = file.path;
        audiobook.dataset.name = file.name;
        
        // Get file extension
        const extension = file.name.split('.').pop().toLowerCase();
        
        audiobook.innerHTML = `
            <div class="audiobook-cover">
                <i class="icon">🎵</i>
            </div>
            <div class="audiobook-info">
                <div class="audiobook-title">${file.name}</div>
                <div class="audiobook-meta">
                    ${formatFileSize(file.size)} • ${extension.toUpperCase()}
                </div>
            </div>
        `;
        
        // Add click event to play the audiobook
        audiobook.addEventListener('click', function() {
            loadAudio(file.name, file.path);
        });
        
        return audiobook;
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
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
    
    // Search functionality
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (!searchTerm) {
            loadAudiobooks(sortSelect.value);
            return;
        }
        
        fetch('/list-audio')
            .then(response => response.json())
            .then(files => {
                // Filter files by search term
                const filteredFiles = files.filter(file => 
                    file.name.toLowerCase().includes(searchTerm)
                );
                
                displayAudiobooks(filteredFiles);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});
