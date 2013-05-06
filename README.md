# GitHub ArchiveRoom

[ [Visit ArchiveRoom.net](http://archiveroom.net "ArchiveRoom") ]
[ [View Video Demo](https://www.youtube.com/watch?v=G6CzzCu6wXs "ArchiveRoom Video Demo") ]

## About

Developed for the [GitHub Data Challenge 2](https://github.com/blog/1450-the-github-data-challenge-ii).

'GitHub ArchiveRoom' is a 3D visualization of user's public activity.
Besides the visualization, 'ArchiveRoom' creates a way to explore each data node by looking it up in the GitHub Archive.
Google BigQuery allows for a quick way of creating CSV data file of user's activity. A copy of the GitHub archive
is served as an API that allows event lookup by the event creation date.
The visualization lets users to fly / walk around and explore activity data from different angles.
Screenshot functionality creates a way of saving interesting discoveries and can be shared later on.


### Browser Support

* __Use Chrome 27+ or Firefox Aurora / Nightly__
* Tested in Chromium 28 on Linux

### Controls
* Left Click - View Cube Data
* [W],[A],[S],[D] - Walk around
* [Space] - Jump
* Hold [Space] - Fly Up
* Hold [Shift] - Fly Down
* [Tab] - Screenshot
* [Escape] Release Pointer Lock

## Screenshots

![](http://v14d.com/u/gar1.png)

![](http://v14d.com/u/gar2.png)

![](http://v14d.com/u/gar3.png)

## Installation Notes

* Clone this repo
  * `npm install`
  * `npm install -g browserify`
  * `grunt shell:br` to compile the voxel bundle
  * Run `grunt` for debug, `grunt prod` for production, `grunt dev` for development
* To view cube data you need a copy of the GitHub archive from March 2012 until May 2013 or so.
  * Put the archive data in `[project]/data/raw/`
  * You can upload CSV files using the web interface or put them into `[project]/data/csv` folder

## Known Issues

Please report issues in the issue tracker.
If the viewer is not loading or just showing a dot in the middle of the screen you
might be using an unsupported browser. If the viewer is slow even after the blocks finished rendering, then
you need a try this with a better graphics card.

## Special Thanks

* [voxel.js](http://voxeljs.com/) - an open source voxel game building toolkit for modern web browsers
* [three.js](http://threejs.org/) - javaScript 3D library

## License

MIT
