import {
  IconDefinition,
  faFile,
  faFileArchive,
  faFileAudio,
  faFileCode,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faFilePowerpoint,
  faFileText,
  faFileVideo,
  faFileWord,
  faImage,
} from '@fortawesome/free-solid-svg-icons'

const extensionsToIcon : Record<string, IconDefinition> = {
  gif: faImage,
  jpeg: faImage,
  jpg: faImage,
  png: faImage,

  pdf: faFilePdf,

  doc: faFileWord,
  docx: faFileWord,

  ppt: faFilePowerpoint,
  pptx: faFilePowerpoint,

  xls: faFileExcel,
  xlsx: faFileExcel,

  csv: faFileCsv,

  aac: faFileAudio,
  mp3: faFileAudio,
  ogg: faFileAudio,
  wav: faFileAudio,

  avi: faFileVideo,
  flv: faFileVideo,
  mkv: faFileVideo,
  mp4: faFileVideo,

  gz: faFileArchive,
  zip: faFileArchive,

  css: faFileCode,
  html: faFileCode,
  js: faFileCode,

  txt: faFileText,
}

export default function getFAIconFromExtension(key: string) {
  const extWithoutDot = key.startsWith('.') ? key.slice(1) : key
  if (extWithoutDot in extensionsToIcon) {
    return extensionsToIcon[extWithoutDot]
  }
  return faFile
}
