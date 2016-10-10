const markdownContent = localStorage.getItem('fileContent');
document.querySelector('marked-element').setAttribute('markdown', markdownContent);