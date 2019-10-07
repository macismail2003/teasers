var oDataCusTS = [];
var oDataSaleTS = [];
var oDataITTS = [];
var oDataITAVLBTS = [];

var oITAVLBData = {
  items: []
};

var oDataChart = {
  cdash: [], // Customer Dashboard
  sdash: [], // Sales Dashboard
  idash: [], // IT Dashboard
  iadash: [] // IT Availability Dashboard
};
var oDataCusTSDESC = [];
var TimeoutFlag = false;
sap.ui.controller("cuspiechart.V_PieChart", {
  /**
   * Called when a controller is instantiated and its View controls (if available) are already created.
   * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
   * @memberOf zts_cd_07042017.V_PieChart
   */

  openCustDesc: function() {
    var oTABLECUSTDESC = new sap.ui.table.Table({
      visibleRowCount: 8,
      //columnHeaderVisible : false,
      //width: '300px',
      selectionMode: sap.ui.table.SelectionMode.None
    }).addStyleClass("sapUiSizeCompact tblBorder1");

    oTABLECUSTDESC.addColumn(
      new sap.ui.table.Column({
        label: new sap.ui.commons.Label({
          text: "Type",
          textAlign: "Left"
        }).addStyleClass("wraptextcol"),
        template: new sap.ui.commons.TextView()
          .bindProperty("text", "type")
          .addStyleClass("wraptext"),
        resizable: false,
        width: "50px"
      })
    );

    oTABLECUSTDESC.addColumn(
      new sap.ui.table.Column({
        label: new sap.ui.commons.Label({
          text: "Description",
          textAlign: "Left"
        }).addStyleClass("wraptextcol"),
        template: new sap.ui.commons.TextView()
          .bindProperty("text", "description")
          .addStyleClass("wraptext"),
        resizable: false,
        width: "250px"
      })
    );

    var oMODELCUSTDESC = new sap.ui.model.json.JSONModel();
    oMODELCUSTDESC.setData({ modelData: oDataCusTSDESC });

    oTABLECUSTDESC.setModel(oMODELCUSTDESC);
    //oTABLECUSTDESC.setVisibleRowCount(oDataCusTSDESC.length);
    oTABLECUSTDESC.bindRows("/modelData");

    var oDialog1Close = new sap.ui.commons.Button({
      text: "Close",
      //styled:false,
      visible: true,
      //type:sap.m.ButtonType.Unstyled,
      //icon: sap.ui.core.IconPool.getIconURI("email"),
      press: function(oEvent) {
        oDialog1.close();
      }
    });

    if (sap.ui.getCore().byId("idDialog1Desc"))
      sap.ui
        .getCore()
        .byId("idDialog1Desc")
        .destroy();

    var oDialog1 = new sap.ui.commons.Dialog("idDialog1Desc", {
      //width : "50%",
      //height : "400px",
      showCloseButton: true,
      modal: false,
      keepInWindow: true
    });
    //oDialog1.setTitle("My first Dialog");
    //var oText = new sap.ui.commons.TextView({text: "Hello World!"});
    oDialog1.addContent(
      new sap.m.FlexBox({
        direction: "Column",
        items: [
          oTABLECUSTDESC /*, new sap.m.Label({width : "15px"}), oDialog1Close*/
        ]
      })
    );
    oDialog1.open();
  },
  onInit: function() {
    var oCurrent = this;

    //      1.Create a JSON Model and load the data

    //busyDialog.open();

    oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
    var urlCus = serviceUrl + "/custSet";

    OData.request(
      {
        requestUri: urlCus,
        method: "GET",
        dataType: "json",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
          DataServiceVersion: "2.0",
          "X-CSRF-Token": "Fetch"
        }
      },
      function(data, response) {
        //busyDialog.close();
        if (data.results.length == 0) {
          sap.ui.commons.MessageBox.show(
            "No data found",
            sap.ui.commons.MessageBox.Icon.WARNING,
            "Warning",
            [sap.ui.commons.MessageBox.Action.OK],
            sap.ui.commons.MessageBox.Action.OK
          );
        } else {
          oDataCusTS = [];
          oDataChart = {
            cdash: []
          };
          oDataCusTSDESC = [];
          var splitdesc = [];
          for (var i = 0; i < data.results.length; i++) {
            splitdesc = data.results[i].Cr.split("-$");
            if (splitdesc[1] != "" && splitdesc[1] != undefined)
              splitdesc[1] = splitdesc[1].trim();
            oDataCusTSDESC.push({
              type: splitdesc[0].trim().substr(1),
              description: splitdesc[1]
            });
            oDataCusTS.push({
              Region: data.results[i].Region,
              Credit: splitdesc[0].trim().substr(1),
              Number: data.results[i].Noc,
              NBV: data.results[i].Nbv,
              Head: data.results[i].Crh
            });
          }

          // 2. Get distinct descriptions
          oDataCusTSDESC = oCurrent.getDistinctDescriptions(oDataCusTSDESC);

          // 2. Get distince regions
          var regions = oCurrent.getDistinctRegions(oDataCusTS);

          //3. Extract data only for the first entry in the dropdown

          for (var i = 0; i < oDataCusTS.length; i++) {
            //if(oDataCusTS[i].Region == regions[0]){
            oDataChart.cdash.push({
              Region: oDataCusTS[i].Region,
              Credit: oDataCusTS[i].Credit,
              Number: oDataCusTS[i].Number,
              NBV: oCurrent.getComposition(oDataCusTS[i].NBV, "All"),
              Head: oDataCusTS[i].Head
            });
            //}
          }

          var holder = {};

          oDataChart.cdash.forEach(function(d) {
            if (holder.hasOwnProperty(d.Credit)) {
              holder[d.Credit] = holder[d.Credit] + parseFloat(d.NBV);
            } else {
              holder[d.Credit] = parseFloat(d.NBV);
            }
          });

          var obj2 = [];

          for (var prop in holder) {
            obj2.push({ Credit: prop, NBV: holder[prop] });
          }

          console.log(obj2);

          oDataChart.cdash = obj2;

          var oModelChart = new sap.ui.model.json.JSONModel();
          oModelChart.setData(oDataChart);

          //		          3.Get the id of the VizFrame
          var oVizFrame = oCurrent.getView().byId("idVizFrameCus");

          //		          4. Create Viz dataset to feed to the data to the graph
          var oDatasetChart = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [
              {
                axis: 1,
                name: "Credit Rating",
                value: "{Credit}"
              }
            ],

            measures: [
              {
                name: "NBV Exposure %",
                value: "{NBV}"
              },

              { name: "Number Of Customers", value: "{Number}" },

              {
                name: "Credit Headroom %",
                value: "{Head}"
              }
            ],

            data: {
              path: "/cdash"
            }
          });
          oVizFrame.setDataset(oDatasetChart);
          oVizFrame.setModel(oModelChart);

          //		          5.Set Viz properties

          oVizFrame.setVizProperties({
            title: {
              //text : "Customer Dashboard"
              text: "NBV(%) by Credit Rating"
            },
            plotArea: {
              colorPalette: d3.scale.category20().range(),
              drawingEffect: "glossy"
            }
          });

          var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
            uid: "size",
            type: "Measure",
            values: ["NBV Exposure %"]
          });
          oVizFrame.addFeed(feedSize);

          var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
            uid: "color",
            type: "Dimension",
            values: ["Credit Rating"]
          });

          oVizFrame.addFeed(feedColor);

          // 6. Set region combobox
          oCurrent.setComboModel(regions);

          //setTimeout(function() { sap.ui.getCore().byId("idV_PieChart1--idCarouselTeaser").next(); }, 2000);

          /*sap.m.Page.prototype.onmouseover=function() {
		    			 console.log('over');
		    			 setTimeout(function() { sap.ui.getCore().byId("idV_PieChart1--idCarouselTeaser").next(); }, 100000);
		    		};

		    		sap.m.Page.prototype.onmouseout=function() {
		    			console.log('out');
		    			setTimeout(function() { sap.ui.getCore().byId("idV_PieChart1--idCarouselTeaser").next(); }, 2000);
		    		};*/
        }

        /* Container Sale Dashboard Teaser */

        oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
        var urlCus = serviceUrl + "/saleSet";

        OData.request(
          {
            requestUri: urlCus,
            method: "GET",
            dataType: "json",
            headers: {
              "X-Requested-With": "XMLHttpRequest",
              "Content-Type": "application/json; charset=utf-8",
              DataServiceVersion: "2.0",
              "X-CSRF-Token": "Fetch"
            }
          },
          function(data, response) {
            //busyDialog.close();
            if (data.results.length == 0) {
              sap.ui.commons.MessageBox.show(
                "No data found",
                sap.ui.commons.MessageBox.Icon.WARNING,
                "Warning",
                [sap.ui.commons.MessageBox.Action.OK],
                sap.ui.commons.MessageBox.Action.OK
              );
            } else {
              oDataSaleTS = [];
              oDataChart = {
                sdash: []
              };

              var oSalesData = {
                items: []
              };
              oSalesData.items = oDataSaleTS = data.results;

              /*var oSalesData = {
			    				"items" : [
			    				             {
			    				                 "Week": "35.2017",
			    				                 "Asia": "33",
			    				                 "Americas": "25",
			    				                 "Europe": "44",
			    				                 "Oceania": "11",
			    				             },
			    				             {
			    				                 "Week": "36.2017",
			    				                 "Asia": "35",
			    				                 "Americas": "28",
			    				                 "Europe": "47",
			    				                 "Oceania": "12",
			    				             },
			    				             {
			    				                 "Week": "37.2017",
			    				                 "Asia": "39",
			    				                 "Americas": "29",
			    				                 "Europe": "49",
			    				                 "Oceania": "15",
			    				             },
			    				             {
			    				                 "Week": "38.2017",
			    				                 "Asia": "46",
			    				                 "Americas": "30",
			    				                 "Europe": "54",
			    				                 "Oceania": "19",
			    				             }
			    				        ]
			    				        };*/

              var sampleDatajson = new sap.ui.model.json.JSONModel(oSalesData);
              var oVizFrameSale = oCurrent.getView().byId("idVizFrameSale");
              oVizFrameSale.setVizProperties({
                plotArea: {
                  colorPalette: d3.scale.category20().range(),
                  dataLabel: {
                    showTotal: true
                  }
                },
                tooltip: {
                  visible: true
                },
                title: {
                  text: "Net Sales by Region($MM)"
                },
                valueAxis: {
                  title: {
                    text: ""
                  }
                }
                /*yAxis : {
			                     scale: {
			                               fixedRange : true,
			                               minValue : 10000000,
			                               maxValue : 100000000
			                 }
			    			 }*/
              });

              var oSalesDataset = new sap.viz.ui5.data.FlattenedDataset({
                dimensions: [
                  {
                    name: "Week",
                    value: "{Week}"
                  }
                ],

                measures: [
                  {
                    name: "Asia",
                    value: "{Asia}"
                  },
                  {
                    name: "Americas",
                    value: "{Americas}"
                  },
                  {
                    name: "Europe",
                    value: "{Europe}"
                  },
                  {
                    name: "Oceania",
                    value: "{Oceania}"
                  }
                ],

                data: {
                  path: "/items"
                }
              });

              oVizFrameSale.setDataset(oSalesDataset);

              oVizFrameSale.setModel(sampleDatajson);

              var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem(
                  {
                    uid: "valueAxis",
                    type: "Measure",
                    values: ["Asia"]
                  }
                ),
                oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem(
                  {
                    uid: "valueAxis",
                    type: "Measure",
                    values: ["Americas"]
                  }
                ),
                oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem(
                  {
                    uid: "valueAxis",
                    type: "Measure",
                    values: ["Europe"]
                  }
                ),
                oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem(
                  {
                    uid: "valueAxis",
                    type: "Measure",
                    values: ["Oceania"]
                  }
                ),
                oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem(
                  {
                    uid: "categoryAxis",
                    type: "Dimension",
                    values: ["Week"]
                  }
                );

              oVizFrameSale.addFeed(oFeedValueAxis);
              oVizFrameSale.addFeed(oFeedValueAxis1);
              oVizFrameSale.addFeed(oFeedValueAxis2);
              oVizFrameSale.addFeed(oFeedValueAxis3);
              oVizFrameSale.addFeed(oFeedCategoryAxis);
            }
          },
          function(err) {
            //busyDialog.close();
            //errorfromServer(err);
            //alert("Error in data read from SAP");
          }
        );
      },
      function(err) {
        //busyDialog.close();
        //errorfromServer(err);
        //alert("Error in data read from SAP");
      }
    );

    /* Today's UTE */

    oModel = new sap.ui.model.odata.ODataModel(
      "/sap/opu/odata/sap/ZUTIL_ERP_SRV",
      true
    );
    var urlUT =
      "/sap/opu/odata/sap/ZUTIL_ERP_SRV/ZUTIL_SUMS?$filter=Reqtype eq 'F'";

    OData.request(
      {
        requestUri: urlUT,
        method: "GET",
        dataType: "json",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
          DataServiceVersion: "2.0",
          "X-CSRF-Token": "Fetch"
        }
      },
      function(data, response) {
        //busyDialog.close();
        if (data.results.length == 0) {
          sap.ui.commons.MessageBox.show(
            "No data found",
            sap.ui.commons.MessageBox.Icon.WARNING,
            "Warning",
            [sap.ui.commons.MessageBox.Action.OK],
            sap.ui.commons.MessageBox.Action.OK
          );
        } else {
          var oTextValueTodayUTE = "";
          for (var i = 0; i < data.results.length; i++) {
            if (
              data.results[i].Comp == "BOTH" &&
              data.results[i].Eqcat == "TOTAL"
            ) {
              oTextValueTodayUTE = data.results[i].Utiliz + "%";
            }
          }

          sap.ui
            .getCore()
            .byId("idV_PieChart1--idTextValueTodayUTE")
            .setText(oTextValueTodayUTE);
        }
      },
      function(err) {
        //busyDialog.close();
        //errorfromServer(err);
        //alert("Error in data read from SAP");
      }
    );

    // return;

    /* Container IT Dashboard Teaser */

    oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
    var urlCus = serviceUrl + "/itSet";

    OData.request(
      {
        requestUri: urlCus,
        method: "GET",
        dataType: "json",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
          DataServiceVersion: "2.0",
          "X-CSRF-Token": "Fetch"
        }
      },
      function(data, response) {
        //busyDialog.close();
        if (data.results.length == 0) {
          sap.ui.commons.MessageBox.show(
            "No data found",
            sap.ui.commons.MessageBox.Icon.WARNING,
            "Warning",
            [sap.ui.commons.MessageBox.Action.OK],
            sap.ui.commons.MessageBox.Action.OK
          );
        } else {
          oDataITTS = [];
          oDataChart = {
            idash: []
          };

          var oITData = {
            items: []
          };
          oITData.items = oDataITTS = data.results;

          /*var oITData = {
				    				"items" : [
				    				             {
				    				                 "Dates": "22.11.2017",
				    				                 "Per": "370",
				    				                 "Pcr": "221",
				    				                 "Pbi": "662"
				    				             },
				    				             {
				    				                 "Dates": "23.11.2017",
				    				                 "Per": "331",
				    				                 "Pcr": "256",
				    				                 "Pbi": "222"
				    				             },
				    				             {
				    				                 "Dates": "24.11.2017",
				    				                 "Per": "877",
				    				                 "Pcr": "444",
				    				                 "Pbi": "230"
				    				             },
				    				             {
				    				                 "Dates": "25.11.2017",
				    				                 "Per": "440",
				    				                 "Pcr": "250",
				    				                 "Pbi": "666"
				    				             },
				    				             {
				    				                 "Dates": "26.11.2017",
				    				                 "Per": "199",
				    				                 "Pcr": "453",
				    				                 "Pbi": "244"
				    				             }
				    				        ]
				    				        };*/

          var ITDatajson = new sap.ui.model.json.JSONModel(oITData);
          var oVizFrameIT = oCurrent.getView().byId("idVizFrameIT");
          oVizFrameIT.setVizProperties({
            plotArea: {
              colorPalette: d3.scale.category20().range(),
              dataLabel: {
                showTotal: true
              }
            },
            tooltip: {
              //visible: true
            },
            title: {
              text: ""
            },
            valueAxis: {
              title: {
                text: "Avg. Response Time (ms)"
              }
            }
            /*yAxis : {
				                     scale: {
				                               fixedRange : true,
				                               minValue : 10000000,
				                               maxValue : 100000000
				                 }
				    			 }*/
          });

          var oITDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [
              {
                name: "Date",
                value: "{Dates}"
              }
            ],

            measures: [
              {
                name: "PER",
                value: "{Per}"
              },
              {
                name: "PCR",
                value: "{Pcr}"
              }
              //				    			{
              //				    				name: "PBI",
              //				    				value: "{Pbi}"
              //				    			}
            ],

            data: {
              path: "/items"
            }
          });

          oVizFrameIT.setDataset(oITDataset);

          oVizFrameIT.setModel(ITDatajson);

          var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
              uid: "valueAxis",
              type: "Measure",
              values: ["PER"]
            }),
            oFeedValueAxis1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
              uid: "valueAxis",
              type: "Measure",
              values: ["PCR"]
            }),
            //				    			oFeedValueAxis2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
            //				    				"uid": "valueAxis",
            //				    				"type": "Measure",
            //				    				"values": ["PBI"],
            //				    			}),
            //				    			oFeedValueAxis3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
            //				    				"uid": "valueAxis",
            //				    				"type": "Measure",
            //				    				"values": ["Oceania"],
            //				    			}),

            oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
              uid: "categoryAxis",
              type: "Dimension",
              values: ["Date"]
            });

          oVizFrameIT.addFeed(oFeedValueAxis);
          oVizFrameIT.addFeed(oFeedValueAxis1);
          //oVizFrameIT.addFeed(oFeedValueAxis2);
          //oVizFrameIT.addFeed(oFeedValueAxis3);
          oVizFrameIT.addFeed(oFeedCategoryAxis);
        }
      },
      function(err) {
        //busyDialog.close();
        //errorfromServer(err);
        //alert("Error in data read from SAP");
      }
    );

    /* IT Availability Teaser */


    oModel = new sap.ui.model.odata.ODataModel(serviceUrl, true);
    var urlCusAvlb = serviceUrlITAVLB + "/avlbSet";

    OData.request(
      {
        requestUri: urlCusAvlb,
        method: "GET",
        dataType: "json",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json; charset=utf-8",
          DataServiceVersion: "2.0",
          "X-CSRF-Token": "Fetch"
        }
      },
      function(data, response) {
        //busyDialog.close();
        if (data.results.length == 0) {
          sap.ui.commons.MessageBox.show(
            "No data found",
            sap.ui.commons.MessageBox.Icon.WARNING,
            "Warning",
            [sap.ui.commons.MessageBox.Action.OK],
            sap.ui.commons.MessageBox.Action.OK
          );
        } else {
          oDataITAVLBTS = [];
          oDataChart = {
            iadash: []
          };

          oITAVLBData = {
            items: []
          };

          oITAVLBData.items = oDataITAVLBTS = data.results;

          /* Convert month and year into single field 
							 03 2019 should become Mar 2019 */
          // var smonth = "";
					// var syear = "";
					
          var monyear = "";

          for (var i = 0; i < oITAVLBData.items.length; i++) {
            switch (oITAVLBData.items[i].Smonth) {
              case "01":
                monyear = "Jan " + oITAVLBData.items[i].Syear;
                break;
              case "02":
                monyear = "Feb " + oITAVLBData.items[i].Syear;
                break;
              case "03":
                monyear = "Mar " + oITAVLBData.items[i].Syear;
                break;
              case "04":
                monyear = "Apr " + oITAVLBData.items[i].Syear;
                break;
              case "05":
                monyear = "May " + oITAVLBData.items[i].Syear;
                break;
              case "06":
                monyear = "Jun " + oITAVLBData.items[i].Syear;
                break;
              case "07":
                monyear = "Jul " + oITAVLBData.items[i].Syear;
                break;
              case "08":
                monyear = "Aug " + oITAVLBData.items[i].Syear;
                break;
              case "09":
                monyear = "Sep " + oITAVLBData.items[i].Syear;
                break;
              case "10":
                monyear = "Oct " + oITAVLBData.items[i].Syear;
                break;
              case "11":
                monyear = "Nov " + oITAVLBData.items[i].Syear;
                break;
              case "12":
                monyear = "Dec " + oITAVLBData.items[i].Syear;
                break;
						}
						
						oITAVLBData.items[i].Dates = monyear;
          }

          // oITAVLBData = {
          // 		"items" : [
          // 			{
          // 					"Dates": "Jan 2019",
          // 					"Per": "98",
          // 					"Pcr": "97",
          // 					"Sla": "99.5"
          // 			},
          // 			{
          // 					"Dates": "Feb 2019",
          // 					"Per": "96",
          // 					"Pcr": "97",
          // 					"Sla": "99.5"
          // 			},
          // 			{
          // 					"Dates": "Mar 2019",
          // 					"Per": "95",
          // 					"Pcr": "96",
          // 					"Sla": "99.5"
          // 			}
          // ]
          // };

          var minimumScale = getMinYMinusThree(oITAVLBData.items);

          var ITAVLBDatajson = new sap.ui.model.json.JSONModel(oITAVLBData);
          var oVizFrameITAVLB = oCurrent.getView().byId("idVizFrameITAVLB");
          oVizFrameITAVLB.setVizProperties({
            plotArea: {
              colorPalette: d3.scale.category20().range(),
              dataLabel: {
                showTotal: true
              }
            },
            tooltip: {
              //visible: true
            },
            title: {
              text: ""
            },
            valueAxis: {
              title: {
                text: "System Availability(%)"
              }
            },
            yAxis: {
              scale: {
                fixedRange: true,
                minValue: minimumScale,
                maxValue: 100
              }
            }
          });

          oVizFrameITAVLB.setVizProperties({
            plotArea: { dataShape : {primaryAxis : ['bar','bar'],
                                    secondaryAxis : ['line']}}
        });

          var oITAVLBDataset = new sap.viz.ui5.data.FlattenedDataset({
            dimensions: [
              {
                name: "Month",
                value: "{Dates}"
              }
            ],

            measures: [
              {
                name: "PER",
                value: "{Per}"
              },
              {
                name: "PCR",
                value: "{Pcr}"
              },
              {
                name: "SLA",
                value: "{Sla}"
              }
            ],

            data: {
              path: "/items"
            }
          });

          oVizFrameITAVLB.setDataset(oITAVLBDataset);

          oVizFrameITAVLB.setModel(ITAVLBDatajson);

          var oFeedValueAxisITAVLBPER = new sap.viz.ui5.controls.common.feeds.FeedItem(
              {
                uid: "valueAxis",
                type: "Measure",
                values: ["PER"]
              }
            ),
            oFeedValueAxisITAVLBPCR = new sap.viz.ui5.controls.common.feeds.FeedItem(
              {
                uid: "valueAxis",
                type: "Measure",
                values: ["PCR"]
              }
            ),
            oFeedValueAxisITAVLBSLA = new sap.viz.ui5.controls.common.feeds.FeedItem(
              {
                uid: "valueAxis",
                type: "Measure",
                values: ["SLA"]
              }
            ),
            oFeedCategoryAxisITAVLB = new sap.viz.ui5.controls.common.feeds.FeedItem(
              {
                uid: "categoryAxis",
                type: "Dimension",
                values: ["Month"]
              }
            );

          oVizFrameITAVLB.addFeed(oFeedValueAxisITAVLBPER);
          oVizFrameITAVLB.addFeed(oFeedValueAxisITAVLBPCR);
          oVizFrameITAVLB.addFeed(oFeedValueAxisITAVLBSLA);
          oVizFrameITAVLB.addFeed(oFeedCategoryAxisITAVLB);
        }
      },
      function(err) {
        //busyDialog.close();
        //errorfromServer(err);
        //alert("Error in data read from SAP");
      }
    );

    /*var oModelChart = new sap.ui.model.json.JSONModel();
		var data = {
			'cdash' : [{
				  "Credit": "A",
				  "Number": "6",
				  "NBV": "4.2",
				  "Head": "10.6",
				}, {
					   "Credit": "B",
					  "Number": "87",
					  "NBV": "20.5",
					  "Head": "28.1",
				}, {
					"Credit": "C1",
					  "Number": "444",
					  "NBV": "65.5",
					  "Head": "49.9",
				}, {
					"Credit": "C2",
					  "Number": "22",
					  "NBV": "2.6",
					  "Head": "0.8",
				}, {
					"Credit": "C3",
					  "Number": "127",
					  "NBV": "0.2",
					  "Head": "0.3",
				},

				{
					"Credit": "E",
					  "Number": "7",
					  "NBV": "0.7",
					  "Head": "0.6",
				},

				{
					"Credit": "P",
					  "Number": "9",
					  "NBV": "0.0",
					  "Head": "0.1",
				},

				{
					"Credit": "S1",
					  "Number": "29",
					  "NBV": "1.9",
					  "Head": "1.1",
				},

				{
					"Credit": "S2",
					  "Number": "20",
					  "NBV": "0.2",
					  "Head": "0.5",
				},

				{
					"Credit": "S3",
					  "Number": "21",
					  "NBV": "1.5",
					  "Head": "6.4",
				},

				{
					"Credit": "U",
					  "Number": "27",
					  "NBV": "2.7",
					  "Head": "1.7",
				}
				]};
		oModelChart.setData(data);

//      3. Create Viz dataset to feed to the data to the graph
		var oDataset = new sap.viz.ui5.data.FlattenedDataset({
			dimensions : [{
				axis : 1,
			        name : 'Credit Rating',
				value : "{Credit}"}],

			measures : [{

					name : 'NBV Exposure %',
					value : '{NBV}'},

					{name : 'Number Of Customers',
					value : '{Number}'},

					{
						name : 'Credit Headroom %',
						value : '{Head}'}

					],

			data : {
				path : "/cdash"
			}
		});
		oVizFrame.setDataset(oDataset);
		oVizFrame.setModel(oModel);

//      4.Set Viz properties
		oVizFrame.setVizProperties({
			title:{
				text : "Customer Dashboard"
			},
            plotArea: {
            	colorPalette : d3.scale.category20().range(),
            	drawingEffect: "glossy"
        }});

		var feedSize = new sap.viz.ui5.controls.common.feeds.FeedItem({
		      'uid': "size",
		      'type': "Measure",
		      'values': ["NBV Exposure %"]
		    });
		oVizFrame.addFeed(feedSize);

		var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
		      'uid': "color",
		      'type': "Dimension",
		      'values': ["Credit Rating"]
		    });

		oVizFrame.addFeed(feedColor);

		oCurrent.setComboModel();*/

    /* ******************************	************************************	**********************************	*/

    /*var oModel = new sap.ui.model.json.JSONModel();
		var data = {
			'cdash' : [{
				  "Credit": "A",
				  "Number": "6",
				  "NBV": "4.2",
				  "Head": "10.6",
				}, {
					   "Credit": "B",
					  "Number": "87",
					  "NBV": "20.5",
					  "Head": "28.1",
				}, {
					"Credit": "C1",
					  "Number": "444",
					  "NBV": "65.5",
					  "Head": "49.9",
				}, {
					"Credit": "C2",
					  "Number": "22",
					  "NBV": "2.6",
					  "Head": "0.8",
				}, {
					"Credit": "C3",
					  "Number": "127",
					  "NBV": "0.2",
					  "Head": "0.3",
				},

				{
					"Credit": "E",
					  "Number": "7",
					  "NBV": "0.7",
					  "Head": "0.6",
				},

				{
					"Credit": "P",
					  "Number": "9",
					  "NBV": "0.0",
					  "Head": "0.1",
				},

				{
					"Credit": "S1",
					  "Number": "29",
					  "NBV": "1.9",
					  "Head": "1.1",
				},

				{
					"Credit": "S2",
					  "Number": "20",
					  "NBV": "0.2",
					  "Head": "0.5",
				},

				{
					"Credit": "S3",
					  "Number": "21",
					  "NBV": "1.5",
					  "Head": "6.4",
				},

				{
					"Credit": "U",
					  "Number": "27",
					  "NBV": "2.7",
					  "Head": "1.7",
				}
				]};
		oModel.setData(data);


		  var oVizFrame = this.getView().byId("idVizFramePie");
		  var oPopOver = this.getView().byId("idPopOver");
		  //var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZCP_AP_INVOICE_GW_SRV", true);
		  //oModel.read("/invoiceSet", {
		  //success: function() {


		  var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
				        name : 'Credit Rating',
					value : "{Credit}"}],

				measures : [{
						//group:1,
						name : 'NBV Exposure %',
						value : '{NBV}'},

						{//group:1,
							name : 'Number Of Customers',
						value : '{Number}'},

						{	//group:1,
							name : 'Credit Headroom %',
							value : '{Head}'}

						],

				data : {
					path : "/cdash"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(oModel);

			  var feedColor = new sap.viz.ui5.controls.common.feeds.FeedItem({
				  'uid': "categoryAxis",
				  'type': "Dimension",
				  'values': ["Credit Rating"]
				  });

				  oVizFrame.addFeed(feedColor);

		  var feedSize1 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			  'id':"value1",
		  'uid': "primaryValues",
		  'type': "Measure",
		  'values': ["NBV Exposure %"]
		  });
		  oVizFrame.addFeed(feedSize1);

		  var feedSize2 = new sap.viz.ui5.controls.common.feeds.FeedItem({
			  'id':"value2",
			  'uid': "primaryValues",
			  'type': "Measure",
			  'values': ["Number Of Customers"]
			  });
			  oVizFrame.addFeed(feedSize2);

			  var feedSize3 = new sap.viz.ui5.controls.common.feeds.FeedItem({
				  'id':"value3",
				  'uid': "primaryValues",
				  'type': "Measure",
				  'values': ["Credit Headroom %"]
				  });
				  oVizFrame.addFeed(feedSize3);*/
  },

  /**
   * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
   * (NOT before the first rendering! onInit() is used for that one!).
   * @memberOf zts_cd_07042017.V_PieChart
   */
  onBeforeRendering: function() {
    /*var ocus = new cus();
		var cuschart = ocus.createCusPage();

		var osales = new sales();
		var saleschart = new sap.m.Button({
     	   text : "Full Dashboard",
    	   type : sap.m.ButtonType.Unstyled,
    	   press : function(){
    		   oCurrent.openSalesDash();
    	   }
       }).addStyleClass("submitBtn");//osales.createSalesPage();

		var jsonCharts = [cuschart, saleschart];


		//var oCarouselTeaser = sap.ui.getCore().byId("idCarouselTeaser");
		var oCarouselTeaser = this.getView().byId("idCarouselTeaser");
		//oCarouselTeaser.setActivePage(jsonCharts[0]);
		//oCarouselTeaser.setLoop(true);
		oCarouselTeaser.insertPage(jsonCharts[0]);
		oCarouselTeaser.insertPage(jsonCharts[1]);*/
  },

  /**
   * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
   * This hook is the same one that SAPUI5 controls get after being rendered.
   * @memberOf zts_cd_07042017.V_PieChart
   */

  /**
   * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
   * @memberOf zts_cd_07042017.V_PieChart
   */
  onExit: function() {},

  onSelect: function(oEvent) {
    var oCurrent = this;
    var regionkey = oEvent
      .getParameters("selectedItem")
      .selectedItem.getProperty("key");
    //var regiontext = oEvent.getParameters("selectedItem").selectedItem.getProperty("text");
    oDataChart.cdash = [];
    if (regionkey == "All") {
      for (var i = 0; i < oDataCusTS.length; i++) {
        oDataChart.cdash.push({
          Region: oDataCusTS[i].Region,
          Credit: oDataCusTS[i].Credit,
          Number: oDataCusTS[i].Number,
          NBV: oCurrent.getComposition(oDataCusTS[i].NBV, "All"),
          Head: oDataCusTS[i].Head
        });

        var holder = {};

        oDataChart.cdash.forEach(function(d) {
          if (holder.hasOwnProperty(d.Credit)) {
            holder[d.Credit] = holder[d.Credit] + parseFloat(d.NBV);
          } else {
            holder[d.Credit] = parseFloat(d.NBV);
          }
        });

        var obj2 = [];

        for (var prop in holder) {
          obj2.push({ Credit: prop, NBV: holder[prop] });
        }

        console.log(obj2);

        oDataChart.cdash = obj2;
      }
    } else {
      for (var i = 0; i < oDataCusTS.length; i++) {
        if (oDataCusTS[i].Region == regionkey) {
          oDataChart.cdash.push({
            Region: oDataCusTS[i].Region,
            Credit: oDataCusTS[i].Credit,
            Number: oDataCusTS[i].Number,
            NBV: oCurrent.getComposition(
              oDataCusTS[i].NBV,
              oDataCusTS[i].Region
            ),
            Head: oDataCusTS[i].Head
          });
        }
      }
    }

    var oModelChart = new sap.ui.model.json.JSONModel();
    oModelChart.setData(oDataChart);

    //      3.Get the id of the VizFrame
    var oVizFrame = oCurrent.getView().byId("idVizFrameCus");

    //      4. Create Viz dataset to feed to the data to the graph
    var oDatasetChart = new sap.viz.ui5.data.FlattenedDataset({
      dimensions: [
        {
          axis: 1,
          name: "Credit Rating",
          value: "{Credit}"
        }
      ],

      measures: [
        {
          name: "NBV Exposure %",
          value: "{NBV}"
        },

        { name: "Number Of Customers", value: "{Number}" },

        {
          name: "Credit Headroom %",
          value: "{Head}"
        }
      ],

      data: {
        path: "/cdash"
      }
    });
    oVizFrame.setDataset(oDatasetChart);
    oVizFrame.setModel(oModelChart);
  },

  opendash: function() {
    window.open(
      "http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AQzakHGcK7VBi9kqQyI3CwY"
    );
  },

  opensale: function() {
    window.open(
      "http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AczxpRnQEphMgyvW.lMKqn8"
    );
  },

  openproducts: function() {
    window.open(
      "http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AThMzy8TjMtNj3LeV3.lSLM"
    );
  },

  openit: function() {
    window.open(
      "http://sappboci.seaco.com:8080/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AdPl0gnIFPJJlaw_1pJ6Eq8"
    );
  },

  /**
   * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
   * (NOT before the first rendering! onInit() is used for that one!).
   * @memberOf zts_cd_07042017.V_PieChart
   */
  //	onBeforeRendering: function() {
  //
  //	},

  /**
   * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
   * This hook is the same one that SAPUI5 controls get after being rendered.
   * @memberOf zts_cd_07042017.V_PieChart
   */
  setComboModel: function(regions) {
    var ddlRegionData = [];
    ddlRegionData.push({
      key: "All",
      text: "All"
    });

    for (var i = 0; i < regions.length; i++) {
      ddlRegionData.push({
        key: regions[i],
        text: regions[i]
      });
    }

    var oDdlRegionModel = new sap.ui.model.json.JSONModel();
    oDdlRegionModel.setSizeLimit(99999);
    oDdlRegionModel.setData({ data: ddlRegionData });

    var oComboRegion = this.getView().byId("idComboRegion");
    oComboRegion.setModel(oDdlRegionModel);
    oComboRegion.bindItems(
      "/data",
      new sap.ui.core.ListItem({ text: "{text}", key: "{key}" })
    );
    oComboRegion.setSelectedKey(ddlRegionData[0].key);
  },

  getDistinctRegions: function(input) {
    var flags = [],
      output = [],
      l = input.length,
      i;
    for (i = 0; i < l; i++) {
      if (flags[input[i].Region]) continue;
      flags[input[i].Region] = true;
      output.push(input[i].Region);
    }

    return output;
  },

  getDistinctDescriptions: function(input) {
    var flags = [],
      output = [],
      l = oDataCusTSDESC.length,
      i;
    for (i = 0; i < l; i++) {
      if (flags[oDataCusTSDESC[i].type]) continue;
      flags[oDataCusTSDESC[i].type] = true;
      output.push(oDataCusTSDESC[i]);
    }

    return output;
  },

  getComposition: function(nbv, region) {
    var compos = 0.0;

    if (region == "All") {
      for (var j = 0; j < oDataCusTS.length; j++) {
        compos = compos + parseFloat(oDataCusTS[j].NBV);
      }
    } else {
      for (var j = 0; j < oDataCusTS.length; j++) {
        if (oDataCusTS[j].Region == region) {
          compos = compos + parseFloat(oDataCusTS[j].NBV);
        }
      }
    }

    compos = (nbv / compos) * 100;
    compos = thousandsep(compos);
    return compos;
  },

  pageChanged: function() {
    //setTimeout(function() { sap.ui.getCore().byId("idV_PieChart1--idCarouselTeaser").next(); }, 2000);
    //window.setInterval(CheckIdleTime, 2000);
  }
});

