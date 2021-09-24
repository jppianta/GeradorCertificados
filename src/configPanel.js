const { TextConfig } = window;

window.ConfigPanel = class ConfigPanel {
  constructor() {
    this.fontInput = document.getElementById('font-input');
    this.addFontButton = document.getElementById('add-font');
    this.toogleButton = document.getElementById('settings-button');
    this.panel = document.getElementById('settings');
    this.exportButton = document.getElementById('export');
    this.settingsAccordion = document.getElementById('settings-accordion');
    this.addButton = document.getElementById('add-button');

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

      }
    }
  }
}