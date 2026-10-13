import ReactECharts from "echarts-for-react";

function BarChart({ option }: { option: Record<string, unknown> }) {
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
    return (
        <>
            <ReactECharts
                option={option}
                style={{ height: 400 }}
            />
        </>
    );
}

export default BarChart
