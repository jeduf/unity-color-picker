# Unity Color Picker

![Marketplace Version](https://img.shields.io/vscode-marketplace/v/KadirTabak.unity-color-picker)
![Installs](https://img.shields.io/visual-studio-marketplace/i/KadirTabak.unity-color-picker)
![License](https://img.shields.io/github/license/jeduf/unity-color-picker.svg)

**Unity Color Picker** is a Visual Studio Code extension that provides an interactive color picker for various color formats used in Unity projects. It enhances your coding workflow by offering intuitive color previews and easy editing capabilities directly within your code editor.

## 📦 Features

- **Multiple Color Formats**:
  - **Unity Color**: `new Color(r, g, b, a)` (Alpha values are optional)
  - **Unity Color32**: `new Color32(r, g, b, a)` (with values ranging from 0 to 255)
  - **Preset Colors**: `Color.red`, `Color.green`, `Color.blue`, etc.

- **Inline Color Decorations**: Displays color swatches next to color definitions in your code.
- **Native Color Picker Integration**: Click on a swatch to open VSCode’s built-in color picker for easy color adjustments.
- **Optional Background Color**: Adds a background color decoration behind detected colors, configurable via settings.

## 🛠 Usage

1. **Open a Supported File**: Open any C# file (`.cs`) containing Unity color definitions.

   ```csharp
   using UnityEngine;

   public class TestColor
   {
       void Start()
       {
           // Using new Color constructor
           Color myColor = new Color(0.3f, 0.3f, 0.3f, 1f);

           // Using Color32 constructor
           Color32 myColor32 = new Color32(76, 153, 0, 255);

           // Using preset color
           Color presetColor = Color.red;
       }
   }
2. View Color Decorations: The extension automatically detects color values and displays a color swatch beside each color definition.

3. Edit Colors:

    - Using Native Picker: Click on the color swatch to open VSCode’s native color picker. Adjust the color as desired, and the color value in your code will update in real-time.

## 🔧 Configuration

### Enable/Disable Background Color Decoration

You can toggle the background color decoration using the following setting:

- **Setting Name**: `unityColorPicker.showBackgroundColor`
- **Default**: `false`

#### How to Change the Setting

1. **Open Settings**:
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (macOS).
   - Or, go to **File > Preferences > Settings**.

2. **Search for `unityColorPicker.showBackgroundColor`**.

3. **Toggle the Setting**:
   - Set to `true` to enable background color decorations.
   - Set to `false` to disable background color decorations.

#### Example `settings.json` Entry

```json
{
  "unityColorPicker.showBackgroundColor": true
}
```

## 🧾 License

This project is licensed under the MIT License.

## 🤝 Contributing

This extension will not be actively improved or updated with new features unless it breaks due to changes in VSCode or Unity. If you would like to see new features or improvements, I highly encourage you to fork the repository and make changes as needed. You can find the repository on my [GitHub profile](https://github.com/jeduf).

## 📫 Support

For support, please open an issue on the [GitHub repository](https://github.com/jeduf/unity-color-picker/issues).

