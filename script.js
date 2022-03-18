var setForCheckedTogglesinSite = new Set();
var setForPresentedCardsExtraInfoInSite = new Set();
var setForCheckedCardsInSite = new Set();
var setForCheckedCardsSymbolsInSite = new Set();
var filteredCardInPage = new Array ();
var arrayForCheckedCardsIdsInSite = new Array();
var arrayForCheckedCardsSymbolsInSite = new Array();
var mainPageCardsArray = new Array();
var mapForCacheOfCardsExtraInfoInSite = new Map();
var isWindowOpen = false;
var lastCheckedCardInMainPage;
var lastToggledCheckedInMainPage;
var lastCheckedCardSymbolInMainPage;
var lastToggledCheckedCardInWindow;
var lastToggledCheckedInWindow;
var lastCheckedCardSymbolInWindow;




(function loadAllCardsOnMainPage() {

  $("#chartUndefinedLabel").hide();
  $(".window-style").hide();
  $(".chart-style").hide();
  $("#aboutMe").hide();

  let coinsUrl = `https://api.coingecko.com/api/v3/coins`;

  $.get(coinsUrl).then((coinsUrlToArray)=> {

    coinsArrayToCardsUI(coinsUrlToArray, true);
  })
    .catch(function (error) {
      console.log(error);
      alert("no data returned from server");
    })
})()



function coinsArrayToCardsUI(coinsArray, isFirstLoading) {

  spinnerDuringCardsLoadingOnMainPage(true)

  for (i = 0; i < coinsArray.length; i++) {

    let coinObject = new Object();

    let coinId = coinsArray[i].id;
    let coinSymbol = coinsArray[i].symbol;
    let coinName = coinsArray[i].name;
    let coinImage = coinsArray[i].image.small;

    coinObject = {
      id: coinId,
      symbol: coinSymbol,
      name: coinName,
      image: {
        small: coinImage
      }
    }

    if (isFirstLoading == true) {
      mainPageCardsArray.push(coinObject);
    }




    if (mainPageCardsArray.length > 100) {
      return false;
    }



    let newCard = $(`<div id=${coinId} class="col">
    <div class="form-check form-switch">
    <input class="form-check-input" id=toggle_${coinId} type="checkbox" role="switch" onchange=onCardToggleCheck(id,"${coinId}","${coinSymbol}")>
</div>
      <div id=collapseHeight_${coinId} class="card h-100">
        <div class="card-body">
        <div id=imageContainer_${coinId} class="card-title">
        </div>
          <h5 class="card-title">${coinSymbol}</h5>
          <p class="card-text">${coinName}</p>
          <a id=collapseButton_${coinId} onclick=onCollapseClick("${coinId}") class="btn btn-primary" data-bs-toggle="collapse" data-target="collapse${coinId}" role="button" aria-expanded="false" aria-controls="multiCollapseExample1">More Info</a>
          <div id="progressBar_${coinId}" class="progressBar"></div>
 <div class="row" style="margin-right: 5px;">
        <div class="col">
          <div class="collapse multi-collapse" id="collapse${coinId}">
    <div id="cardExtraInfoLocation_${coinId}" class="card card-body" style="width: 300px">
    </div>
  </div>
</div>
        </div>
      </div>
    </div>`)

    $("#cardsContainer").append(newCard).hide().fadeIn("slow");
  }
  spinnerDuringCardsLoadingOnMainPage(false)
}



function spinnerDuringCardsLoadingOnMainPage(isLoadingcards) {

  let spinnerLocationOnMainPage = $("#spinnerSignWhileLoadingCards");

  let spinner = $(`<div class="d-flex justify-content-center">
<div class="spinner-border" role="status">
<span class="visually-hidden"></span>
</div>
</div>`)


  if (isLoadingcards == true) {
    spinnerLocationOnMainPage.append(spinner);
  }

  if (isLoadingcards == false) {
    spinnerLocationOnMainPage.fadeOut(900);
  }
}


