import CanvasJSReact from './canvasjs.react';

var React = require('react');
var Component = React.Component;
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var dataPoints =[];
var chart;
var stock_exists=false;

CanvasJS.addColorSet("colors",["#0000FF","#DC143C","#7FFF00","#FF69B4","#006400"])

class ChartDrawer extends Component {
    
    handleChange = (e) =>{
        if(stock_exists===true)
        {
            console.log(e.target.checked)
            if(e.target.checked)
            {
                console.log(e.target.id);
                chart = this.chart;
                var name = this.props[0];
                console.log(this.props[0]);
                var indicator = e.target.id.split(" ");
                
                fetch(`/api/indicators/${indicator[0]}/${name}-${indicator[1]}`)
                .then(function(response) {
                    console.log(response.status);
                    return response.json();
                })
                .then(function(data2) {
                    console.log(data2);
                    chart.options.title.text = name; 
                    let properties = {
                        type: "line",
                        name: indicator[0]+" "+indicator[1],
                        showInLegend: true,
                        yValueFormatString: "$##0.00",
                        xValueType: "dateTime",
                        dataPoints: []
                    }
                    let api_res = data2['timestamp'].map((ele, index) => {
                        return [new Date(ele), data2['analysis_data'][index]];
                    });
        
                    api_res.sort((a, b) => a[0]-b[0]);
                    console.log(api_res);

                    for(let i=0; i<api_res.length; i++)
                    {
                        properties.dataPoints.push({
                            
                            x: api_res[i][0],
                            y: api_res[i][1]
                        });
                    }
                    chart.addTo("data",properties);
                    chart.render(); 
                });
            }
            else
            {
                chart = this.chart;
                var idx=0;
                for(let i in chart.options.data)
                {
                    console.log(i)  
                    if(chart.options.data[idx].name===e.target.id)
                    {
                        chart.options.data.splice(idx,1);
                        break;
                    }
                    idx++;
                }
                chart.render();
            }
        }
            
    }
        
    

	render() {
		    var options = {
			exportEnabled: true,
			zoomEnabled: true,
            animationEnabled: true,
            colorSet: "colors",
			title: {
				text: "",
				fontFamily: "calibri"
			},
			axisX: {
				intervalType: "month",
				valueFormatString: "YYYY-MM-DD"
			},
			axisY: {
				title: "Price",
				titleFontFamily: "calibri",
				includeZero: false,
				prefix: "$"
			},
			data: [{
                type: "line",
				name: "",
				showInLegend: true,
				yValueFormatString: "$##0.00",
				xValueType: "dateTime",
				dataPoints: dataPoints
			}]
		}

       

		return (
		<div>
			<CanvasJSChart options = {options}
				 onRef={ref => this.chart = ref}
			/>
            <form>
                <label>
                    <input type="checkbox" onChange={this.handleChange} id="SMA 100"/>SMA 100
                </label>
                <label>
                    <input type="checkbox" onChange={this.handleChange} id="SMA 50"/>SMA 50
                </label>
                <label>
                    <input type="checkbox" onChange={this.handleChange} id="EMA 100"/>EMA 100
                </label>
                <label>
                    <input type="checkbox" onChange={this.handleChange} id="EMA 50"/>EMA 50
                </label>
            </form>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
    }
    

	componentDidMount(){
        var chart = this.chart;
        var name = this.props[0];
        console.log(this.props[0]);



		fetch(`/api/prices/${name}`)
		.then(function(response) {
			return response.json();
		})
		.then(function(data) {
            if(data.status==="FAILED")
            {
                stock_exists=false;
                alert("Please enter valid stock symbol");
            }
            else
            {
                stock_exists=true;
                chart.options.title.text = name;
                chart.options.data[0].name = "price";

                let api_res = data['timestamp'].map((ele, index) => {
                    return [new Date(ele), data['prices'][index]];
                });

                api_res.sort((a, b) => a[0]-b[0]);
                console.log(api_res);

                for(let i=0; i<api_res.length; i++)
                {
                    chart.options.data[0].dataPoints.push({     
                        x: api_res[i][0],
                        y: api_res[i][1]
                    });
                }

                
                chart.options.data[0].dataPoints.reverse();
                chart.render(); 
            }
            
        })
        .catch(err => console.log(err));
    }


    componentDidUpdate(prevProp){
        if(prevProp[0]!==this.props[0])
        {
            document.getElementById("SMA 100").checked = false;
            document.getElementById("SMA 50").checked = false;
            document.getElementById("EMA 100").checked = false;
            document.getElementById("EMA 50").checked = false;
            this.chart.options.data = [];
            this.chart.options.data.name = this.props[0];
            this.chart.options.title.text = this.props[0];
            console.log(this.chart.options.data)
            var chart = this.chart;
            let properties = {
                type: "line",
                name: this.props[0],
                showInLegend: true,
                yValueFormatString: "$##0.00",
                xValueType: "dateTime",
                dataPoints: []
            }
            fetch(`/api/prices/${this.props[0]}`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if(data.status==="FAILED")
                {
                    stock_exists=false;
                    alert("Please enter valid stock symbol");
                }
                else
                {
                    stock_exists=true;
                    let api_res = data['timestamp'].map((ele, index) => {
                        return [new Date(ele), data['prices'][index]];
                    });
    
                    api_res.sort((a, b) => a[0]-b[0]);
                    console.log(api_res);
    
                    for(let i=0; i<api_res.length; i++)
                    {
                        properties.dataPoints.push({       
                            x: api_res[i][0],
                            y: api_res[i][1]
                        });
                    }
                    dataPoints.reverse();
                    chart.addTo("data",properties);
                    chart.render();
                }
                
            });
        }
        
	}
}
export default ChartDrawer;