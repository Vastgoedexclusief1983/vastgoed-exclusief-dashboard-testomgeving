import html2canvas from 'html2canvas';

export interface ChartImages {
  pieChart: string | null;
  barChart: string | null;
}

export async function captureCharts(containerSelector: string): Promise<ChartImages> {
  const result: ChartImages = {
    pieChart: null,
    barChart: null,
  };

  try {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn('Charts container not found');
      return result;
    }

    const chartContainers = container.querySelectorAll('.chart-container');

    for (let i = 0; i < chartContainers.length; i++) {
      const chartEl = chartContainers[i] as HTMLElement;
      if (!chartEl) continue;

      try {
        const canvas = await html2canvas(chartEl, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true,
        });

        const dataUrl = canvas.toDataURL('image/png');

        if (i === 0) {
          result.pieChart = dataUrl;
        } else if (i === 1) {
          result.barChart = dataUrl;
        }
      } catch (err) {
        console.error(`Error capturing chart ${i}:`, err);
      }
    }
  } catch (error) {
    console.error('Error capturing charts:', error);
  }

  return result;
}
