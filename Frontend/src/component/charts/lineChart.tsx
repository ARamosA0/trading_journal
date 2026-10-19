import ReactECharts from "echarts-for-react";

type ChartData = {
    dataX: string[];
    dataY: number[];
    title?: string;
}

function LineChart( {dataX, dataY, title}: ChartData  ) {
    const option = {
    backgroundColor: "transparent",

    title: {
        text: title ?? "",
        left: "center",
        textStyle: {
            color: "#E5E7EB",
            fontSize: 18,
            fontWeight: 600,
        },
    },

    tooltip: {
        trigger: "axis",
        backgroundColor: "#1F2937",
        borderColor: "#374151",
        borderWidth: 1,
        textStyle: {
            color: "#fff",
        },
        valueFormatter: (value: number) => `${value >= 0 ? "+" : "-"}$${Math.abs(value).toFixed(2)}`,
        axisPointer: {
            type: "line",
        },
    },

    grid: {
        left: "5%",
        right: "4%",
        bottom: "5%",
        containLabel: true,
    },

    xAxis: {
        type: "category",
        data: dataX,
        boundaryGap: false,
        axisLine: {
            lineStyle: {
                color: "#374151",
            },
        },
        axisTick: {
            show: false,
        },
        axisLabel: {
            color: "#9CA3AF",
        },
    },

    yAxis: {
        type: "value",
        splitLine: {
            lineStyle: {
                color: "#2A2A2A",
                type: "dashed",
            },
        },
        axisLine: {
            show: false,
        },
        axisLabel: {
            color: "#9CA3AF",
        },
    },

    series: [
        {
            data: dataY,
            type: "line",

            smooth: true,

            symbol: "circle",
            symbolSize: 7,

             lineStyle: {
                 width: 3,
                 color: "#22D3EE",
             },

            itemStyle: {
                 color: "#22D3EE",
            },

            areaStyle: {
                    color: "rgba(34,211,238,.08)",
            },

            emphasis: {
                focus: "series",
            },
        },
    ],

    animationDuration: 1000,
};

    return (
        <>
            <ReactECharts
                option={option}
                style={{ height: 400 }}
            />
        </>
    );
}

export default LineChart
