export class DragDrogHelper {
  private _document: HTMLElement;
  private _files: Array<{ url: string, type: 'image' | 'video', blob: Blob, id: number }> = [];
  private _isDragging: boolean;

  constructor() {

  }

  private onDragEnter(event: DragEvent) {
    this._isDragging = true;
  }

  private onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.appendFiles(event.dataTransfer.files);
  }

  private onDragEnd(event: DragEvent) {
    this._isDragging = false;
  }

  private onDragLeave(event: DragEvent) {
    this._isDragging = false;
  }


  private onDragOver(event: DragEvent) {
    this._isDragging = true;
    event.preventDefault();
  }

  private clicked(event) {
    const el = this._document.querySelector('input[type=file]') as HTMLElement;
    el.click();
  }

  private appendFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!(file.type.indexOf('image') > -1 || file.type.indexOf('video') > -1)) {
        continue;
      }

      this._files.push({
        url: URL.createObjectURL(file),
        blob: file,
        id: Math.random(),
        type: file.type.split('/')[0]
      });
    }
  }

  private fileChanged(event: any) {
    this.appendFiles(event.target.files);

  }

  /**
   * adding some drag and drop event listeners
   */
  private addEventListeners() {
    this._document.addEventListener('dragover', (e: DragEvent) => this.onDragOver(e));

    this._document.addEventListener('dragleave', (e: DragEvent) => this.onDragLeave(e));

    this._document.addEventListener('odragend', (e: DragEvent) => this.onDragEnd(e));


    this._document.addEventListener('drop', (e: DragEvent) => this.onDrop(e));

    this._document.addEventListener('dragenter', (e: DragEvent) => this.onDragEnter(e));

    this._document.addEventListener('click', (e: any) => this.clicked(e));

    this._document.childNodes.forEach((value: any) => {
      if (value.attributes.getNamedItem('type')) {
        value.addEventListener('change', (event: any) => this.fileChanged(event));
      }
    })

  }


  clean() {
    this._files = [];
    const file: HTMLInputElement = this._document.querySelector('input[type=file]');
    if (file) {
      file.value = '';
    }
  }

  /**
   * remove files using the index
   */

  public removeIndex(index: number) {
    this._files.splice(index, 1);
  }

  public setup() {
    this.addEventListeners();
  }


  set document(value: HTMLElement) {
    this._document = value;
  }

  get files(): Array<{ url: string, blob: Blob }> {
    return this._files;
  }

  get isDragging(): boolean {
    return this._isDragging;
  }
}