function onCollapseClick(coinId) {

  let extraInfoClickedCardId = mainPageCardsArray.find(value => value.id == coinId).id;
  let extraInfoClickedCardIdStateAttr = $("#collapseButton_" + extraInfoClickedCardId).attr("aria-expanded");

  let extraInfoUrl = `https://api.coingecko.com/api/v3/coins/${extraInfoClickedCardId}`;

  let isCardExtraInfoPresented = showOrHideExtraInfo(extraInfoClickedCardId, extraInfoClickedCardIdStateAttr);

  if (isCardExtraInfoPresented == true) {

    if (setForPresentedCardsExtraInfoInSite.has(extraInfoClickedCardId)) {
      let cachedCardObjectForExtraInfo = mapForCacheOfCardsExtraInfoInSite.get(extraInfoClickedCardId);
      let cachedCardObjectCoinbyUsd = cachedCardObjectForExtraInfo.coinbyUsd;
      let cachedCardObjectCoinbyEur = cachedCardObjectForExtraInfo.coinbyEur;
      let cachedCardObjectCoinbyIls = cachedCardObjectForExtraInfo.coinbyIls;
      let cachedCardObjectImg = cachedCardObjectForExtraInfo.cardImg;

      cardExtraInfoAddContent(extraInfoClickedCardId,cachedCardObjectCoinbyUsd,cachedCardObjectCoinbyEur,cachedCardObjectCoinbyIls,cachedCardObjectImg)
    }

    else {
      setForPresentedCardsExtraInfoInSite.add(extraInfoClickedCardId);

      $.get(extraInfoUrl).then((cardExtraDetails) => {

        let cardNewImageUrl = cardExtraDetails.image.small;
        let cardNewImage = $(`<img src=${cardNewImageUrl} class="card-img-top" alt="coinCardImg">`);
        let cardNewCoinbyUsd = cardExtraDetails.market_data.current_price.usd + "   $";
        let cardNewCoinbyEur = cardExtraDetails.market_data.current_price.eur + "   €";
        let cardNewCoinbyIls = cardExtraDetails.market_data.current_price.ils + "   ₪";

        let cardExtraInfoDetailsObject = {
          coinbyUsd: cardNewCoinbyUsd,
          coinbyEur: cardNewCoinbyEur,
          coinbyIls: cardNewCoinbyIls,
          cardImg: cardNewImage
        }

        cardExtraInfoAddContent(extraInfoClickedCardId,cardNewCoinbyUsd,cardNewCoinbyEur,cardNewCoinbyIls,cardNewImage)
  
        mapForCacheOfCardsExtraInfoInSite.set(extraInfoClickedCardId, cardExtraInfoDetailsObject);

        deleteCardFromMapAndSetAfterTwoMinutes(extraInfoClickedCardId)

      }).fail(function (error) {

        console.log(error);
        alert("no data returned from server");
      })
    }
  }
}

function cardExtraInfoAddContent (extraInfoClickedCardId,cardCoinByUsd,cardCoinbyEur,cardCoinbyIls,cardImage )
{
  $("#cardExtraInfoLocation_" + extraInfoClickedCardId).html("Current Prices:" + '<br>' + '<br>' + cardCoinByUsd + '<br>' + cardCoinbyEur + '<br>' + cardCoinbyIls);
  $("#imageContainer_" + extraInfoClickedCardId).append(cardImage).hide().fadeIn("slow");
}



function deleteCardFromMapAndSetAfterTwoMinutes(cardIdForDelete) {
  setTimeout(()=>{
    setForPresentedCardsExtraInfoInSite.delete(cardIdForDelete);
    mapForCacheOfCardsExtraInfoInSite.delete(cardIdForDelete);
  }
    , 120000
  )
}



function showOrHideExtraInfo(cardId, isCardExtraInfoShowed) {

  if (isCardExtraInfoShowed == "false") {

    let isCardExtraInfoProcessDone = "false"
    while (isCardExtraInfoProcessDone == "false") {
      progressBarForExtraInfoLoadingForCards(cardId, isCardExtraInfoShowed)
      $("#collapse" + cardId).css("display", "flex");
      $("#imageContainer_" + cardId).empty();
      $("#collapseButton_" + cardId).attr("aria-expanded", "true");
      isCardExtraInfoProcessDone = "true";

      return true
    }
  }

  else if (isCardExtraInfoShowed == "true") {
    $("#collapse" + cardId).css("display", "none");
    $("#progressBar_" + cardId).css("width", "0%");
    $("#progressBar_" + cardId).html('');
    $("#imageContainer_" + cardId).empty();
    $("#collapseButton_" + cardId).attr("aria-expanded", "false");

    return false
  }
}



function progressBarForExtraInfoLoadingForCards(cardId, isCardExtraInfoShowed) {

  let progressBar = $("#progressBar_" + cardId)
  let width = 0;
  if (isCardExtraInfoShowed == "true") {
    return true
  }

  else {
    if (isCardExtraInfoShowed == "false") {
      while (width < 100) {
        width++;
        progressBar.css("width", `${width}` + "%").fadeIn('slow');
        progressBar.html(`${width}` + "%  Loaded!");
      }
      return true
    }
  }
}



