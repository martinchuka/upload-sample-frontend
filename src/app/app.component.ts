import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { DragDrogHelper } from './dropDrop.helper';
import {FormControl} from "@angular/forms";
import {ApiProvider} from "./api.provider";
import {Subscription} from "rxjs/index";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  implements OnInit, AfterViewInit{
  private dragInstance: DragDrogHelper;
  @ViewChild('el', { static: false })
  el: ElementRef<HTMLElement>;
  public uploading: boolean = false;

  public channel: FormControl;



  constructor(private apiProvider: ApiProvider, private changeDetector: ChangeDetectorRef){

  }

  private getChannel(){
    switch((this.channel.value | 0)){
      case 1:
        return 'CLOUDINARY';
        break;
      case 2:
        return 'FILESYSTEM';
        break;
      case 3:
        return 'S3';
        break;
      default:
        return 'S3';
    }
  }
  ngAfterViewInit(){
    this.dragInstance.document = this.el.nativeElement;
    this.dragInstance.setup();
  }

  ngOnInit(){

    this.channel = new FormControl(1);

    this.channel.setValue(1);

    this.dragInstance = new DragDrogHelper();

  }

  get files(): Array<{url: string, blob: Blob}>{
    return this.dragInstance.files;
  }

  get isDragging(): boolean{
    return this.dragInstance.isDragging;
  }


  public removeFile(index){
    this.dragInstance.removeIndex(index);
  }


  public async startUploading(){
    this.apiProvider.url = this.getChannel();
    this.apiProvider.requestType = 'post';
    this.apiProvider.shouldAuthenticate = false;
    this.apiProvider.appendHeader('Content-Type', undefined);
    this.uploading = true;

    for(let i = 0; i < this.dragInstance.files.length; i++){
      await new Promise((resolve, reject) =>{
        const form = new FormData();
        form.append('file', this.dragInstance.files[i].blob);
        const subscription: Subscription = this.apiProvider.getUrl(form).subscribe({
            next: (r: any) => {
              console.log(r);
              resolve(r);
            },
            error: (error: any) => {
              reject(error);
            },
            complete: () =>{
              subscription.unsubscribe();
            }
          })
      })
    }

    this.dragInstance.clean();
    this.uploading = false;
  }


  get progressBar(): number{
    return this.apiProvider.progress;
  }
}
