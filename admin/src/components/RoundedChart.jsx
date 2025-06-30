import React, { useEffect, useState, useCallback } from 'react';
import {
    ResponsiveContainer,
    PieChart, Pie, Cell,
    Tooltip
} from 'recharts';

// 🔥 Memoized Component to avoid unnecessary re-renders
const RoundedChart = React.memo(({ data }) => {

    const [radius, setRadius] = useState({ outer: 60, inner: 30 });
    const [loading, setLoading] = useState(true);

    // ✅ Debounce Function
    const debounce = (func, delay) => {
        let timeout;
        return () => {
            clearTimeout(timeout);
            timeout = setTimeout(func, delay);
        };
    };

    // ✅ Update radius based on screen size
    const updateRadius = useCallback(() => {
        if (window.innerWidth < 640) {
            setRadius({ outer: 70, inner: 50 });
        } else if (window.innerWidth < 768) {
            setRadius({ outer: 80, inner: 60 });
        } else {
            setRadius({ outer: 100, inner: 80 });
        }
    }, []);

    // ✅ Attach debounced resize listener
    useEffect(() => {
        updateRadius();
        const handleResize = debounce(updateRadius, 300);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [updateRadius]);

    // ✅ Handle loading state
    useEffect(() => {
        if (data && data.length > 0) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [data]);

    // ✅ Loader if data not ready
    if (loading) return <p className='text-center text-gray-500'>Loading chart...</p>;

    return (
        <div className='border-2 border-gray-300 rounded-lg p-5 shadow-md bg-white mt-10 text-center flex flex-col sm:justify-center'>
            <div className='w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] mx-auto'>
                <h1>Net Profit vs Cost </h1>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            dataKey="value"
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={radius.outer}
                            innerRadius={radius.inner}
                            label
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* ✅ Dynamic Legend */}
            <div className='flex gap-6 mt-5 flex-row items-center justify-center'>
                {data.map((entry, index) => (
                    <div key={index} className='flex items-center gap-2'>
                        <div className='w-3 h-3 rounded-full' style={{ backgroundColor: entry.color }}></div>
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default RoundedChart;
