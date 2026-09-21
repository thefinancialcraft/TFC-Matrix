'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function GaugeChart({ percent }: { percent: number }) {
  const data = [
    { name: 'Achieved', value: percent },
    { name: 'Remaining', value: 100 - percent }
  ]
  const COLORS = ['#8B5CF6', '#1F242F']

  return (
    <div className="relative h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={90}
            outerRadius={110}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
            cornerRadius={100}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white leading-none">{percent}%</span>
        <span className="text-sm text-[#8B949E] mt-1">Target Met</span>
      </div>
    </div>
  )
}