$("#goButton").click(()=>{

  let searchInputValue = $("#searchText").val();

  searchInputValue=searchInputValue.toLowerCase();

  searchInputValidations(filteredCardInPage,searchInputValue)



  let filteredCoinsArray = mainPageCardsArray.filter((filteredValue) => {
    if (filteredValue.symbol == searchInputValue)
    {
      return true
    }
  })

  if (filteredCoinsArray.length == 1) {
    filteredCardInPage = [];
    $("#cardsContainer").empty();
    coinsArrayToCardsUI(filteredCoinsArray, false)
    if (setForCheckedCardsInSite.has(filteredCoinsArray[0].id))
    {
      $("#" + filteredCoinsArray[0].id).children().children().prop("checked", true);
    }

    if (setForCheckedCardsInSite.size==5)
    {
      setTimeout(() => {
        alert("Attention! You Have Already Chose 5 Coin Cards for Live Reports! In Case You Wish to Rechoose Cards - Please Return to Coins Tab...");
      }, 1000);
     
      $("#" +filteredCoinsArray[0].id).children().children().prop("disabled", true);
    }

    filteredCardInPage.push(searchInputValue);
    $("#searchText").val('');
  }


  else if (filteredCoinsArray.length == 0 && searchInputValue != "" && searchInputValue.length < 6  ) {
    alert("No Such Coin Code Name in Site");
  }

})


function searchInputValidations (filteredCardInPage,searchInputValue) {

  searchInputValue=searchInputValue.toLowerCase()

  if (filteredCardInPage.length > 0 && searchInputValue == filteredCardInPage[0]) {
    alert("Coin Card with This Code Name is Already Presented!");
    $("#searchText").addClass("red-input-validation");

 return false
  }
  
  else {
    filteredCardInPage = [];
  }

  $("#searchText").keypress(() => {
    $("#searchText").removeClass("red-input-validation");
  })

  if (searchInputValue == "" || typeof searchInputValue != 'string' || searchInputValue.length > 5) {
    alert("Please Insert Only a Full Coin Code Name Between 1 - 6 Characters");
    $("#searchText").addClass("red-input-validation");
    $("#searchText").val('');
    return false
  }
}


function hideMainPage() {
  $("#chartContainer").empty();
  $(".search-area-style").hide();
  $("#pageContainer").css("height", "auto");
  $("#cardsContainer").empty();
  $("#pageContainer").empty();
  $(".h1-style").hide();
}



function onCardToggleCheck(cardToggleId,cardId,coinSymbol) {

  if ($("#" + cardToggleId).is(':checked')) {

    addCardIdToggleAndSymbolToSetInSite(cardId,cardToggleId,coinSymbol)

    if (isWindowOpen == true) {
      WindowOpen()
    }
  }

  else if ($("#" + cardToggleId).is(":not(:checked)")) {

    deleteCardIdToggleAndSymbolFromSetInSite (cardId,cardToggleId,coinSymbol)

    if (isWindowOpen == true) {
      lastToggledCheckedCardInWindow = cardId;
      lastToggledCheckedInWindow = cardToggleId;
      lastCheckedCardSymbolInWindow = coinSymbol;
      WindowOpen()
    }
  }

  if (isWindowOpen == false) {
    if (setForCheckedCardsInSite.size > 5) {
      lastCheckedCardInMainPage = cardId;
      lastToggledCheckedInMainPage = cardToggleId;
      lastCheckedCardSymbolInMainPage = coinSymbol;

      deleteCardIdToggleAndSymbolFromSetInSite (cardId,cardToggleId,coinSymbol)

      addCardsToFiveTogglesWindow()
    }
  }
}


function deleteCardIdToggleAndSymbolFromSetInSite (cardId,cardToggleId,coinSymbol)
{
  setForCheckedCardsInSite.delete(cardId);
  setForCheckedTogglesinSite.delete(cardToggleId);
  setForCheckedCardsSymbolsInSite.delete(coinSymbol);
}


function addCardIdToggleAndSymbolToSetInSite (cardId,cardToggleId,coinSymbol)
{
  setForCheckedCardsInSite.add(cardId);
  setForCheckedTogglesinSite.add(cardToggleId);
  setForCheckedCardsSymbolsInSite.add(coinSymbol);
}





function addCardsToFiveTogglesWindow() {

  arrayForCheckedCardsIdsInSite = Array.from(setForCheckedCardsInSite);

  arrayForCheckedCardsIdsInSite.forEach((value) => {
    $("#fiveCardsToggledWindow").append($("#" + value));
  })
  WindowOpen()
}