function CheckIdleTime() {
  _idleSecondsCounter++;

  if (_idleSecondsCounter >= IDLE_TIMEOUT) {
    // && !TimeoutFlag
    TimeoutFlag = true;
    if (sap.ui.getCore().byId("idDialog1Desc"))
      sap.ui
        .getCore()
        .byId("idDialog1Desc")
        .close();
    sap.ui
      .getCore()
      .byId("idV_PieChart1--idCarouselTeaser")
      .next();
  }
}

function getMinYMinusThree(data) {
  var minimumValuePer = data.reduce(
    (min, p) => (p.Per < min ? p.Per : min),
    data[0].Per
  );
  var minimumvalueMinusThreePer = minimumValuePer - 3;
  minimumvalueMinusThreePer = parseInt(minimumvalueMinusThreePer);

  var minimumValuePcr = data.reduce(
    (min, p) => (p.Pcr < min ? p.Pcr : min),
    data[0].Pcr
  );
  var minimumvalueMinusThreePcr = minimumValuePcr - 3;
  minimumvalueMinusThreePcr = parseInt(minimumvalueMinusThreePcr);

  if (minimumvalueMinusThreePer < minimumvalueMinusThreePcr) {
    return minimumvalueMinusThreePer;
  } else {
    return minimumvalueMinusThreePcr;
  }
}

function getMaxY(data) {
  return data.reduce((max, p) => (p.Per > max ? p.Per : max), data[0].Per);
}
