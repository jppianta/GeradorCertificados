const { configPanel } = window;

function addImage(imagePath) {
  const mainDiv = document.getElementById('container');

  let imageDiv = document.getElementById('template');
  if (!imageDiv) {
    imageDiv = document.createElement('div');
    imageDiv.id = 'template';
    mainDiv.appendChild(imageDiv);
  } else {
    if (imageDiv.childElementCount > 0) {
      for (child of imageDiv.children) {
        imageDiv.removeChild(child);
      }
    }
  }

  const imageElement = document.createElement('img');
  imageElement.src = imagePath;
  configPanel.setImagePath(imagePath)

  imageDiv.appendChild(imageElement);
}

function receiveFile(file) {
  switch(file.type) {
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      configPanel.setWorkbook(window.api.readXLSX(file.path), file.name);
      break;
    }
    case 'image/png': {
      addImage(file.path);
      break;
    }
    case 'image/jpeg': {
      addImage(file.path);
      break;
    }
  }
}

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();

  for (const file of event.dataTransfer.files) {
    receiveFile(file);
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});