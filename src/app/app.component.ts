import { Component, ElementRef, ViewChild } from '@angular/core';
import { FileDesc, GcsServiceService } from './service/gcs-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'local-gcs-admin';
  buckets = ['apple', 'banana', 'orange'];
  fileLists: FileDesc[] = [];
  currentPaths: CurrentPath[] = [];
  selectedBucket: string = '';
  @ViewChild('fileInputRef') fileInputRef!: ElementRef;
  newPath: string = '';

  constructor(private _gcsService: GcsServiceService) {
    this._gcsService.getAllBuckets().subscribe((res) => {
      this.buckets = res;
    });
    this._gcsService.getCurrentPath().subscribe((res) => {
      this.currentPaths = res;
    });
  }

  selectBucket(bucketIdx: number): void {
    this._gcsService.reLoadCurrentPath();
    this.selectedBucket = this.buckets[bucketIdx];
    this._gcsService.fetchFilesByBucket(this.buckets[bucketIdx]);
    this._gcsService.getCurrentFileList().subscribe((res) => {
      this.fileLists = res;
    });
    console.log(
      '选择bucket' + this.currentPaths.map((item) => item.path).join('/')
    );
    // const examplePath: CurrentPath = {
    //   path: '',
    //   active: true,
    // };
    // this.currentPaths.push(examplePath);
  }

  openDir(dir: string): void {
    let afterIdx = this.currentPaths.length;
    const path: CurrentPath = {
      path: dir,
      idx: afterIdx,
      active: true,
    };

    this.currentPaths = this.currentPaths.map((item) => ({
      ...item,
      active: false,
    }));
    this.currentPaths.push(path);
    this._gcsService.searchFilesByBucket(
      this.selectedBucket,
      this.currentPaths.map((item) => item.path).join('/')
    );
    console.log(
      '点击目录' + this.currentPaths.map((item) => item.path).join('/')
    );
  }

  downloadFile(fileName: string): void {
    let tempPathList: CurrentPath[] = [];
    tempPathList = this.currentPaths;
    // const fileNamePure: CurrentPath = {
    //   path: fileName,
    //   idx: 0,
    //   active: true,
    // };
    let targetFileLink = tempPathList.map((item) => item.path).join('/');
    if (targetFileLink) {
      console.log('目标文件：' + targetFileLink.concat('/' + fileName));
      const encodedName = encodeURIComponent(
        targetFileLink.concat('/' + fileName)
      );
      window.location.href = `http://localhost:8099/gcs/downloadFile?bucketName=${this.selectedBucket}&fileName=${encodedName}`;
    } else {
      console.log('目标文件：' + fileName);
      window.location.href = `http://localhost:8099/gcs/downloadFile?bucketName=${this.selectedBucket}&fileName=${fileName}`;
    }
  }

  deleteFile(fileName: string): void {
    let tempPathList: CurrentPath[] = [];
    tempPathList = this.currentPaths;
    let targetFileLink = tempPathList.map((item) => item.path).join('/');
    if (targetFileLink) {
      console.log('删除目标文件：' + targetFileLink.concat('/' + fileName));
      const encodedName = encodeURIComponent(
        targetFileLink.concat('/' + fileName)
      );
      this.doDelete(
        `http://localhost:8099/gcs/delete?bucketName=${this.selectedBucket}&fileName=${encodedName}`
      );
      // window.location.href = `http://localhost:8099/gcs/delete?bucketName=${this.selectedBucket}&fileName=${encodedName}`;
    } else {
      console.log('删除目标文件：' + fileName);
      this.doDelete(
        `http://localhost:8099/gcs/delete?bucketName=${this.selectedBucket}&fileName=${fileName}`
      );
      // window.location.href = `http://localhost:8099/gcs/delete?bucketName=${this.selectedBucket}&fileName=${fileName}`;
    }
    const indexToRemove = this.fileLists.findIndex(
      (item) => item.name === fileName
    );
    if (indexToRemove !== -1) {
      this.fileLists.splice(indexToRemove, 1);
    }
  }
  doDelete(deleteUrl: string): void {
    fetch(deleteUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return null;
      })
      .then((data) => {
        // 处理成功的响应
        console.log('GET request succeeded:', data);
      })
      .catch((error) => {
        // 处理错误
        console.error('GET request failed:', error);
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    // You can also set a default username and path here if needed
    // this.username = 'defaultUsername';
    // this.path = '/default/path';
  }
  uploadFile(): void {
    const fileInput = this.fileInputRef.nativeElement as HTMLInputElement;
    let current = this.currentPaths.length;
    this.currentPaths.push({
      path: this.newPath,
      idx: current,
      active: true,
    });
    if (fileInput.files && this.selectedBucket) {
      const file: File = fileInput.files[0];
      this._gcsService.uploadFile(
        file,
        this.selectedBucket,
        this.currentPaths.map((item) => item.path).join('/')
      );
      const uploadedFile: FileDesc = {
        name: file.name,
        file: false,
      };
      this.fileLists.push(uploadedFile);
    } else {
      alert('请先选择bucket和path');
    }
  }
}

export interface CurrentPath {
  path: string;
  idx: number;
  active: boolean;
}
