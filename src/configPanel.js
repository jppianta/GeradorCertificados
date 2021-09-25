const { TextConfig } = window;

class ConfigPanel {
  constructor() {
    this.fontInput = document.getElementById('font-input');
    this.addFontButton = document.getElementById('add-font');
    this.toogleButton = document.getElementById('settings-button');
    this.panel = document.getElementById('settings');
    this.exportButton = document.getElementById('export');
    this.settingsAccordion = document.getElementById('settings-accordion');
    this.addButton = document.getElementById('add-button');
    this.sheetAccordion = document.getElementById('sheet-accordion');
    this.sheetOptionsElement = null;

    this.workbook = null;
    this.selectedSheet = null;
    this.sheetOptions = [];

    this.textConfigs = [];
    this.hidden = true;

    this.setUp();
  }

  setUp() {
    if (this.toogleButton) {
      this.toogleButton.onclick = () => {
        this.hidden = !this.hidden;
        this.panel.style.display = `${this.hidden ? 'none' : 'block'}`
      }
    }

    if (this.addFontButton) {
      this.addFontButton.onclick = () => {
        const value = this.fontInput.value;
        if (value) {
          const start = 'https://fonts.googleapis.com/css2?'
          if (!value.startsWith(start)) {
            console.error('Nao eh uma fonte valida')
          }
          const familyTag = 'family=';
          const name = value.slice(start.length);
          const fontFamilies = name.split('&')
            .filter(fam => fam.startsWith(familyTag))
            .map(fam => fam.replaceAll('+', ' ')
              .slice(familyTag.length));

          const head = document.getElementsByTagName('HEAD')[0];
          const link = document.createElement('link');

          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = value;

          head.appendChild(link);

          this.textConfigs.forEach(textConfig => textConfig.addFontFamilies(fontFamilies));
        }

        fontInput.value = '';
      }
    }

    if (this.addButton) {
      this.addButton.onclick = () => {
        const imageDiv = document.getElementById('template');
        const textConfig = new TextConfig(imageDiv);

        textConfig.setUp(this.settingsAccordion);

        this.textConfigs.push(textConfig);
      }
    }

    if (this.exportButton) {
      this.exportButton.onclick = () => {
        const canvas = document.getElementById('viewport')
        if (this.imagePath) {
          const image = new Image();
          image.src = this.imagePath;
          image.onload = () => {
            for (let i = 1; i <= this.getNumberOfLines(); i++) {
              this.drawOnCanvas(canvas, image, i);
            }
          }
        }
      }
    }
  }

  async drawOnCanvas(canvas, image, line) {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.height = image.height;
    canvas.width = image.width;
    ctx.drawImage(image, 0, 0);

    this.textConfigs.forEach(textConfig => {
      const text = this.parseTextFromTextConfig(textConfig, line);
      const textMetrics = ctx.measureText(text);
      const height = (Math.abs(textMetrics.fontBoundingBoxAscent) + Math.abs(textMetrics.fontBoundingBoxDescent)) * 2;
      ctx.textAlign = textConfig.textAlign;
      ctx.font = `${textConfig.fontSize}px ${textConfig.selectedFont}`;
      ctx.fillText(text, textConfig.leftPos, textConfig.topPos + height);
    })

    await window.api.saveCanvas(line);
  }

  setImagePath(imagePath) {
    this.imagePath = imagePath;
  }

  createAttribute(key, value) {
    const attr = document.createAttribute(key);
    attr.value = value;

    return attr;
  }

  createSettingDiv(titleName) {
    const settingDiv = document.createElement('div');
    settingDiv.className = 'setting';

    const title = document.createElement('span');
    title.className = 'setting-title';
    title.innerHTML = titleName

    settingDiv.appendChild(title);

    return settingDiv;
  }

  clearElementChildren(element) {
    if (element) {
      for (const child of element.children) {
        element.removeChild(child);
      }
    }
  }

  updateSheet = (sheet = this.selectedSheet) => {
    if (this.sheetOptionsElement) {
      const idx = this.sheetOptionsElement.selectedIndex;
      if (this.sheetOptionsElement.options[idx]) {
        this.selectedSheet = this.sheetOptionsElement.options[idx].value;
      }
    }
  }

  createSheetAcordion(filename) {
    this.clearElementChildren(this.sheetAccordion);

    const settingsGroup = document.createElement('fluent-accordion-item');
    settingsGroup.className = 'settings-group';

    this.headingElement = document.createElement('span');
    this.headingElement.attributes.setNamedItem(this.createAttribute('slot', 'heading'));
    this.headingElement.innerHTML = filename;
    this.headingElement.style.overflow = 'hidden';
    this.headingElement.style.whiteSpace = 'nowrap';
    this.headingElement.style.textOverflow = 'ellipsis';

    settingsGroup.appendChild(this.headingElement);

    const sheetSelector = this.createSettingDiv('Seleção de Planilha');

    this.sheetOptionsElement = document.createElement('fluent-select');
    this.updateSheetOptions();

    this.sheetOptionsElement.onchange = () => this.updateSheet()

    sheetSelector.appendChild(this.sheetOptionsElement);

    settingsGroup.appendChild(sheetSelector);

    if (this.sheetAccordion) {
      this.sheetAccordion.appendChild(settingsGroup);
    }

    this.updateSheet();
  }

  updateSheetOptions() {
    this.clearElementChildren(this.sheetOptionsElement);
    this.selectedSheet = this.sheetOptions[0];

    if (this.sheetOptionsElement) {
      for (const sheet of this.sheetOptions) {
        const sheetOption = document.createElement('fluent-option');
        sheetOption.innerHTML = sheet;
        if (sheet === this.selectedSheet) {
          sheetOption.attributes.setNamedItem(this.createAttribute('selected', ''))
        }

        sheetOption.attributes.setNamedItem(this.createAttribute('value', sheet));

        this.sheetOptionsElement.appendChild(sheetOption);
      }
    }
  }

  parseTextFromTextConfig(textConfig, line) {
    return textConfig.getText().replace(/(\#\().*?\)/g, (t) => {
      const column = t.slice(2, t.length - 1);
      const cell = column + line;

      if (this.getSelectedSheet()[cell]) {
        return this.getSelectedSheet()[cell].v;
      }

      return t;
    })
  }

  getSelectedSheet() {
    return this.workbook.Sheets[this.selectedSheet];
  }

  getNumberOfLines() {
    const sheet = this.getSelectedSheet();

    let max = 0;
    Object.keys(sheet).forEach(cell => {
      if (cell !== '!ref') {
        const cellLine = Number(/[0-9]+/.exec(cell)[0]);
        max = cellLine > max ? cellLine : max;
      }
    })

    return max;
  }

  setWorkbook(workbook, fileName) {
    this.workbook = workbook;
    this.sheetOptions = this.workbook.SheetNames;

    this.createSheetAcordion(fileName);
  }
}

window.configPanel = new ConfigPanel();