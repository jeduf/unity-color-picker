import * as vscode from 'vscode';

// Mapping of preset Unity colors to their RGBA values
const presetColors: { [key: string]: vscode.Color } = {
  black: new vscode.Color(0, 0, 0, 1),
  blue: new vscode.Color(0, 0, 1, 1),
  clear: new vscode.Color(0, 0, 0, 0),
  cyan: new vscode.Color(0, 1, 1, 1),
  gray: new vscode.Color(0.5, 0.5, 0.5, 1),
  green: new vscode.Color(0, 1, 0, 1),
  grey: new vscode.Color(0.5, 0.5, 0.5, 1),
  magenta: new vscode.Color(1, 0, 1, 1),
  red: new vscode.Color(1, 0, 0, 1),
  white: new vscode.Color(1, 1, 1, 1),
  yellow: new vscode.Color(1, 1, 0, 1),
};

// Map to store decoration types for each unique color
const decorationTypeMap: Map<string, vscode.TextEditorDecorationType> = new Map();

// Debounce timeout
let timeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Register the color provider for C# files
  const colorProvider = vscode.languages.registerColorProvider(
    { language: 'csharp' },
    new UnityColorProvider()
  );

  context.subscriptions.push(colorProvider);

  // Update decorations when the active editor changes or document changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(scheduleUpdateDecorations),
    vscode.workspace.onDidChangeTextDocument(e => {
      if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
        scheduleUpdateDecorations();
      }
    }),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('unityColorPicker.showBackgroundColor')) {
        scheduleUpdateDecorations();
      }
    })
  );

  // Initial update
  scheduleUpdateDecorations();
}

export function deactivate() {
  // Dispose all decoration types when the extension is deactivated
  decorationTypeMap.forEach(decorationType => decorationType.dispose());
}

class UnityColorProvider implements vscode.DocumentColorProvider {
  /**
   * Provides color information for all colors found in the document.
   * Supports:
   * - new Color(r, g, b, a)
   * - new Color(r, g, b)  // Alpha is optional and defaults to 1
   * - new Color32(r, g, b, a)
   * - Preset colors like Color.red, Color.green, etc.
   */
  async provideDocumentColors(document: vscode.TextDocument): Promise<vscode.ColorInformation[]> {
    const text = document.getText();
    const results: vscode.ColorInformation[] = [];

    // Regex patterns
    const newColorRegex = /new\s+Color\s*\(\s*([\d.]+)f?\s*,\s*([\d.]+)f?\s*,\s*([\d.]+)f?(?:\s*,\s*([\d.]+)f?)?\s*\)/g;
    const color32Regex = /new\s+Color32\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:\s*,\s*(\d{1,3})\s*)?\)/g;
    const presetColorRegex = /Color\.(\w+)/g;

    let match: RegExpExecArray | null;

    // Match new Color(r, g, b, a) or new Color(r, g, b)
    while ((match = newColorRegex.exec(text))) {
      const [fullMatch, rStr, gStr, bStr, aStr] = match;
      const r = parseFloat(rStr);
      const g = parseFloat(gStr);
      const b = parseFloat(bStr);
      const a = aStr !== undefined ? parseFloat(aStr) : 1; // Default alpha to 1 if not provided

      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + fullMatch.length)
      );

      const color = new vscode.Color(r, g, b, a);
      results.push(new vscode.ColorInformation(range, color));

      console.log(`Detected new Color: ${fullMatch} at ${range.start.line}:${range.start.character}`);
    }

    // Match new Color32(r, g, b, a)
    while ((match = color32Regex.exec(text))) {
      const [fullMatch, rStr, gStr, bStr, aStr] = match;
      const r = parseInt(rStr, 10) / 255;
      const g = parseInt(gStr, 10) / 255;
      const b = parseInt(bStr, 10) / 255;
      const a = aStr !== undefined ? parseInt(aStr, 10) / 255 : 1; // Default alpha to 1 if not provided

      const range = new vscode.Range(
        document.positionAt(match.index),
        document.positionAt(match.index + fullMatch.length)
      );

      const color = new vscode.Color(r, g, b, a);
      results.push(new vscode.ColorInformation(range, color));

      console.log(`Detected new Color32: ${fullMatch} at ${range.start.line}:${range.start.character}`);
    }

    // Match preset colors like Color.red, Color.green, etc.
    while ((match = presetColorRegex.exec(text))) {
      const [fullMatch, colorName] = match;
      const lowerColorName = colorName.toLowerCase();

      if (presetColors.hasOwnProperty(lowerColorName)) {
        const color = presetColors[lowerColorName];
        const range = new vscode.Range(
          document.positionAt(match.index),
          document.positionAt(match.index + fullMatch.length)
        );

        results.push(new vscode.ColorInformation(range, color));

        console.log(`Detected preset Color: ${fullMatch} at ${range.start.line}:${range.start.character}`);
      } else {
        console.warn(`Unknown preset Color: ${fullMatch} at index ${match.index}`);
      }
    }
    return results;
  }

  /**
   * Provides color presentations for the given color.
   * Converts the color back to the new Color(r, g, b, a) format.
   */
  provideColorPresentations(color: vscode.Color): vscode.ProviderResult<vscode.ColorPresentation[]> {
    const r = color.red.toFixed(3);
    const g = color.green.toFixed(3);
    const b = color.blue.toFixed(3);
    const a = color.alpha.toFixed(3);
    const presentation = new vscode.ColorPresentation(`new Color(${r}f, ${g}f, ${b}f, ${a}f)`);
    return [presentation];
  }
}