function WindowOpen() {

  if (isWindowOpen == false) {
    $("html, body").animate({ scrollTop: 250 }, 600);
  }
  isWindowOpen = true;
  $(".progressBar").hide();
  $(".row").addClass("row-class-for-window");
  $(".navbar-nav").hide();
  $(".header-parallax").addClass("parallax-class-for-window");
  $(".h1-style").addClass("row-class-for-window");
  $(".btn-primary").hide();
  $(".card-body").addClass("cards-style-in-window");
  $(".page-container-style").addClass("page-container-class-for-window");
  $(".col").addClass("col-class-for-window");
  $(".h-100").addClass("card-height-class-for-window");
  $(".card").addClass("card-flex-for-window");
  $(".window-style").show();


  if (isWindowOpen == true) {
    if (setForCheckedTogglesinSite.size == 5) {
      $("#cancelWindowButton").addClass("red-input-validation");
      $("#saveChangesButton").prop("disabled", true);
    }

    if (setForCheckedTogglesinSite.size == 4) {

      $("#saveChangesButton").prop("disabled", false);
      $("#saveChangesButton").addClass("red-input-validation");

      setForCheckedTogglesinSite.forEach((value) => {
        $("#fiveCardsToggledWindow").children().children().children("#" + value).attr("disabled", true);
      })
    }
  }
}


$("#saveChangesButton").click(()=> {

  addCardIdToggleAndSymbolToSetInSite(lastCheckedCardInMainPage,lastToggledCheckedInMainPage,lastCheckedCardSymbolInMainPage)

  $("#cardsContainer").prepend($("#" + lastToggledCheckedCardInWindow));

  applyFromWindowToMainPageCards()
  hideWindow()
})







$("#cancelWindowButton").click(()=> {

  isWindowOpen = false;

  if (setForCheckedTogglesinSite.size == 5) {
    deleteCardIdToggleAndSymbolFromSetInSite(lastCheckedCardInMainPage,lastToggledCheckedInMainPage,lastCheckedCardSymbolInMainPage)
  }

  if (setForCheckedTogglesinSite.size == 4) {
    addCardIdToggleAndSymbolToSetInSite(lastToggledCheckedCardInWindow,lastToggledCheckedInWindow,lastCheckedCardSymbolInWindow)
  }

  applyFromWindowToMainPageCards()

  $("#" + lastToggledCheckedInMainPage).prop("checked", false);

  hideWindow()
})


function applyFromWindowToMainPageCards() {

  setForCheckedCardsInSite.forEach((value) => {
    $("#cardsContainer").prepend($("#" + value));
  })

  setForCheckedTogglesinSite.forEach((value) => {
    $("#" + value).prop("checked", true);
    $("#" + value).attr("disabled", false);
  })
}



function hideWindow() {
  $(".row").removeClass("row-class-for-window");
  $(".navbar-nav").show();
  $(".header-parallax").removeClass("parallax-class-for-window");
  $(".h1-style").removeClass("row-class-for-window");
  $(".btn-primary").show();
  $(".page-container-style").removeClass("page-container-class-for-window");
  $(".col").removeClass("col-class-for-window");
  $(".h-100").removeClass("card-height-class-for-window");
  $(".card").removeClass("card-flex-for-window");
  $(".window-style").hide();

  isWindowOpen = false;
}




