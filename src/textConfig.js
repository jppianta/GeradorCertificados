window.TextConfig = class TextConfig {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.textElement = null;
    this.headingElement = null;
    this.selectorElement = null;
    this.textAlignElements = {
      left: null,
      center: null,
      right: null
    }
    this.text = 'Nome Exemplo';
    this.textAlign = 'left';
    this.fontSize = 24;
    this.configCollapsed = false;
    this.topPos = 0;
    this.leftPos = 0;
    this.availableFonts = new Set([
      'Arial',
      'Verdana',
      'Helvetica',
      'Tahoma',
      'Trebuchet MS',
      'Times New Roman',
      'Georgia',
      'Garamond',
      'Courier New',
      'Brush Script MT'
    ]);
    this.selectedFont = 'Arial';
  }

  setUp(settingsDiv) {
    if (!this.imageElement || !settingsDiv) {
      console.error('Missing Divs')
      return;
    }
    this.setTextElement();

    const settingsGroup = this.createAccordionItem();

    settingsGroup.appendChild(this.createTextInputElement());
    settingsGroup.appendChild(this.createFontSizeElement());
    settingsGroup.appendChild(this.createTextAlignmentElement());
    settingsGroup.appendChild(this.createFontFamilySelector());
    settingsGroup.appendChild(this.createFontPositionElement());

    settingsDiv.appendChild(settingsGroup);
  }

  setImageElement(imageElement) {
    this.imageElement = imageElement;
  }

  createAccordionItem() {
    const settingsGroup = document.createElement('fluent-accordion-item');
    settingsGroup.className = 'settings-group';

    this.headingElement = document.createElement('span');
    this.headingElement.attributes.setNamedItem(this.createAttribute('slot', 'heading'));
    this.headingElement.innerHTML = this.text;
    this.headingElement.style.overflow = 'hidden';
    this.headingElement.style.whiteSpace = 'nowrap';
    this.headingElement.style.textOverflow = 'ellipsis';

    settingsGroup.appendChild(this.headingElement);

    return settingsGroup;
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

  createAttribute(key, value) {
    const attr = document.createAttribute(key);
    attr.value = value;

    return attr;
  }

  setTextElement() {
    const nameElement = document.createElement('div');
    nameElement.className = 'name';
    nameElement.innerHTML = this.text;

    this.imageElement.appendChild(nameElement);
    this.textElement = nameElement;
  }

  parseText(text) {
    this.text = text.replaceAll('\\n', '<br />')
  }

  createTextInputElement() {
    const settingDiv = this.createSettingDiv('Texto');

    const textInput = document.createElement('fluent-text-area');
    textInput.attributes.setNamedItem(this.createAttribute('placeholder', this.text))

    textInput.oninput = () => {
      this.parseText(textInput.value);

      if (this.textElement) {
        this.textElement.innerHTML = this.text;
      }

      if (this.headingElement) {
        this.headingElement.innerHTML = this.text;
      }
    }

    settingDiv.appendChild(textInput);

    return settingDiv;
  }

  createFontSizeElement() {
    const settingDiv = this.createSettingDiv('Tamanho Fonte');

    const fontSize = document.createElement('fluent-number-field');
    fontSize.attributes.setNamedItem(this.createAttribute('minlength', 0));
    fontSize.attributes.setNamedItem(this.createAttribute('value', 24));

    fontSize.onchange = () => {
      const valueNumber = Number(fontSize.value)
      this.fontSize = valueNumber;

      if (this.textElement) {
        this.textElement.style.fontSize = `${valueNumber}px`;
      }
    }

    settingDiv.appendChild(fontSize);

    return settingDiv;
  }

  createTextAlignmentElement() {
    const settingDiv = this.createSettingDiv('Alinhamento do Texto');

    const createButton = (icon, align) => {
      const iconEle = document.createElement('i');
      iconEle.className = `ms-Icon ms-Icon--${icon}`

      const iconContainer = document.createElement('div');
      iconContainer.className = 'center';
      iconContainer.appendChild(iconEle)

      const button = document.createElement('fluent-button');
      button.onclick = () => {
        this.textAlign = align
        this.updateLeftPosition(0);

        this.textAlignElements.left.classList.remove('selected-button')
        this.textAlignElements.center.classList.remove('selected-button')
        this.textAlignElements.right.classList.remove('selected-button')

        button.classList.add('selected-button');
      };
      button.appendChild(iconContainer);

      return button;
    }

    const posDiv = document.createElement('div');
    posDiv.className = 'position-group';

    const leftAlignButton = createButton('AlignLeft', 'left');
    this.textAlignElements.left = leftAlignButton;
    leftAlignButton.classList.add('selected-button')
    posDiv.appendChild(leftAlignButton);

    const centerAlignButton = createButton('AlignCenter', 'center');
    this.textAlignElements.center = centerAlignButton;
    posDiv.appendChild(centerAlignButton);

    const rightAlignButton = createButton('AlignRight', 'right');
    this.textAlignElements.right = rightAlignButton;
    posDiv.appendChild(rightAlignButton);

    settingDiv.appendChild(posDiv);

    return settingDiv;
  }

  updateTopPosition = (diff) => {
    this.topPos += diff;
    if (this.textElement) {
      this.textElement.style.top = `${this.topPos}px`;
    }
  }

  updateLeftPosition = (diff) => {
    this.leftPos += diff;
    if (this.textElement) {
      const { width } = this.textElement.getBoundingClientRect();
      let leftPos = this.leftPos;
      switch (this.textAlign) {
        case 'center': {
          leftPos -= width / 2;
          break;
        }
        case 'right': {
          leftPos -= width;
          break;
        }
      }
      this.textElement.style.left = `${leftPos}px`;
    }
  }

  createButtonPressAndHold(button, speed, callback) {
    let time;
    let start = 500;

    const repeat = () => {
      callback();
      time = setTimeout(repeat, start);
      start = start / speed;
    }

    button.onmousedown = () => {
      repeat();
    }

    button.onmouseup = () => {
      clearTimeout(time);
      start = 500;
    }
  }

  createFontPositionElement() {
    const settingDiv = this.createSettingDiv('Posição Fonte');

    const topIcon = document.createElement('i');
    topIcon.className = 'ms-Icon ms-Icon--ChevronUp'

    const topIconContainer = document.createElement('div');
    topIconContainer.className = 'center';
    topIconContainer.appendChild(topIcon)

    const topButton = document.createElement('fluent-button');
    this.createButtonPressAndHold(topButton, 50, () => this.updateTopPosition(-1));
    topButton.appendChild(topIconContainer);

    const botIcon = document.createElement('i');
    botIcon.className = 'ms-Icon ms-Icon--ChevronDown'

    const botIconContainer = document.createElement('div');
    botIconContainer.className = 'center';
    botIconContainer.appendChild(botIcon)

    const botButton = document.createElement('fluent-button');
    this.createButtonPressAndHold(botButton, 50, () => this.updateTopPosition(1));
    botButton.appendChild(botIconContainer);

    const leftIcon = document.createElement('i');
    leftIcon.className = 'ms-Icon ms-Icon--ChevronLeft'

    const leftIconContainer = document.createElement('div');
    leftIconContainer.className = 'center';
    leftIconContainer.appendChild(leftIcon)

    const leftButton = document.createElement('fluent-button');
    this.createButtonPressAndHold(leftButton, 50, () => this.updateLeftPosition(-1));
    leftButton.appendChild(leftIconContainer);

    const rightIcon = document.createElement('i');
    rightIcon.className = 'ms-Icon ms-Icon--ChevronRight'

    const rightIconContainer = document.createElement('div');
    rightIconContainer.className = 'center';
    rightIconContainer.appendChild(rightIcon)

    const rightButton = document.createElement('fluent-button');
    this.createButtonPressAndHold(rightButton, 50, () => this.updateLeftPosition(1));
    rightButton.appendChild(rightIconContainer);

    const posDiv = document.createElement('div');
    posDiv.className = 'position-group';

    posDiv.appendChild(topButton);
    posDiv.appendChild(botButton);
    posDiv.appendChild(leftButton);
    posDiv.appendChild(rightButton);

    settingDiv.appendChild(posDiv);

    return settingDiv;
  }

  clearFontFamilySelector() {
    if (this.selectorElement) {
      for (const option of this.selectorElement.childNodes) {
        this.selectorElement.removeChild(option);
      }
    }
  }

  updateFontFamily = () => {
    if (this.selectorElement && this.textElement) {
      const idx = this.selectorElement.selectedIndex;
      this.selectedFont = this.selectorElement.options[idx].value;

      this.textElement.style.fontFamily = this.selectedFont;
    }
  }

  addFontFamilies(fontFamilies) {
    for (const font of fontFamilies) {
      this.availableFonts.add(font);
    }
    this.updateFontFamilyOptions();
  }

  updateFontFamilyOptions(availableFonts = [...this.availableFonts]) {
    this.clearFontFamilySelector();

    if (this.selectorElement) {
      for (const font of availableFonts) {
        const fontOption = document.createElement('fluent-option');
        fontOption.innerHTML = font;
        if (font === this.selectedFont) {
          fontOption.attributes.setNamedItem(this.createAttribute('selected', ''))
        }

        fontOption.attributes.setNamedItem(this.createAttribute('value', font));

        this.selectorElement.appendChild(fontOption);
      }
    }
  }

  createFontFamilySelector() {
    const settingDiv = this.createSettingDiv('Família Fonte');

    this.selectorElement = document.createElement('fluent-select');
    this.updateFontFamilyOptions();

    this.selectorElement.onchange = () => this.updateFontFamily()

    settingDiv.appendChild(this.selectorElement);

    return settingDiv;
  }

  getText() {
    return this.text;
  }
}