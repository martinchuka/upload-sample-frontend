import {Injectable} from "@angular/core";
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpRequest} from "@angular/common/http";
import {Observable, throwError} from "rxjs/index";
import {catchError, filter, map} from "rxjs/internal/operators";
import {AppConfiguration} from "./api.config";
@Injectable({
  providedIn: 'root'
})


export class ApiProvider {
  private _header: any = {};
  private _requestType: 'get' | 'post' | 'delete' | 'update';
  private _url: string;
  private _progress = 0;
  private _loading: boolean;
  private _responseType: "text" | "blob" | "arraybuffer" | "json" = 'json';
  private _shouldAuthenticate: boolean;

  constructor(private http: HttpClient) {
  }


  private buildUrl() {
    return this._url.startsWith('http') ? this._url : (AppConfiguration.url + this._url);
  }

  private addAuthorization() {
    this.appendHeader('Authorization', '');
  }


  public getUrl(body: any): Observable<any> {
    this._progress = 0;

    if (!this._url || !this._url) {
      return throwError({});
    }
    if (this._shouldAuthenticate) {
      this.addAuthorization();
    }
    const option = {headers: new HttpHeaders(this._header), responseType: this._responseType, reportProgress: true};
    if (this._requestType === 'delete' || this._requestType === 'get') {
      body = option;
    }
    this._loading = true;
    this._progress = 0;
    const req = new HttpRequest(this._requestType.toUpperCase(), this.buildUrl(), body, option);

    return this.http.request(req).pipe(
      filter((event: HttpEvent<any>, index: number) => {
        return this.getEventMessage(event);

      }),
      map((res: any) => {
        this._loading = true;
        return res;
      }),
      catchError((error: any, caught: Observable<any>) => {
        this._loading = false;
        let dat = error;
        if (dat && dat.error) {
          dat = error.error;
        }
        return throwError(dat);
      })
    );
  }


  private getEventMessage(event: HttpEvent<any>): boolean {
    if (event.type === HttpEventType.Sent) {
      this._progress = 0;
    } else if (event.type === HttpEventType.UploadProgress) {
      this._progress = Math.round((100 * event.loaded) / event.total);
    } else if (event.type === HttpEventType.Response) {
      this._progress = 100;
    }

    if (event.type === HttpEventType.Response) {
      return true;
    }


  }


  set header(value: any) {
    this._header = value;
  }

  set requestType(value) {
    this._requestType = value;
  }

  set url(value: string) {
    this._url = value;
  }

  set responseType(value: "text" | "blob" | "arraybuffer" | "json") {
    this._responseType = value;
  }

  set shouldAuthenticate(value: boolean) {
    this._shouldAuthenticate = value;
  }

  public appendHeader(type: string, value: string | undefined) {
    if (type && type.length && value && value.length) {
      this._header[type] = value;
    }
  }

  get progress(): number {
    return this._progress;
  }

  get loading(): boolean {
    return this._loading;
  }
}
