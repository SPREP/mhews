import md5 from "blueimp-md5";

/* global Ground */
/* global LocalFileSystem */
/* global FileTransfer */
/* global WebAppLocalServer */

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
    if( entry ){
      console.log("filecache entry already exists. "+JSON.stringify(entry))
    }
    else{
      entry = {url: url};
      this.collection.insert(entry);
    }
    return new FileCacheHandle(entry, this.collection);
  }

  remove(url){
    this.collection.remove({url: url});
  }

  onDownload(url, path, downloadDate){
    this.collection.update({url: url}, {"$set": {path: path, date: downloadDate.toDate()}});
  }
}

class FileCacheHandle {

  constructor({url, path, date}, collection){
    this.url = url;
    this.path = path;
    this.needDownload = new ReactiveVar(path ? false : true);
    this.source = new ReactiveVar(url);
    this.date = date; // Download date
    this.startDownload = this.startDownload.bind(this);

    collection.find({url: url}).observe({
      changed: (document)=>{
        this.date = document.date;
      }
    })

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
      console.log("Last download date ="+this.date);
      console.log("If-Modified-Since header = "+ getIfModifiedSinceHeader(this.date));
      const downloadDate = moment();

      // Adjustment for the daylight saving tiem
      if( downloadDate.isDST() ){
        downloadDate.subtract(1, 'hours');
      }

      fileTransfer.download(
        this.url,
        path,
        (entry)=>{
          console.log("Downloaded: "+this.url+" to "+entry.toURL());
          this.source.set(WebAppLocalServer.localFileSystemUrl(path));
          FileCache.onDownload(this.url, path, downloadDate);
          this.downloading = false;
        },
        (error)=>{
          console.log("Download failed: "+this.url+". Error = "+JSON.stringify(error));
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
