// File Explorer - Add File Helper Script
// This script helps you easily add new files to the File Explorer

function addFileToFileSystem(fileName, filePath, fileType, displayName) {
  // Example usage:
  // addFileToFileSystem('my-resume.pdf', 'public/files/resume/my-resume.pdf', 'resume', 'My Resume')
  
  const fileEntry = {
    name: displayName || fileName,
    type: fileType,
    icon: getFileIcon(fileType, fileName),
    content: filePath
  };
  
  console.log('Add this to your fileSystem object in about-me.html:');
  console.log(`'${fileName}': ${JSON.stringify(fileEntry, null, 2)}`);
  
  return fileEntry;
}

function getFileIcon(fileType, fileName) {
  const iconMap = {
    'folder': 'fa-folder',
    'image': 'fa-image',
    'video': 'fa-video',
    'audio': 'fa-music',
    'certificate': 'fa-certificate',
    'resume': 'fa-file-pdf',
    'document': getDocumentIcon(fileName)
  };
  
  return iconMap[fileType] || 'fa-file';
}

function getDocumentIcon(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  const iconMap = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'txt': 'fa-file-lines',
    'zip': 'fa-file-zipper',
    'rar': 'fa-file-zipper'
  };
  
  return iconMap[extension] || 'fa-file-lines';
}

// Example usage:
console.log('=== File Explorer - Add File Helper ===');
console.log('');

// Example 1: Add a resume
addFileToFileSystem('krithik-resume.pdf', 'public/files/resume/krithik-resume.pdf', 'resume', 'Krithik Resume');

console.log('');

// Example 2: Add a certificate
addFileToFileSystem('python-cert.jpg', 'public/files/certificates/python-cert.jpg', 'certificate', 'Python Certificate');

console.log('');

// Example 3: Add a project screenshot
addFileToFileSystem('new-project.jpg', 'public/files/pictures/project-screenshots/new-project.jpg', 'image', 'New Project Screenshot');

console.log('');
console.log('=== Instructions ===');
console.log('1. Copy your file to the appropriate folder in public/files/');
console.log('2. Run this script to get the file entry code');
console.log('3. Add the code to the fileSystem object in about-me.html');
console.log('4. Test the File Explorer to make sure it works!'); 