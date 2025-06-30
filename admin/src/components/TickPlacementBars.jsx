// src/components/TickPlacementBars.jsx

import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { BarChart } from '@mui/x-charts/BarChart';

// You can replace this with your actual data
const dataset = [
  { month: 'Jan', seoul: 50 },
  { month: 'Feb', seoul: 80 },
  { month: 'Mar', seoul: 45 },
  { month: 'Apr', seoul: 60 },
  { month: 'May', seoul: 90 },
];

const valueFormatter = (value) => `${value} mm`;

const TickParamsSelector = ({
  tickPlacement,
  tickLabelPlacement,
  setTickPlacement,
  setTickLabelPlacement,
}) => {
  return (
    <Stack direction="column" spacing={3} sx={{ width: '100%', mb: 4 }}>
      <FormControl>
        <FormLabel>Tick Placement</FormLabel>
        <RadioGroup
          row
          value={tickPlacement}
          onChange={(e) => setTickPlacement(e.target.value)}
        >
          <FormControlLabel value="start" control={<Radio />} label="Start" />
          <FormControlLabel value="middle" control={<Radio />} label="Middle" />
          <FormControlLabel value="end" control={<Radio />} label="End" />
          <FormControlLabel value="extremities" control={<Radio />} label="Extremities" />
        </RadioGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Tick Label Placement</FormLabel>
        <RadioGroup
          row
          value={tickLabelPlacement}
          onChange={(e) => setTickLabelPlacement(e.target.value)}
        >
          <FormControlLabel value="tick" control={<Radio />} label="Tick" />
          <FormControlLabel value="middle" control={<Radio />} label="Middle" />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
};

const chartSetting = {
  yAxis: [
    {
      label: 'Rainfall (mm)',
      width: 80,
    },
  ],
  series: [{ dataKey: 'seoul', label: 'Seoul Rainfall', valueFormatter }],
  height: 300,
};

const TickPlacementBars = () => {
  const [tickPlacement, setTickPlacement] = useState('middle');
  const [tickLabelPlacement, setTickLabelPlacement] = useState('middle');

  return (
    <div className="bg-white p-5 rounded-lg shadow-md w-full max-w-2xl mx-auto">
      {/* Optional: Allow user to change tick placement */}
      <TickParamsSelector
        tickPlacement={tickPlacement}
        tickLabelPlacement={tickLabelPlacement}
        setTickPlacement={setTickPlacement}
        setTickLabelPlacement={setTickLabelPlacement}
      />

      <BarChart
        dataset={dataset}
        xAxis={[{ dataKey: 'month', tickPlacement, tickLabelPlacement }]}
        {...chartSetting}
      />
    </div>
  );
};

export default TickPlacementBars;
