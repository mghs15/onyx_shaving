# onyx_shaving
onyx_dでタイルの要らないデータを削除して配信するサーバ

[onyx](https://github.com/un-vector-tile-toolkit/onyx/blob/master/app.js)を簡略化した[onyx_d](https://github.com/mghs15/onyx_d)で、さらに[vtshaver](https://github.com/mapbox/vtshaver)を用いてタイルデータを整理して配信できるようにしてみたもの。

**作業フォルダなので、きちんとしたものではありません。**

package.jsonはonyxのものにvtshaverを追加したものです。
（`name`や`description`はonyxのままになっていますので注意。）
`config/default.hjson`はonyx_dを参照。

```
npm install

# set style you want to use (for app3.js)
mkdir style
touch ./style/test.json

# or set filter you want to use (for app5.js)
mkdir filter
touch ./filter/test.json

mkdir htdocs
mkdir mbtiles
mkdir config
touch ./config/default.hjson
```

example of filter (schema from a part of gsimaps vector)
```
{ "building":
   { "filters": true,
     "minzoom": 14,
     "maxzoom": 18,
     "properties": [ "ftCode" ] },
  "waterarea":
   { "filters": true,
     "minzoom": 11,
     "maxzoom":18,
     "properties": [ "ftCode" ] },
  "road":
   { "filters": true,
     "minzoom": 11,
     "maxzoom":18,
     "properties": [ "ftCode", "rdCtg", "motorway", "rnkWidth" ] },
  "railway":
   { "filters": true,
     "minzoom": 14,
     "maxzoom":17,
     "properties": [ "ftCode", "snglDbl", "staCode", "railState", "rtCode" ] },
  "label":
   { "filters": true,
     "minzoom": 11,
     "maxzoom":18,
     "properties": [ "ftCode" ] },
  "symbol":
   { "filters": true,
     "minzoom": 11,
     "maxzoom":18,
     "properties": [ "ftCode", "alti", "gcpCodeFlag" ] }
}
```

* フルデータを持つmbtilesから、必要な地物だけfilter.jsonで抜き出して配信するのが良いかも。
* filterをかけたタイルは、ちゃんとサイズも減っている。
* だが、filterの中のminzoomは、たぶん機能していない。（maxzoomは機能しているみたい。）

## 参考文献

* https://github.com/un-vector-tile-toolkit/onyx/blob/master/app.js
* https://github.com/mapbox/vtshaver