/**
 * Schedule decoration updates with debouncing to optimize performance.
 */
function scheduleUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(updateDecorations, 100); // Adjust the delay as needed
}

/**
 * Update decorations based on the current settings and detected colors.
 */
async function updateDecorations() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const provider = new UnityColorProvider();

  // Get the user's setting for background color decoration
  const config = vscode.workspace.getConfiguration('unityColorPicker');
  const showBackground = config.get<boolean>('showBackgroundColor', true);

  if (!showBackground) {
    // If background color decoration is disabled, clear all decorations
    decorationTypeMap.forEach(decorationType => editor.setDecorations(decorationType, []));
    return;
  }

  // Await the result of provideDocumentColors
  const colorInfos = await provider.provideDocumentColors(document);

  if (!colorInfos) {
    return;
  }

  // Temporary set to track which decoration types are still needed
  const activeColors = new Set<string>();

  // Clear all current decorations before applying new ones
  decorationTypeMap.forEach((decorationType, color) => {
    editor.setDecorations(decorationType, []);
  });

  // Group ranges by color to minimize setDecorations calls
  const decorationsByColor: Map<string, vscode.Range[]> = new Map();

  for (const info of colorInfos) {
    const { range, color } = info;
    // Set a fixed alpha (e.g., 0.3) for all background colors
    const cssColor = toCssColor(color, 0.3);

    activeColors.add(cssColor);

    if (!decorationsByColor.has(cssColor)) {
      decorationsByColor.set(cssColor, []);
    }
    decorationsByColor.get(cssColor)!.push(range);
  }

  decorationsByColor.forEach((ranges, cssColor) => {
    let decorationType = decorationTypeMap.get(cssColor);
    if (!decorationType) {
      // Create a new decoration type for this color
      decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: cssColor,
        // Optional: Add other styling properties as needed
        // e.g., border: '1px solid #000000'
      });
      decorationTypeMap.set(cssColor, decorationType);
    }
    // Apply the decoration to all ranges of this color
    editor.setDecorations(decorationType, ranges);
  });

  // Dispose decoration types that are no longer needed
  decorationTypeMap.forEach((decorationType, color) => {
    if (!activeColors.has(color)) {
      decorationType.dispose();
      decorationTypeMap.delete(color);
    }
  });
}

/**
 * Convert vscode.Color to a CSS color string with desired opacity.
 * @param color The vscode.Color object.
 * @param fixedAlpha Optional fixed alpha value to apply.
 * @returns A CSS color string (e.g., 'rgba(255, 0, 0, 0.3)').
 */
function toCssColor(color: vscode.Color, fixedAlpha?: number): string {
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  // If fixedAlpha is provided, use it; otherwise, use the color's alpha
  const a = fixedAlpha !== undefined ? fixedAlpha.toFixed(2) : color.alpha.toFixed(2);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
