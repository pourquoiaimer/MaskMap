"use strict";

// properties:  資料項目，方便查找
// address: "花蓮縣玉里鎮國武里中山路２段５８號"
// available: "星期一上午看診、星期二上午看診、星期三上午看診、星期四上午看診、星期五上午看診、星期六上午看診、星期日上午看診、星期一下午看診、星期二下午看診、星期三下午看診、星期四下午看診、星期五下午看診、星期六下午看診、星期日下午看診、星期一晚上看診、星期二晚上看診、星期三晚上看診、星期四晚上看診、星期五晚上看診、星期六晚上看診、星期日晚上看診"
// county: "花蓮縣"
// cunli: "國武里"
// custom_note: ""
// id: "5945030094"
// mask_adult: 6147
// mask_child: 960
// name: "德興藥局"
// note: "口罩販售，營業時間，成人口罩200份，兒童口罩20份，售完為止。"
// phone: "(03)8889408"
// service_periods: "NNNNNNNNNNNNNNNNNNNNN"
// town: "玉里鎮"
// updated: "2020/10/19 09:20:59"
// website: ""
//先定義部份資料
var todayData = new Date(); //抓取時間資料

var storesData = []; //所有店家資料

var cityData = []; //城市資料

var nowCity = ""; //現在指向的城市

var nowTown = ""; //現在指向的區域

var nowStoresData = []; //選取城市及區域後的資料

var findWord = /^台/; //用來做地址修正的
//定義關於地圖的資料

