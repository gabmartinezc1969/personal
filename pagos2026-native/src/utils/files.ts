import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Escribe un archivo en el directorio de documentos y abre la hoja nativa de
// compartir/guardar (equivalente al <a download> de la versión web).
export async function shareTextFile(filename: string, content: string, mimeType: string): Promise<void> {
  const uri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: 'utf8' });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
  }
}

export async function pickJsonFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const uri = result.assets[0].uri;
  return FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
}