$("#reports").click((event)=> {

  $("#aboutMe").hide();
  $(".chart-style").show();
  $("#chartUndefinedLabel").show();
  event.preventDefault();

  hideMainPage()

  arrayForCheckedCardsSymbolsInSite = Array.from(setForCheckedCardsSymbolsInSite);

for (i=0;i<arrayForCheckedCardsSymbolsInSite.length;i++)
{
  cardSymbolNameValueCheck(arrayForCheckedCardsSymbolsInSite[i]);
}




  let CoinsLiveInfoData = (`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${arrayForCheckedCardsSymbolsInSite[0]},${arrayForCheckedCardsSymbolsInSite[1]},${arrayForCheckedCardsSymbolsInSite[2]},${arrayForCheckedCardsSymbolsInSite[3]},${arrayForCheckedCardsSymbolsInSite[4]}&tsyms=USD`);

    let dataPoints1 = [{ x: "SS", y: 10  }];
    let dataPoints2 = [{ }];
    let dataPoints3 = [{ }];
    let dataPoints4 = [{ }];
    let dataPoints5 = [{ }];

    let chart = new CanvasJS.Chart("chartContainer", {

      toolTip: {
        shared: true,
      },
      
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries
      },
        title: {
          text: "Coins Live Prices",
      
        },
        axisX: {
          title: "Coins Prices Every 2 Seconds"
        },
    
        data: [
          [{
            title: `${arrayForCheckedCardsSymbolsInSite[0]}`,
            titleFontColor: "#369EAD",
            lineColor: "#369EAD",
            tickColor: "#369EAD",
            labelFontColor: "#369EAD"
          },
          {
            title: `${arrayForCheckedCardsSymbolsInSite[1]}`,
            titleFontColor: "#C24642",
            lineColor: "#C24642",
            tickColor: "#C24642",
            labelFontColor: "#C24642"
          },
          {
            title: `${arrayForCheckedCardsSymbolsInSite[2]}`,
            titleFontColor: "#B8CC06",
            lineColor: "#B8CC06",
            tickColor: "#B8CC06",
            labelFontColor: "#B8CC06"
          },
          {
            title: `${arrayForCheckedCardsSymbolsInSite[3]}`,
            titleFontColor: "#CC06C2",
            lineColor: "#CC06C2",
            tickColor: "#CC06C2",
            labelFontColor: "#CC06C2"
          },
          {
            title: `${arrayForCheckedCardsSymbolsInSite[4]}`,
            titleFontColor: "#141F15",
            lineColor: "#141F15",
            tickColor: "#141F15",
            labelFontColor: "#141F15"
          }
          ],
     
          {
            type: "line",
            name:  `${arrayForCheckedCardsSymbolsInSite[0]}`,
            showInLegend: true,
            yValueFormatString: "#,##0.#  $",
            color: "#369EAD",
            dataPoints: dataPoints1


          },
          {
            type: "line",
            name:  `${arrayForCheckedCardsSymbolsInSite[1]}`,
            showInLegend: true,
            yValueFormatString: "#,##0.#$",
            color: "#C24642",
            dataPoints: dataPoints2

          },
          {
            type: "line",
            name:  `${arrayForCheckedCardsSymbolsInSite[2]}`,
            showInLegend: true,
            yValueFormatString: "#,##0.#$",
            color: "#B8CC06",
            dataPoints: dataPoints3

          },
          {
            type: "line",
            name:  `${arrayForCheckedCardsSymbolsInSite[3]}`,
            showInLegend: true,
            yValueFormatString: "#,##0.#$",
            color: "#CC06C2",
            dataPoints: dataPoints4

          },
          {
            type: "line",
            name:  `${arrayForCheckedCardsSymbolsInSite[4]}`,
            showInLegend: true,
            yValueFormatString: "#,##0.#$",
            color: "#141F15",
            dataPoints: dataPoints5
          },
        ],
    });

    chart.render();

    function toggleDataSeries(e) {
      if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      e.chart.render();
    }

    let updateChart = function () {

      $.get(CoinsLiveInfoData).then((ReportsDataRefreshed) => {

        let coinLiveData1 = reportsDataRefreshedValuesCheck(Object.values(ReportsDataRefreshed)[0]);
        let coinLiveData2 = reportsDataRefreshedValuesCheck(Object.values(ReportsDataRefreshed)[1]);
        let coinLiveData3 = reportsDataRefreshedValuesCheck(Object.values(ReportsDataRefreshed)[2]);
        let coinLiveData4 = reportsDataRefreshedValuesCheck(Object.values(ReportsDataRefreshed)[3]);
        let coinLiveData5 = reportsDataRefreshedValuesCheck(Object.values(ReportsDataRefreshed)[4]);

        dataPoints1.push({
          y: coinLiveData1
        });
        dataPoints2.push({
          y: coinLiveData2
        });
        dataPoints3.push({
          y: coinLiveData3
        });
        dataPoints4.push({
          y: coinLiveData4
        });
        dataPoints5.push({
          y: coinLiveData5
        });
      
        chart.render();
      })
      .fail(function (error) {
  
        console.log(error);
        alert("no data returned from server");
      })
    };

    setInterval(function () { updateChart() }, 2000);
})



function cardSymbolNameValueCheck(cardSymbol) {
  if (cardSymbol == undefined) {
    return cardSymbol = ""
  }
  else {
    return cardSymbol
  }
}

function reportsDataRefreshedValuesCheck(cardSymbol) {
  if (cardSymbol == undefined) {
    return cardSymbol = ""
  }
  else {
    return cardSymbol.USD
  }
}


$("#about").click((event)=> {
  hideMainPage()
  $("#chartUndefinedLabel").hide();
  $("#aboutMe").show(900);
  event.preventDefault();
})
