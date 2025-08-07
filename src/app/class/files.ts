export class Files {
  fileID: number;
  fileName: string;
  fileType: string;
  fileUrl: string;

  constructor(
    fileName: string,
    fileType: string,
    fileUrl: string,
    fileID: number = 0
  ) {
    this.fileID = fileID;
    this.fileName = fileName;
    this.fileType = fileType;
    this.fileUrl = fileUrl;
  }
}