document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('historyChart').getContext('2d');
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    const data = {
        labels: ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"],
        datasets: [
            {
                label: 'Average Emotions',
                data: [
                    averages.avg_angry,
                    averages.avg_disgust,
                    averages.avg_fear,
                    averages.avg_happy,
                    averages.avg_neutral,
                    averages.avg_sad,
                    averages.avg_surprise
                ],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(41, 42, 43, 0.2)",
                  ],
                  borderColor: [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(88, 87, 87)",
                  ],
            }
        ]
    };

    const pieData = {
        labels: ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"],
        datasets: [
            {
                label: 'Average Emotions',
                data: [
                    averages.avg_angry * 100,
                    averages.avg_disgust * 100,
                    averages.avg_fear * 100,
                    averages.avg_happy * 100,
                    averages.avg_neutral * 100,
                    averages.avg_sad * 100,
                    averages.avg_surprise * 100
                ],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(41, 42, 43, 0.2)",
                ],
                borderColor: [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(88, 87, 87)",
                ],
                borderWidth: 1,
            }
        ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    const pieConfig = {
        type: 'pie',
        data: pieData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${parseInt(value)}%`;
                        }
                    }
                }
            }
        }
    };

    const historyChart = new Chart(ctx, config);
    const pieChart = new Chart(pieCtx, pieConfig);
});