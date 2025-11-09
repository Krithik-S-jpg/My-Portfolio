# File Explorer - File Organization Guide

This directory contains all the files that will be displayed in your 3D Portfolio's File Explorer.

## 📁 Directory Structure

```
public/files/
├── documents/          # Documents, PDFs, Word files, etc.
├── pictures/           # Photos, screenshots, profile pictures
├── certificates/       # Your certificates and achievements
├── resume/            # Resume files (PDF, DOC, etc.)
├── videos/            # Video files, demos, presentations
└── audio/             # Audio files, background music
```

## 📋 How to Add Files

1. **Copy your files** into the appropriate folders above
2. **Update the file system** in `about-me.html` to include your new files
3. **Test the File Explorer** to make sure everything works

## 🔧 File System Configuration

The File Explorer uses a JavaScript object in `about-me.html` to define the file structure. You'll need to update this when adding new files:

```javascript
const fileSystem = {
  desktop: {
    name: 'Desktop',
    type: 'folder',
    children: {
      'your-file.pdf': { 
        name: 'Your File', 
        type: 'document', 
        icon: 'fa-file-pdf', 
        content: 'public/files/documents/your-file.pdf' 
      }
    }
  }
  // ... other folders
};
```

## 📝 File Types Supported

- **Documents**: PDF, DOC, DOCX, TXT
- **Images**: JPG, PNG, GIF, SVG
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV, OGG
- **Certificates**: Any image format
- **Resume**: PDF, DOC, DOCX

## 🎯 Recommended Files to Add

### Documents/
- Resume.pdf
- Cover Letter.docx
- Portfolio Details.txt

### Pictures/
- profile.jpg (your profile photo)
- project-screenshots/ (folder with project images)
- certificates/ (folder with certificate images)

### Certificates/
- html-css-cert.jpg
- javascript-cert.jpg
- react-cert.jpg
- python-cert.jpg

### Videos/
- portfolio-demo.mp4
- project-showcase.mp4

### Audio/
- background-music.mp3

## ⚠️ Important Notes

- Keep file names simple (no spaces, use hyphens)
- Use relative paths starting with `public/files/`
- Make sure file extensions match the content
- Test file previews after adding new files 