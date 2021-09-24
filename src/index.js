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

  imageDiv.appendChild(imageElement);
}

function drawOnCanvas(canvas, image, name) {
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.height = image.height;
  canvas.width = image.width;
  ctx.drawImage(image, 0, 0);

  ctx.font = `${fontSize}px ${currentFont}`;
  ctx.textAlign = 'center';
  const heightPos = (((50 + nameTopDiff) / 100) * canvas.height) + (fontSize / 2);
  const widthPos = ((50 + nameLeftDiff) / 100) * canvas.width;
  ctx.fillText(name, widthPos, heightPos);
}

let names = [];

function parseWorkbook(workbook, sheetName, namesColumn) {
  const sheet = workbook.Sheets[sheetName];
  names = Object.keys(sheet).filter(cell => cell.startsWith(namesColumn)).map(key => sheet[key].v);
}

let imagePath = '';

const exportButton = document.getElementById('export');
exportButton.onclick = () => {
  const canvas = document.getElementById('viewport')
  if (imagePath && names && names.length > 0) {
    const image = new Image();
    image.src = imagePath;
    image.onload = () => {
      Promise.all(
        names.map(name => {
          return new Promise((res) => {
            drawOnCanvas(canvas, image, name);
            window.api.saveCanvas(name).then(() => {
              res();
            })
          })
        })
      ).then(() => {
        console.log('Success')
      })
    }
  }
}

const { ConfigPanel } = window;
const configPanel = new ConfigPanel();

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();

  const file = event.dataTransfer.files[0];
  if (file.type === 'image/png' || file.type === 'image/jpeg') {
    imagePath = file.path;
    addImage(file.path);
  } else {
    if (file.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      parseWorkbook(window.api.readXLSX(file.path), 'Sheet1', 'A');
      const excelFileNameElement = document.getElementById('excel-file');
      excelFileNameElement.innerHTML = file.name;
    }
  }
});

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});