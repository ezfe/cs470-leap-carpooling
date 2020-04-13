export default function getMeta(metaName) {
  for (const meta of document.getElementsByTagName('meta')) {
    if (meta.getAttribute('name') === metaName) {
      return meta.getAttribute('content');
    }
  }

  return '';
}