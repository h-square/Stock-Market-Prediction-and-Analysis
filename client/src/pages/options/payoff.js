import CanvasJSReact  from './canvasjs.react';

var React = require('react');
var Component = React.Component;
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var dataPoints =[];

CanvasJS.addColorSet("colors",["#0000FF","#DC143C","#7FFF00","#FF69B4","#006400"])

class payoff extends Component {
    
    
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
                title: "Stock Price",
                valueFormatString: "$###",
                includeZero : false
			},
			axisY: {
				title: "Payoff (Profit or Loss)",
				titleFontFamily: "calibri",
				includeZero: false,
				prefix: "$"
			},
			data: [{
                type: "line",
				name: "",
				showInLegend: true,
				yValueFormatString: "$###",
    			dataPoints: dataPoints
			}]
		}

       

		return (
		<div>
			<CanvasJSChart options = {options}
				 onRef={ref => this.chart = ref}
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
    }
    

	componentDidMount(){
        var chart = this.chart;
        var ans = this.props[0];
        var startPrice = parseFloat(this.props[1]);
        var endPrice = parseFloat(this.props[2]);

        console.log(ans,startPrice,endPrice)

        for(var i=0;i<ans.length;i++)
        {
            chart.options.data[0].dataPoints.push({
                x : startPrice + i,
                y : parseFloat(ans[i]) 
            })
        }
        chart.render();
    }

    componentDidUpdate(){
        var chart = this.chart;
        var ans = this.props[0];
        var startPrice = parseFloat(this.props[1]);
        var endPrice = parseFloat(this.props[2]);

        console.log(ans,startPrice,endPrice)
        chart.options.data[0].dataPoints = []
        for(var i=0;i<ans.length;i++)
        {
            chart.options.data[0].dataPoints.push({
                x : startPrice + i,
                y : parseFloat(ans[i]) 
            })
        }
        chart.render();
    }

}
export default payoff;