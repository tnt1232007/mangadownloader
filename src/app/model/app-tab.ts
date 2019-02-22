/// <reference types="chrome"/>

export class AppTab {
  index: number;
  id: number;
  title: string;
  url: string;
  selected: boolean;
  progress: ProgressEventInit;

  constructor(tab: chrome.tabs.Tab) {
    this.id = tab.id;
    this.title = tab.title;
    this.url = tab.url;
    this.selected = true;
  }
}