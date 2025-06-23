# FFmpeg Installation Instructions

PyDub requires FFmpeg to process audio files. You need to install FFmpeg and make it available in your system PATH. Here's how to do it:

## Windows

1. Download FFmpeg from https://ffmpeg.org/download.html or use a direct link to a Windows build like https://www.gyan.dev/ffmpeg/builds/

2. Extract the ZIP file to a location on your computer (e.g., `C:\ffmpeg`)

3. Add the `bin` directory to your system PATH:
   - Right-click on "This PC" or "My Computer" and select "Properties"
   - Click on "Advanced system settings"
   - Click on "Environment Variables"
   - Under "System variables", find the "Path" variable, select it and click "Edit"
   - Click "New" and add the path to the bin directory (e.g., `C:\ffmpeg\bin`)
   - Click "OK" on all dialogs to save the changes

4. Restart your terminal/command prompt for the changes to take effect

## macOS

If you have Homebrew installed:

```
brew install ffmpeg
```

## Linux

```
sudo apt update
sudo apt install ffmpeg
```

## Verify Installation

To verify that FFmpeg is installed correctly, open a terminal/command prompt and run:

```
ffmpeg -version
```

You should see version information for FFmpeg.
