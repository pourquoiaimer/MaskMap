# MaskMap-口罩地圖
六角學院-JavaScript-入門篇-學徒的試煉--Leaflet + OSM***

## 網頁呈現
https://pourquoiaimer.github.io/MaskMap/

**使用技術包括**
* HTML/CSS
* SCSS
* JavaScript (AJAX串接API)
* Leaflet(地圖框架) + OSM (OpenStreetMap) + MarkerClusterGroup(Leaflet插件)

## 內容說明
依據設計稿製作口罩地圖，練習使用AJAX獲取藥局資料，並透過Leaflet、OSM、MarkerClusterGroup建構地圖，使用JavaScript搭配地圖做到各縣市及各區的藥局資料切換和簡單的搜索和定位功能。

  頁面功能包括：
* RWD響應式網頁
* 通過AJAX串接API獲取即時的藥局和口罩剩餘量資料
* 使用**Leaflet**地圖框架搭配**Openstreetmap**圖資構建地圖
* 左上有顯示當下日期並判斷可購買的身份證尾號
* 切換左上城市欄位及區域，下方即會呈現該區的藥局資料，可直接看到成人及兒童口罩剩餘數量，並可點擊資料欄位右上角的眼睛icon，切換到地圖上的藥局位置並打開相應Popup
* 左上搜索欄位可透過藥局名稱或地址進行搜索，只要輸入的文字有包含在名稱或地址中即可找到，各藥局地址首字"台"已統一為"臺"，但搜索端輸入"台"亦可搜到正確結果
* 左側資料欄位可收起
* 地圖上的markers透過MarkerClusterGroup插件進行聚合，減少系統負荷
* 根據口罩是否有剩，會有不同的markers顏色


## 聲明
根據THE F2E 2nd -第十關中 [Wendy的設計稿](https://challenge.thef2e.com/user/2259?schedule=4452#works-4452) 進行製作。
[藥局資料來源](https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json)
[台灣城市區域資料來源](https://github.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/blob/master/CityCountyData.json)
