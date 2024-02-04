import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CurrentPath } from '../app.component';

@Injectable({
  providedIn: 'root',
})
export class GcsServiceService {
  private _BaseURL = 'http://localhost:8099';

  tempList: string[] = ['apple', 'banana', 'orange'];

  private reqJson = {
    bucketName: '',
    prefix: '',
    fileName: '',
  };
  private currentPath: BehaviorSubject<CurrentPath[]> = new BehaviorSubject<
    CurrentPath[]
  >([]);
  private currentFileList: BehaviorSubject<FileDesc[]> = new BehaviorSubject<
    FileDesc[]
  >([]);
  private buckets: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(
    []
  );
  constructor(private _http: HttpClient) {
    this._http
      .get<string[]>(`${this._BaseURL}/gcs/buckets`)
      .subscribe((res) => {
        this.buckets.next(res);
      });
  }

  fetchFilesByBucket(bucketName: string): void {
    this.reqJson.bucketName = bucketName;
    this._http
      .post<FileDesc[]>(`${this._BaseURL}/gcs/files`, this.reqJson)
      .subscribe((res) => {
        this.currentFileList.next(res);
        // console.log(res);
      });
  }

  searchFilesByBucket(bucketName: string, prefix: string): void {
    this.reqJson.bucketName = bucketName;
    this.reqJson.prefix = prefix;
    this._http
      .post<FileDesc[]>(`${this._BaseURL}/gcs/searchFiles`, this.reqJson)
      .subscribe((res) => {
        this.currentFileList.next(res);
        // console.log(res);
      });
  }
  uploadFile(file: File, bucketName: string, filePath: string): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucketName', bucketName);
    formData.append('filePath', filePath);

    this._http.post(`${this._BaseURL}/gcs/upload`, formData).subscribe(
      (response: any) => {
        console.log('File uploaded successfully:', response);
      },
      error => {
        console.error('Error uploading file:', error);
      }
    );
  }




  getCurrentFileList(): Observable<FileDesc[]> {
    return this.currentFileList.asObservable();
  }
  getAllBuckets(): Observable<string[]> {
    return this.buckets.asObservable();
  }

  getCurrentPath(): Observable<CurrentPath[]> {
    return this.currentPath.asObservable();
  }

  reLoadCurrentPath(): void {
    this.currentPath.next([]);
  }
}

export interface FileDesc {
  name: string;
  file: boolean;
}
