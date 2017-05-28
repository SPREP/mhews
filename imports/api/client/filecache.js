import md5 from "blueimp-md5";

/* global LocalFileSystem */
/* global FileTransfer */
/* global WebAppLocalServer */

// Cache specified files for the offline use
class FileCacheClass {

  constructor(){
    this.loadMap();
    this.handles = {};
  }

  loadMap(){
    let value = window.localStorage.getItem("file-cache");
    if( value ){
      try{
        this.map = JSON.parse(value);
      }
      catch(e){
        console.error("JSON.parse raised exception "+e);
        value = undefined;
      }
    }
    if(!value){
      this.map = {};
      this.saveMap();
    }
  }

  saveMap(){
    window.localStorage.setItem("file-cache", JSON.stringify(this.map));
  }

  // Add the file specified by the url to the cache.
  // Returns a handle
  add(url){
    check(url, String);

    if( !this.map[url] ){
      this.map[url] = {path: undefined, date: undefined};
    }
    else{
      console.log(JSON.stringify(this.map));
    }

    const handle = new FileCacheHandle(url, this.map[url]);
    this.handles[url] = handle;
    return handle;
  }

  // Get the handle for the URL
  get(url){
    return this.handles[url];
  }

  remove(url){
    this.map[url] = undefined;
    this.handles[url] = undefined;
  }

  onDownload(url, path, downloadDate){
    this.map[url] = {path: path, date: downloadDate.toDate()};
    this.saveMap();
  }
}

class FileCacheHandle {

  constructor(url, mapEntry){
    console.log("mapEntry = "+JSON.stringify(mapEntry));
    this.url = url;
    this.path = mapEntry.path;
    this.date = mapEntry.date;

    this.startDownload = this.startDownload.bind(this);

    this.needDownload = new ReactiveVar(false);

    if( typeof LocalFileSystem == 'undefined' ){
      this.source = new ReactiveVar(url);
    }
    else{
      this.source = new ReactiveVar(this.path ? WebAppLocalServer.localFileSystemUrl(this.path) : undefined);
      Tracker.autorun(this.startDownload);
    }
  }

  // Return the URL that can be used by a view component (e.g. img tag)
  // This function is reactive. Updated when the connectivity has changed
  getSource(){
    console.log("getSource returns "+this.source.get());
    return this.source.get();
  }

  refresh(){
    this.needDownload.set(true);
  }

  // Rerun when the connectivity status changes to Connected.
  startDownload(){
    if( Meteor.status().connected && this.needDownload.get()){
      this.download();
      this.needDownload.set(false);
    }
  }

  download(){
    if( this.downloading ) return;

    this.downloading = true;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fileSystem)=>{

      // FIXME:
      // fileSystem.root returns two different paths:
      // 1) /local-filesystem/data/data/...
      // 2) file:///data/data/
      // 2) is not readable by the image tag due to cross-domain origin restriction.
      const path = fileSystem.root.toURL() + md5(this.url) + getFileName(this.url);
      console.log("download destination = "+path);
      console.log("Last download date ="+this.date);
      console.log("If-Modified-Since header = "+ getIfModifiedSinceHeader(this.date));
      const downloadDate = moment();

      // Adjustment for the daylight saving tiem
      if( downloadDate.isDST() ){
        downloadDate.subtract(1, 'hours');
      }

      var fileTransfer = new FileTransfer();
      fileTransfer.download(
        this.url,
        path,
        (entry)=>{
          console.log("Downloaded: "+this.url+" to "+entry.toURL());
          this.date = downloadDate;
          // WebAppLocalServer.localFileSystemUrl converts the "file:" URL to "http://localhost" URL.
          // The http localhost URL contains a port number, which may vary between runs.
          // So, in the FileCache we store the file URL, while the http URL must be set to the source.
          this.source.set(WebAppLocalServer.localFileSystemUrl(path));
          FileCache.onDownload(this.url, path, downloadDate);
          this.downloading = false;
        },
        (error)=>{
          if( error.http_status == 304 ){
            // Cached content is up to date. Nothing to do.
          }
          else{
            console.log("Download failed: "+this.url+". Error = "+JSON.stringify(error));
          }
          this.downloading = false;
        },
        false,
        this.date ?
        {
          headers: {
            "If-Modified-Since": getIfModifiedSinceHeader(this.date)
          }
        }
        : {}
      );
    });
  }
}

function getIfModifiedSinceHeader(date){
  return moment(date).utc().format("ddd, DD MMM YYYY HH:mm:ss")+" GMT";
}

function getFileName(url){
  const index = url.lastIndexOf("/");
  return url.slice(index+1);
}

const FileCache = new FileCacheClass();
export default FileCache;