var mymap = L.map('map', {
  //設定地圖在哪個標籤呈現
  center: [24.9459283, 121.3766219],
  //設定起始中心定位點
  zoom: 16 //地圖預設大小倍率

});
var greenIcon = new L.Icon({
  //綠色icon，成人小孩都有的時候
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var greyIcon = new L.Icon({
  //灰色icon，當成人小孩都沒有的時候
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var blueIcon = new L.Icon({
  //藍色icon，當沒有小孩只剩成人的時候
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var orangeIcon = new L.Icon({
  //橘色icon，當沒有成人只剩小孩的時候
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
var markers; //預先定義
//指向位置

var day = document.querySelector('.day');
var city = document.querySelector('.city');
var town = document.querySelector('.town');
var dataList = document.querySelector('.dataList'); //整個左側欄位

var resultList = document.querySelector('.resultList'); // 要填入資料的地方

var getCityData = getXML('js/CityCountyData.json');
var getStoresData = getXML('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
var toggleBtn = document.querySelector('.toggleBtn'); //切換開合左邊data欄的按鈕

var mapId = document.getElementById('map');
var searchBar = document.querySelector('.searchBar');
var searchIcon = document.querySelector('.searchIcon'); //監聽動作

city.addEventListener('change', function () {
  //監聽若城市的選擇欄位有改變，則調整地區及下方的藥局資料，地區默認為全部地區
  innerTown();
  innerStores();
}, false);
town.addEventListener('change', innerStores, false); //當地區改變時，重新輸入藥局資料

resultList.addEventListener('click', goIcon, false); //主要為了藥局資料欄位中的眼睛圖標，單獨監視.goIcon會只有第一個被監視到，改為通過監控母區域的方式執行

toggleBtn.addEventListener('click', togglelist, false); //切換左側資料頁面的開合

searchIcon.addEventListener('click', searchStores, false); //搜尋欄位中放大鏡按鈕的點選

searchBar.addEventListener('keypress', function (e) {
  //增加按下enter時的監聽
  if (e.keyCode === 13) {
    searchStores();
  }
}, false); // 將獲取遠端 API 或本地 JSON 資料的動作封裝成一個 function，方便後續調用

function getXML(path) {
  // 利用 Promise 確保獲取資料完成。
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.send();

    xhr.onload = function () {
      if (xhr.status == 200) {
        var originalData = JSON.parse(xhr.responseText);
        resolve(originalData);
      } else {
        console.log('抱歉，現在無法取得即時資訊！');
      }
    };
  });
}

Promise.all([getCityData, getStoresData]).then(function (resultData) {
  //用promise保證最初載入時的資料完整
  var originalCityData = resultData[0]; //原始城市地區資料

  cityData = fixCityData(originalCityData); //對原始城市地區資料做修正形成後續使用的城市地區資料檔案

  var originalStoresData = resultData[1].features; //原始藥局資料

  storesData = fixStoresData(originalStoresData); //對地址首字的臺台做統一，並補上缺少的county跟town後形成後續要用的藥局資料

  innerCity(cityData); //將城市資料放入城市選擇欄

  innerTown(); //將地區資料放入地區選擇欄

  showDay(); //填入星期幾

  showToday(); //填入今天日期

  judgeNumber(); //判斷身份證末碼並填入可購買狀態

  buildMap(); //建構地圖

  innerStores(); //將藥局資料按照城市和地區載入，默認會是台北市的全部地區

  innerStoresIcon(); //載入所有圖標的部份

  document.querySelector('.loading').style.display = "none"; //關閉loading完成圖片
});

function fixCityData(item) {
  //去掉其中的南海島及釣魚臺
  var len = item.length;
  var array1 = "";
  var array2 = "";

  for (var i = 0; len > i; i++) {
    //找出陣列中的南海島的序號
    if (item[i].CityName == "南海島") {
      array1 = i;
    }
  }

  item.splice(array1, 1); //刪去該序號的值

  len = item.length;

  for (var _i = 0; len > _i; _i++) {
    //找出陣列中的釣魚臺的序號
    if (item[_i].CityName == "釣魚臺") {
      array2 = _i;
    }
  }

  item.splice(array2, 1); //刪去該序號的值

  return item;
}

function fixStoresData(item) {
  //主要為了修正取回的藥局資料中部份沒有county及town的部份，並統一將地址的第一個字的台改為臺
  var len = item.length;

  for (var i = 0; len > i; i++) {
    //修正開頭第一個字為台的地址，統一改為臺
    if (item[i].properties.address.substr(0, 1) == "台") {
      item[i].properties.address = item[i].properties.address.replace(findWord, "臺");
    }
  } //用address的前三個字補上空的county


  for (var _i2 = 0; len > _i2; _i2++) {
    if (item[_i2].properties.county == "") {
      item[_i2].properties.county = item[_i2].properties.address.substr(0, 3);
    }
  }

  var townLastWord = ["鄉", "鎮", "市", "區"]; //可用js撈，但省時間，下方為撈
  //如果address的第6個字跟townLastWord符合，就直接抓4-6個字補上空的town，不然就是抓4-5補上空的town（這狀況大致都是東南西北區之類的）

  for (var _i3 = 0; len > _i3; _i3++) {
    if (item[_i3].properties.town == "") {
      if (townLastWord.includes(item[_i3].properties.address.substr(5, 1))) {
        item[_i3].properties.town = item[_i3].properties.address.substr(3, 3);
      } else {
        item[_i3].properties.town = item[_i3].properties.address.substr(3, 2);
      }
    }
  }

  return item;
}

function innerCity(item) {
  //組字串填入縣市
  var len = item.length;
  var str = "";

  for (var i = 0; len > i; i++) {
    str += "<option value=\"".concat(item[i].CityName, "\">").concat(item[i].CityName, "</option>");
  }

  city.innerHTML = str;
}

function innerTown() {
  //根據縣市填入區域
  nowCity = city.value;
  var townData = "";
  var len = cityData.length;

  for (var i = 0; len > i; i++) {
    //得出現在選取城市的地區
    if (cityData[i].CityName === nowCity) {
      townData = cityData[i].AreaList;
    }
  }

  var townDataLen = townData.length;
  var str = "";

  for (var _i4 = 0; townDataLen > _i4; _i4++) {
    //用所有地區組字串
    str += "<option value=\"".concat(townData[_i4].AreaName, "\">").concat(townData[_i4].AreaName, "</option>");
  }

  town.innerHTML = "<option value=\"\u5168\u90E8\u5340\u57DF\">\u5168\u90E8\u5340\u57DF</option>".concat(str); //將字串填入

  nowTown = town.value; //將現在地區做一個更動 
}

function innerStores() {
  //根據選取的區域抓取資料
  nowTown = town.value; //等於現在的地區值

  nowStoresData = []; //先將此值歸零

  var len = storesData.length;

  for (var i = 0; len > i; i++) {
    if (nowTown == "全部區域") {
      //如果選擇全部區域，就只要匹配城市
      if (storesData[i].properties.county === nowCity) {
        nowStoresData.push(storesData[i]);
      }
    } else {
      //如果不是全部區域，就匹配兩個部份
      if (storesData[i].properties.county === nowCity && storesData[i].properties.town === nowTown) {
        nowStoresData.push(storesData[i]);
      }
    }
  }

  DataStringInner(nowStoresData); //將現有的資料組成字串並填入藥局資料位置

  moveView(nowStoresData, 14); //移動到該處
}

function DataStringInner(item) {
  // 根據資料組成字串並填入藥局資料位置
  var str = '';
  var len = item.length;

  for (var i = 0; len > i; i++) {
    //用所有內容組字串
    str += "\n        <div class=\"result\">\n        <h3 class=\"storeName\">".concat(item[i].properties.name, "</h3>\n        <p class=\"storeAddress\">").concat(item[i].properties.address, "</p>\n        <p class=\"storePhone\">").concat(item[i].properties.phone, "</p>\n        <p class=\"storeOpenTime\">").concat(item[i].properties.note, "</p>\n        <div class=\"showMask\">\n            <div class=\"maskAdult bgad\">\n                <span>\u6210\u4EBA\u53E3\u7F69</span>\n                <span class=\"maskNumber\">").concat(item[i].properties.mask_adult, "</span>\n            </div>\n            <div class=\"maskChild bgch\">\n                <span>\u5152\u7AE5\u53E3\u7F69</span>\n                <span class=\"maskNumber\">").concat(item[i].properties.mask_child, "</span>\n            </div>\n        </div>\n        <span class=\"material-icons goIcon\" data-x='").concat(item[i].geometry.coordinates[0], "' data-y='").concat(item[i].geometry.coordinates[1], "'>\n        visibility</span>\n    </div>");
  }

  resultList.innerHTML = str;
} ////*****關於日期的函數////


function showDay() {
  //將星期幾寫到頁面上
  var day_list = ['日', '一', '二', '三', '四', '五', '六'];
  var dayNumber = judgeDay();
  var dayData = "\u661F\u671F".concat(day_list[dayNumber]);
  day.textContent = dayData;
}

function showToday() {
  //組字串寫入今天的日期
  if (todayData.getDate() < 10) {
    var day = "0".concat(todayData.getDate());
  } else {
    var day = todayData.getDate();
  }

  if (todayData.getMonth() + 1 < 10) {
    var month = "0" + (todayData.getMonth() + 1);
  } else {
    var month = todayData.getMonth() + 1;
  }

  var year = todayData.getFullYear();
  var today = "".concat(year, "-").concat(month, "-").concat(day);
  document.querySelector('.date').textContent = today;
}

function judgeNumber() {
  //計算單雙號並寫入相應身份證末碼可購買的函數
  var number = judgeDay();
  var remrainde = number % 2;
  var canBuy = '';

  switch (true) {
    case number == 0:
      canBuy = "<span class=\"IDNumber\">\u6240\u6709\u4EBA\u7686\u53EF\u8CFC\u8CB7</span>";
      break;

    case remrainde == 0:
      canBuy = "\u8EAB\u4EFD\u8B49\u672B\u78BC\u70BA<span class=\"IDNumber\">2,4,6,8,0</span>\u53EF\u8CFC\u8CB7";
      break;

    case remrainde == 1:
      canBuy = "\u8EAB\u4EFD\u8B49\u672B\u78BC\u70BA<span class=\"IDNumber\">1,3,5,7,9</span>\u53EF\u8CFC\u8CB7";
      break;

    default:
      break;
  }

  document.querySelector('.canBuy').innerHTML = canBuy;
}

function judgeDay() {
  //取得今天星期幾 週日會是0，後面可用於身份證末碼判斷
  var day = new Date().getDay();
  return day;
} ////*****關於地圖的fuction////


function buildMap() {
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //設定地圖的圖資來源
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap);
  markers = new L.MarkerClusterGroup({
    //運用此插件達到能夠將多個相近圖標聚集成單一的簇集，減少讀取時的負荷
    disableClusteringAtZoom: 18 //設置當zoom到達18的時候，所有簇集都會打開

  }).addTo(mymap); //用插件又增加了一個圖層
}

function innerStoresIcon() {
  //將所有的資料icon加到地圖上
  var len = storesData.length; //計算長度

  console.log(len);

  for (var i = 0; len > i; i++) {
    //跑迴圈，抓每個資料的裡面的經`緯度，在該處加入一個icon並起增加氣泡信息的內容，原本leaflet是在addLayer後面的括弧內的內容，增加markers.addLayer是用插件再增加圖層的聚集，讓網頁不會因為太多icon炸掉，
    var iconColor = void 0;

    switch (true) {
      case storesData[i].properties.mask_adult == 0 && storesData[i].properties.mask_child == 0:
        iconColor = greyIcon;
        break;

      case storesData[i].properties.mask_adult == 0 && storesData[i].properties.mask_child !== 0:
        iconColor = orangeIcon;
        break;

      case storesData[i].properties.mask_adult !== 0 && storesData[i].properties.mask_child == 0:
        iconColor = blueIcon;
        break;

      default:
        iconColor = greenIcon;
        break;
    }

    markers.addLayer(L.marker([storesData[i].geometry.coordinates[1], storesData[i].geometry.coordinates[0]], {
      icon: iconColor
    }).bindPopup("<div class=\"popupArea\"><h3 class=\"storeName\">".concat(storesData[i].properties.name, "</h3>\n        <p class=\"storeAddress\">").concat(storesData[i].properties.address, "</p>\n        <p class=\"storePhone\">").concat(storesData[i].properties.phone, "</p>\n        <p class=\"storeOpenTime\">").concat(storesData[i].properties.note, "</p>\n        <div class=\"showMask\">\n            <div class=\"maskAdult bgad\">\n                <span>\u6210\u4EBA\u53E3\u7F69</span>\n                <span class=\"maskNumber\">").concat(storesData[i].properties.mask_adult, "</span>\n            </div>\n            <div class=\"maskChild bgch\">\n                <span>\u5152\u7AE5\u53E3\u7F69</span>\n                <span class=\"maskNumber\">").concat(storesData[i].properties.mask_child, "</span>\n            </div>\n        </div>\n        </div>")));
  }

  mymap.addLayer(markers);
}

function moveView(item, zoomNumber) {
  //主要是在點擊相關地區舌後做移動
  mymap.setView([item[0].geometry.coordinates[1], item[0].geometry.coordinates[0]], zoomNumber);
}

function goIcon(e) {
  //點擊藥局資料框內的眼睛圖案時會自動跳到該藥局並打開popup
  if (document.body.scrollWidth <= 768) {
    //當瀏覽的頁面較小時，直接將左側資料欄位收起
    togglelist(e);
  }

  if (!e.target.className.includes('goIcon')) {
    return;
  }

  ; //確認指向的目標是goIcon

  console.log(document.body.scrollWidth);
  mymap.setView([e.target.dataset.y, e.target.dataset.x], 18);
  markersOpen(e.target.dataset.y, e.target.dataset.x);
}

function markersOpen(itemy, itemx) {
  //在點擊了清單中的眼睛按鈕後，跳轉到該藥局且打開popup
  markers.eachLayer(function (layer) {
    //eachLayer是leaflet提供的遍歷所有點的函數
    if (layer._latlng.lat == itemy && layer._latlng.lng == itemx) {
      //這邊是讓所有點的經緯度跟被點的做比對，找出相同的那一個
      markers.zoomToShowLayer(layer, function () {
        return (//zoomToshowLayer是MarkerClusterGroup插件提供的方法，將畫面拉到那個點之外還能有callback動作，試過單獨用layer.openPopup()，可能因為zoom過去後還未能在icon展開後再執行openPopup導致一些有相近藥局的資料沒辦法順利打開
          layer.openPopup()
        );
      });
    }
  });
}

function togglelist(e) {
  //切換左側資料欄的開合
  e.preventDefault();

  if (dataList.className.includes('close')) {
    //檢查有無close，有close代表目前是側面欄位是關閉的的
    dataList.classList.remove('close'); //有就刪去close，等於展開

    mapId.classList.remove('bigMap'); //讓地圖縮小

    toggleBtn.classList.remove('close'); //有就刪去close，讓圖案向內
  } else {
    //如果是沒有close代表目前是側面欄位是打開的
    dataList.classList.add('close'); //沒有就加上，等於合起來

    mapId.classList.add('bigMap'); // 讓地圖加大到填滿畫面

    toggleBtn.classList.add('close'); //沒有就加上，讓圖案向外
  }
}

function searchStores() {
  //搜尋並匹配資料------看是否切換成只包含一個結果時地圖放更大 讓if跑完後外面再繼續
  nowStoresData = []; // 先歸零現在資料

  var len = storesData.length;

  if (searchBar.value == '') {
    alert('請輸入資料後再搜尋');
    return;
  }

  for (var i = 0; len > i; i++) {
    //用includes來做搜索的匹配，只要輸入的字包含在地址或藥局名稱都會被找出，在匹配地址部份，增加一個首字臺台不分
    if (storesData[i].properties.name.includes(searchBar.value) || storesData[i].properties.address.includes(searchBar.value) || storesData[i].properties.address.includes(searchBar.value.replace(findWord, "臺"))) {
      nowStoresData.push(storesData[i]);
    }
  }

  var dataLen = nowStoresData.length;

  switch (true) {
    //主要是為了調整zoom的數值，多結果時較遠，單一結果最近，無結果則alert查無資料
    case dataLen == 1:
      DataStringInner(nowStoresData);
      moveView(nowStoresData, 18);
      break;

    case dataLen == 0:
      DataStringInner(nowStoresData);
      alert("查無資料");
      break;

    default:
      DataStringInner(nowStoresData);
      moveView(nowStoresData, 14);
      break;
  }
}