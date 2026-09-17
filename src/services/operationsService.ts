import {
  dateFilters,
  subProjectOptions,
  kpiData,
  pipelineData,
  dailyThroughputData,
  turnaroundData,
  turnaroundBottleneck,
  slowestChart,
  chartAgingData,
  priorityData,
  priorityTotal,
  teamWorkloadData,
  reassignmentRate,
  insightData,
} from "../data/dashboardData";

export function getDateFilters() {
  return dateFilters;
}

export function getSubProjectOptions() {
  return subProjectOptions;
}

export function getOperationsKPIs() {
  return kpiData;
}

export function getPipelineData() {
  return pipelineData;
}

export function getDailyThroughputData() {
  return dailyThroughputData;
}

export function getTurnaroundData() {
  return {
    stages: turnaroundData,
    bottleneck: turnaroundBottleneck,
    slowestChart,
  };
}

export function getChartAgingData() {
  return chartAgingData;
}

export function getPriorityData() {
  return {
    data: priorityData,
    total: priorityTotal,
  };
}

export function getTeamWorkloadData() {
  return teamWorkloadData;
}

export function getReassignmentRate() {
  return reassignmentRate;
}

export function getOperationsInsights() {
  return insightData;
}
