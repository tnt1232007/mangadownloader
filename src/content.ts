import { AppRequest } from "./app/model/app-request";
import { AppImage } from './app/model/app-image';

chrome.runtime.onMessage.addListener((request: AppRequest, _sender, _sendResponse) => {
  if (request.method === 'xhr-download' && request.value) {
    const image: AppImage = request.value;
    const xhr = new XMLHttpRequest();
    console.log(image);
    xhr.responseType = 'blob';
    xhr.addEventListener('load', _ => {
      if (xhr.status === 200) {
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('inline') !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            image.name = matches[1].replace(/['"]/g, '');
          }
        }
        image.data = URL.createObjectURL(xhr.response);
        chrome.runtime.sendMessage({ method: 'blob-download', value: image });
      }
    });
    xhr.open('GET', image.src, true);
    xhr.send();
  }
});