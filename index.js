const request = require('request-promise-native');
const fs = require('fs');
const path = request('path');
var exec = require('child_process').exec;
var EventProxy = require('eventproxy');

var ep = new EventProxy();
//下载壁纸
ep.all('wallpaper', function(wallpaper) {
    let cmd = `osascript -e 'tell application "Finder" to set desktop picture to POSIX file "${wallpaper}"'`;
    exec(cmd, function(error, stdout, stderr) {
        console.log('ok')
    });
})

/**
 * 获取储存目录
 */
const getWallpaperDir = function() {
    let userDIr = process.env.HOME;
    let picturesDir = userDIr + '/Pictures/'
    if (!fs.existsSync(picturesDir)) {
        fs.mkdirSync(picturesDir, 0755)
    }
    let bingDir = picturesDir + 'Bing/'
    if (!fs.existsSync(bingDir)) {
        fs.mkdirSync(bingDir, 0755)
    }
    return bingDir;
}



/**
 * 获取壁纸
 */
const getWallpaper = function() {
    let datetime = new Date().getTime()
    let url = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=${datetime}&pid=hp&video=1`;
    return request({
            url: url,
            method: 'GET',
            headers: {
                'Cookie': 'SRCHD=AF=NOFORM; SRCHUID=V=2&GUID=5D09DC93584D42438BC0D25EC65AE35D; SRCHUSR=DOB=20161118; _EDGE_V=1; MUID=1BAE4750D0A46E3603A54E81D1056F2E; MUIDB=1BAE4750D0A46E3603A54E81D1056F2E; _EDGE_S=SID=119E6E391BB761F713A864BB1A166010; SRCHHPGUSR=CW=1216&CH=679&DPR=2&UTC=480; WLS=TS=63630331892; _SS=SID=119E6E391BB761F713A864BB1A166010&bIm=738126&HV=1494735098',
                'Host': 'cn.bing.com',
                'Referer': 'http://cn.bing.com/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36'
            }
        })
        .then(data => {
            return JSON.parse(data)
        }, error => {
            console.log(error)
        })
        .then((josn) => {
            let wallpaperUrl = 'http://cn.bing.com' + josn.images[0].url;
            let wallpaperName = wallpaperUrl.split('/').pop();
            let wallpaperDir = getWallpaperDir();
            let wallpaperSave = wallpaperDir + wallpaperName;
            if (fs.existsSync(wallpaperSave)) {
                ep.emit('wallpaper', wallpaperSave)
            } else {
                request(wallpaperUrl)
                    .on('response', function(res) {
                        res.pipe(fs.createWriteStream(wallpaperSave))
                            .on('close', function() {
                                ep.emit('wallpaper', wallpaperSave)
                            })

                    })
            }

        })
}

getWallpaper()