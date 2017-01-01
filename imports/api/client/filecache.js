import md5 from "blueimp-md5";

/* global Ground */
/* global LocalFileSystem */
/* global FileTransfer */

// Cache specified files for the offline use
class FileCacheClass {

  constructor(){
    this.collection = new Ground.Collection("filecache");
  }

  // Add the file specified by the url to the cache.
  // Returns a handle
  add(url){
    check(url, String);

    let entry = this.collection.findOne({url: url});
    if( !entry ){
      entry = {url: url};
      this.collection.insert(entry);
    }
    return new FileCacheHandle(entry);
  }

  remove(url){
    this.collection.remove({url: url});
  }

  onDownload(url, path){
    this.collection.update({url: url}, {"$set": {path: path}});
  }
}

class FileCacheHandle {

  constructor({url, path}){
    this.url = url;
    this.path = path;
    this.needDownload = new ReactiveVar(path ? false : true);
    this.source = new ReactiveVar(url);
    this.startDownload = this.startDownload.bind(this);

    Tracker.autorun(this.startDownload);
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
    console.log("startDownload autorun for "+this.url);
    if( Meteor.status().connected && this.needDownload.get()){
      console.log("Condition met. Start downloading "+this.url);
      this.download();
      this.needDownload.set(false);
    }
  }

  download(){
    if( this.downloading ) return;

    this.downloading = true;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fileSystem)=>{
      var fileTransfer = new FileTransfer();
      const path = fileSystem.root.toURL() + md5(this.url) + getFileName(this.url);
      console.log("download destination = "+path);
      fileTransfer.download(
        this.url,
        path,
        (entry)=>{
          console.log("Downloaded: "+this.url+" to "+entry.toURL());
          this.source.set(path);
          FileCache.onDownload(this.url, path);
          this.downloading = false;
        },
        (error)=>{
          console.log("Download failed: "+this.url+". Error = "+JSON.stringify(error));
          this.downloading = false;
        }
      );
    });
  }
}

function getFileName(url){
  const index = url.lastIndexOf("/");
  return url.slice(index+1);
}

const FileCache = new FileCacheClass();
export default FileCache;
