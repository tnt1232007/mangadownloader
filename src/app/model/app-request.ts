export interface AppRequest {
    method: 'tabsChanged' | 'init' | 'downloadNew' | 'abortOngoing' | 'clearHistory' | 'dl-xhr-via-content' | 'dl-blob-via-background';
    value: any
}
