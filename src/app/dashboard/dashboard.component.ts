/// <reference types='chrome'/>

import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { AppTab } from '../model/app-tab';
import { AppImage } from '../model/app-image';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: []
})
export class DashboardComponent implements OnInit {
  @ViewChild('t') tabSet: NgbTabset;
  ongoingTabs: AppTab[] = [];
  newTabs: AppTab[] = [];
  completedTabs: AppTab[] = [];

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    chrome.storage.local.get(['history'], result => this.ngZone.run(() => this.completedTabs = result['history'] || []));

    chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
      if (request.method === 'tabsChanged' && request.value) {
        const tabs: AppTab[] = request.value;
        this.ngZone.run(() => {
          this.newTabs = this.newTabs.filter((tab: AppTab) => !tabs.some((tab_: AppTab) => tab_.id === tab.id));
          this.ongoingTabs = tabs.filter((tab: AppTab) => !(tab.progress && tab.progress.loaded === tab.progress.total));
          this.completedTabs = tabs.filter((tab: AppTab) => tab.progress && tab.progress.loaded === tab.progress.total);
          chrome.storage.local.set({ 'history': this.completedTabs });
        });
      }
    });

    //TODO: configurable .filter(file => file.height > 300 && file.width > 300), w-h sometimes 0
    const sizeFilter = (image: AppImage) => image.height === 0 || image.width === 0 || (image.height > 300 && image.width > 300);
    const extFilter = (image: AppImage) => ['png', 'jpg', 'jpeg', 'bmp'].some(v => image.src.endsWith(v));
    chrome.tabs.query({ currentWindow: true }, tabs => {
      this.ngZone.run(() => this.newTabs = tabs
        .filter(tab => !!tab.url)
        .filter(tab => tab.url.startsWith('http') || tab.url.startsWith('https'))
        .map(tab => new AppTab(tab)));
      for (let i = 0; i < this.newTabs.length; i++) {
        const tab = this.newTabs[i];
        chrome.tabs.executeScript(tab.id, { file: 'images.js' }, (results: AppImage[][]) => {
          console.log(results);
          this.ngZone.run(() => tab.images = results[0].filter(image => sizeFilter(image) && extFilter(image)));
        });
      }
    });
  }

  submit(_form: NgForm) {
    const tabs = this.newTabs.filter(tab => tab.selected);
    chrome.runtime.sendMessage({ method: 'download', value: tabs });
    this.tabSet.select('ongoingTab');
  }

  clear() {
    chrome.runtime.sendMessage({ method: 'clear' });
    this.ongoingTabs = [];
    this.completedTabs = [];
  }
}
