var fs = require('fs');

var directory =  process.argv[2];
var fileList = [];
var count = 0;


function FileSorter(path){
  if (!(this instanceof FileSorter)){
    return new FileSorter(path);
  }
  this.path = path;
}

FileSorter.prototype.sort = function(){
  var self = this;
  fs.readdir(this.path, function readDirHandler(err, list){
    if (err) return console.error(err);

    // console.log(list);
    count = list.length;
    list.forEach(self.filestat);
  });
}



FileSorter.prototype.sortList = function(a, b){
// sortList = function(a, b){
  if(a.mtime > b.mtime){
    console.log('hello');
    return -1;
  }
  else if (a.mtime < b.mtime){
    return 1;
  }
  console.log('sorting help');
  return 0;
}

FileSorter.prototype.filestat = function(file, index, array){
  var self = this;

  fs.stat(file, function(err, stat){
    var outerSelf = self;
    count--;
    console.log(count);
    if (err) return console.error(err);

    // console.log(stat.mtime);
    fileList.push({"file" : file, "mtime" : stat.mtime });
    console.log(stat.mtime.getTime());
    if (count === 0){
      console.log('sorting', fileList[0].mtime.getTime(), fileList[0],file);

      // fileList.sort(sortList);
      // console.log(outerSelf);
      fileList.sort(self.sortList);
      console.log(fileList);
    }
  });
}


var fileSorter = FileSorter('./');
fileSorter.sort();
