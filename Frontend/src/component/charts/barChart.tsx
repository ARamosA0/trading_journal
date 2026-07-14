import { useState } from 'react'
import ReactECharts from "echarts-for-react";

type BarChartOption = {
    title: any,
    tooltip: any,
    xAxis: any,
    yAxis: any,
    series: any
}

function BarChart( data: any ) {
    // const option = {
    //     title: {
    //         text: "Trades por Mes",
    //     },
    //     tooltip: {},
    //     xAxis: {
    //         data: ["Ene", "Feb", "Mar", "Abr", "May"],
    //     },
    //     yAxis: {},
    //     series: [
    //         {
    //             name: "Trades",
    //             type: "bar",
    //             data: [20, 15, 35, 28, 42],
    //         },
    //     ],
    // };
    console.log('DATA',data)

    return (
        <>
            <ReactECharts
                option={data}
                style={{ height: 400 }}
            />
        </>
    );
}

export default BarChart