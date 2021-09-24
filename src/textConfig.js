window.TextConfig = class TextConfig {
  constructor(imageElement) {
    this.imageElement = imageElement;
    this.textElement = null;
    this.headingElement = null;
    this.selectorElement = null;
    this.text = 'Nome Exemplo';
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
    this.setNameElement();

    const settingsGroup = this.createAccordionItem();

    settingsGroup.appendChild(this.createTextInputElement());
    settingsGroup.appendChild(this.createFontSizeElement());
    settingsGroup.appendChild(this.createFontPositionElement());
    settingsGroup.appendChild(this.createFontFamilySelector());

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

  setNameElement() {
    const nameElement = document.createElement('span');
    nameElement.className = 'name';
    nameElement.innerHTML = this.text;

    this.imageElement.appendChild(nameElement);
    this.textElement = nameElement;
  }

  createTextInputElement() {
    const settingDiv = this.createSettingDiv('Texto');

    const textInput = document.createElement('fluent-text-area');
    textInput.attributes.setNamedItem(this.createAttribute('placeholder', this.text))

    textInput.oninput = () => {
      this.text = textInput.value;

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

  createFontPositionElement() {
    const settingDiv = this.createSettingDiv('Posição Fonte');

    const updateTopPosition = (diff) => {
      this.topPos += diff;
      if (this.textElement) {
        this.textElement.style.top = `${50 + this.topPos}%`;
      }
    }

    const topIcon = document.createElement('i');
    topIcon.className = 'ms-Icon ms-Icon--ChevronUp'

    const topIconContainer = document.createElement('div');
    topIconContainer.className = 'center';
    topIconContainer.appendChild(topIcon)

    const topButton = document.createElement('fluent-button');
    topButton.onclick = () => updateTopPosition(-1);
    topButton.appendChild(topIconContainer);

    const botIcon = document.createElement('i');
    botIcon.className = 'ms-Icon ms-Icon--ChevronDown'

    const botIconContainer = document.createElement('div');
    botIconContainer.className = 'center';
    botIconContainer.appendChild(botIcon)

    const botButton = document.createElement('fluent-button');
    botButton.onclick = () => updateTopPosition(1);
    botButton.appendChild(botIconContainer);

    const updateLeftPosition = (diff) => {
      this.leftPos += diff;
      if (this.textElement) {
        this.textElement.style.left = `${50 + this.leftPos}%`;
      }
    }

    const leftIcon = document.createElement('i');
    leftIcon.className = 'ms-Icon ms-Icon--ChevronLeft'

    const leftIconContainer = document.createElement('div');
    leftIconContainer.className = 'center';
    leftIconContainer.appendChild(leftIcon)

    const leftButton = document.createElement('fluent-button');
    leftButton.onclick = () => updateLeftPosition(-1);
    leftButton.appendChild(leftIconContainer);

    const rightIcon = document.createElement('i');
    rightIcon.className = 'ms-Icon ms-Icon--ChevronRight'

    const rightIconContainer = document.createElement('div');
    rightIconContainer.className = 'center';
    rightIconContainer.appendChild(rightIcon)

    const rightButton = document.createElement('fluent-button');
    rightButton.onclick = () => updateLeftPosition(1);
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
}